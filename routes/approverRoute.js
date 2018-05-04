/**
 * Created by talon.chu on 2017-04-14.
 */
var express = require('express');
var router = express.Router();
var ApplicationEntity = require('../models/Application').ApplicationEntity;
var CommentsEntity = require('../models/Comments').CommentsEntity;
var fs = require('fs');
var path = require('path')
var EMP_NAME = null;
//send mail
var MailUtil = require('../models/EmailUtil');
var Message = require('../models/MessageUtil');
var TimeUtil = require('../models/TimeUtil');

//approve approve the agreement
router.post('/:_id/approved',function (req,res) {
    var employee_url = 'http://'+ req.headers.host +'/#/employeelist?rec_id='+req.params._id;
    ApplicationEntity.update({"_id": req.params._id},{$set: {"STATUS":"Approved","COMMENTS":req.query.COMMENTS}},{"multi" : false,"upsert" : false}, function (err, APPLICATION) {
        if (err) {
            res.end('approve failed');
            return;
        }
        if (APPLICATION) {
            var emp_name = req.query.EMP_NAME;
            var message = Message.Message(emp_name,employee_url,"template5");
            console.log(message)
            new MailUtil().sendMail(message);
            if(req.query.COMMENTS && req.query.COMMENTS != '' && req.query.COMMENTS != ' '){
                var dataJson = new CommentsEntity({"DATA_ID": req.params._id,"HISTORY_COMMENT": req.query.COMMENTS,"CREATE_BY": req.query.CREATE_BY,"CREATE_DATE":TimeUtil.formatDate(new Date())});
                dataJson.save(
                    function (err, saved) {
                        if (err || !saved)
                            console.log("fail");
                        else{
                            console.log("success");
                        }
                    });
            }
            res.json(APPLICATION);
            return;
        }
    });
})
//approver reject and update status
router.post('/:_id/reject', function (req, res) {
    var admin_url = 'http://'+ req.headers.host +'/#/alllist?rec_id='+req.params._id;
    var employee_url = 'http://'+ req.headers.host +'/#/employeelist?rec_id='+req.params._id;
    ApplicationEntity.update({"_id": req.params._id},{$set: {"STATUS":"Disapproved","COMMENTS":req.query.COMMENTS}},{"multi" : false,"upsert" : false}, function (err, APPLICATION) {
        if (err) {
            res.end('reject failed')
            return;
        }
        if (APPLICATION) {
            var emp_name = req.query.EMP_NAME;
            var message_to_admin = Message.Message(emp_name,admin_url,"template6");
            new MailUtil().sendMail(message_to_admin);
            var message_to_employee = Message.Message(emp_name,employee_url,"template7");
            new MailUtil().sendMail(message_to_employee);
            if(req.query.COMMENTS && req.query.COMMENTS != '' && req.query.COMMENTS != ' '){
                var dataJson = new CommentsEntity({"DATA_ID": req.params._id,"HISTORY_COMMENT": req.query.COMMENTS,"CREATE_BY": req.query.CREATE_BY,"CREATE_DATE":TimeUtil.formatDate(new Date())});
                dataJson.save(
                    function (err, saved) {
                        if (err || !saved)
                            console.log("fail");
                        else{
                            console.log("success");
                        }
                    });
            }
            res.json(APPLICATION);
            return;
        }
    });
})
//approver get the first page
router.post('/getFirstPage/first', function (req, res) {
    var status = req.query.status;
    var query = ApplicationEntity.find({'STATUS': {'$in': [status]}}).sort({"SERVICE_PERIOD_TO" : 1}).sort({"CREATE_DATE" : -1})
    query.exec(function (err, Application) {
        if (err) {
            res.end('get total ERROR');
        } else {
            res.json(Application);
            return
        }
    })
});
//get proposer's scannings
router.post('/getScannings/:_id', function (req, res) {
    ApplicationEntity.find({"_id": req.params._id}, function (err, APPLICATION) {
        if (err) {
            res.end(" get scannings error");
        } else {
            var scannings = APPLICATION[0].SCANNING;
            if(scannings){
                var src = APPLICATION[0].SCANNING.split(',');
                var srcLists = new Array();
                for (var i = 0; i < src.length; i++) {
                    srcLists[i] = src[i];
                }
                res.json(srcLists);
            }else
                res.json('');
        }
    });
})
//view scanning
router.post('/viewScanning/:filename', function (req, res) {
    var fileType = req.params.filename.split('.')[1];
    var filePath = path.join(__dirname,'../../','scannings/' + req.params.filename);
    var file = fs.readFile(filePath,function (err,file) {
        if(err){
            res.end();
        }else{
            var scanning = new Buffer(file).toString('base64');
            res.end(scanning);
        }
    });
});

//Get application by id
router.post('/:_id/getApplication', function (req, res) {
    var query = ApplicationEntity.find({"_id": req.params._id}).sort({"CREATE_DATE" : -1});
    query.exec(function (err, Application) {
        if (err) {
            res.render('error', {error: "Error"});
            return;
        }
        if (Application) {
            res.json(Application[0]);
            return;
        }
    });
});

module.exports = router;