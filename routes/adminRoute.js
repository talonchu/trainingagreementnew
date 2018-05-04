var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var ApplicationEntity = require('../models/Application').ApplicationEntity;
var CommentsEntity = require('../models/Comments').CommentsEntity;
//send mail
var MailUtil = require('../models/EmailUtil');
var Message = require('../models/MessageUtil');
var TimeUtil = require('../models/TimeUtil');


//admin accept and update status
router.get('/:_id/accept', function (req, res) {
    var system_url = 'http://'+req.headers.host+'/#/approverlist?rec_id='+req.params._id;
    var employee_url = 'http://'+ req.headers.host +'/#/employeelist?rec_id='+req.params._id;

    ApplicationEntity.update({"_id": req.params._id},{$set: {"STATUS":"Pending","SERVICE_PERIOD_FROM":req.query.serviceFrom,"SERVICE_PERIOD_TO":req.query.serviceTo,"COMPANY_COVER":req.query.companyCover,"COMMENTED":1,"REJECT_NOTES":req.query.comments}},{"multi" : false,"upsert" : false}, function (err, info) {
        if (err) {
            console.log(err);
            return;
        }
        if (info) {
            var emp_name = req.query.EMP_NAME;
            var message_to_employee = Message.Message(emp_name,employee_url,"template2");
            new MailUtil().sendMail(message_to_employee);
            var message_to_admin = Message.Message(emp_name,system_url,"template3");
            new MailUtil().sendMail(message_to_admin);
            if(req.query.comments && req.query.comments != '' && req.query.comments != ' '){
                var dataJson = new CommentsEntity({"DATA_ID": req.params._id,"HISTORY_COMMENT": req.query.comments,"CREATE_BY": req.query.CREATE_BY,"CREATE_DATE":TimeUtil.formatDate(new Date())});
                dataJson.save(
                    function (err, saved) {
                        if (err || !saved)
                            console.log("fail");
                        else{
                            console.log("success");
                        }
                    });
            }
            res.json(info);
            return;
        }
    });
})

//admin reject and update status
router.get('/:_id/reject', function (req, res) {
    var employee_url = 'http://'+ req.headers.host +'/#/employeelist?rec_id='+req.params._id;
    ApplicationEntity.update({"_id": req.params._id},{$set: {"STATUS":"Rejected","COMMENTED":1,"REJECT_NOTES":req.query.comments}},{"multi" : false,"upsert" : false}, function (err, info) {
        if (err) {
            console.log(err)
            return;
        }
        if (info) {
            var emp_name = req.query.EMP_NAME;
            var message = Message.Message(emp_name,employee_url,"template4");
            new MailUtil().sendMail(message);
            if(req.query.comments && req.query.comments != '' && req.query.comments != ' '){
                var dataJson = new CommentsEntity({"DATA_ID": req.params._id,"HISTORY_COMMENT": req.query.comments,"CREATE_BY": req.query.CREATE_BY,"CREATE_DATE":TimeUtil.formatDate(new Date())});
                dataJson.save(
                    function (err, saved) {
                        if (err || !saved)
                            console.log("fail");
                        else{
                            console.log("success");
                                                   }
                    });
            }
            res.json(info);
            return;
        }
    });
});

//admin updates status to finish
router.get('/:_id/finish', function (req, res) {
    ApplicationEntity.update({"_id": req.params._id},{$set: {"STATUS":"Finished"}},{"multi" : false,"upsert" : false}, function (err, info) {
        if (err) {
            console.log(err)
            return;
        }
        if (info) {
            res.json(info);
            return;
        }
    });
});

//admin show lists
router.post('/getFirstPage',function (req,res) {
    var status = req.query.status;
    if(status === 'Submitted'){
        ApplicationEntity.find({'STATUS': {'$in': [status]}},function (err,APPLICATION) {
            if(err){
                console.log('error')
            }else{
                res.json(APPLICATION);
            }
        }).sort({"CREATE_DATE":-1});
    }
    if(status === 'InProgress'){
        var date = new Date();
        ApplicationEntity.find({'STATUS': {'$ne': ['Finished']}},function (err,APPLICATION) {
            if(err){
                console.log('error')
            }else{
                var list = new Array();
                for(var i = 0; i < APPLICATION.length; i++){
                    var service_period_to = APPLICATION[i].SERVICE_PERIOD_TO;
                    var d = new Date(Date.parse(service_period_to.replace(/-/g, "/")));
                    var d_time = d.getTime();
                    if(date < d_time || date === d_time){
                        list.push(APPLICATION[i])
                    }
                }
                console.log(list.length)
                res.json(list);
            }
        }).sort({"CREATE_DATE" : -1});
    }
    if(status === 'Active'){
        var date = new Date();
        ApplicationEntity.find({'STATUS': {'$ne': [status]}},function (err,APPLICATION) {
            if(err){
                console.log('error')
            }else{
                var list = new Array();
                for(var i = 0; i < APPLICATION.length; i++){
                    var service_period_to = APPLICATION[i].SERVICE_PERIOD_TO;
                    var d = new Date(Date.parse(service_period_to.replace(/-/g, "/")));
                    var d_time = d.getTime();
                    if(date < d_time || date === d_time){
                        list.push(APPLICATION[i])
                    }
                }
                console.log(list.length)
                res.json(list);
            }
        }).sort({"CREATE_DATE" : -1});
    }
    if(status === 'All'){
        ApplicationEntity.find(function (err,APPLICATION) {
            if(err){
                console.log('error')
            }else{
                res.json(APPLICATION);
            }
        }).sort({"CREATE_DATE" : -1});
    }
});

//Get application by id
router.post('/:_id/getApplication', function (req, res) {
    var query = ApplicationEntity.find({"_id": req.params._id});
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
