var express = require('express');
var router = express.Router();
var ApplicationEntity = require('../models/Application').ApplicationEntity;
var CommentsEntity = require('../models/Comments').CommentsEntity;
var EMP_NAME = null;
var multiparty = require('connect-multiparty')
var multipartyMiddleware = multiparty()
var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
//send mail
var MailUtil = require('../models/EmailUtil');
var Message = require('../models/MessageUtil');
var TimeUtil = require('../models/TimeUtil');

/*get mylist from databse*/
router.get('/:EMP_ID/:EMP_NAME', function (req, res, next) {
    EMP_NAME = req.params.EMP_NAME;
    ApplicationEntity.find({EMP_ID: req.params.EMP_ID}, function (err, Application) {
        if (err) {
            res.render('error', {error: "Error"});
            return;
        }
        if (Application) {
            res.json(Application);
            return;
        }
    }).sort({"CREATE_DATE":-1});
});
router.get('/:EMP_ID/:EMP_NAME/:DATA_ID/comment', function (req, res, next) {
    CommentsEntity.find({DATA_ID: req.params.DATA_ID}, function (err, Comments) {
        if (err) {
            res.render('error', {error: "Error"});
            return;
        }
        if (Comments) {
            console.log(Comments);
            res.json(Comments);
            return;
        }
    });
});
router.post('/:modifiedData/update', multipartyMiddleware, function (req, res) {
    var dataJson = req.body.application;
    var newFiles = req.body.fileNames;
    if(!newFiles){
        ApplicationEntity.update({"_id": dataJson._id}, {
                $set: {
                    "STATUS": 'Submitted',
                    "CHINESE_NAME": dataJson.CHINESE_NAME,
                    "IDENTIFICATION": dataJson.IDENTIFICATION,
                    "TRAINING_INSTITUTION": dataJson.TRAINING_INSTITUTION,
                    "TRAINING_PROGRAM": dataJson.TRAINING_PROGRAM,
                    "TOTAL_COST": dataJson.TOTAL_COST,
                    "COMPANY_COVER": '',
                    "SCANNING": dataJson.SCANNING,
                    "TRAINING_PERIOD_FROM": dataJson.TRAINING_PERIOD_FROM,
                    "TRAINING_PERIOD_TO": dataJson.TRAINING_PERIOD_TO,
                    "REASON":dataJson.REASON
                }
            },
            {"multi": false, "upsert": false},
            function (err, saved) {
                if (err || !saved)
                    res.end("Application not saved");
                else {
                    res.end("Application saved");
                    var system_url = 'http://'+req.headers.host+'/#/alllist?rec_id='+saved._id;
                    var emp_name = req.body.application.EMP_NAME;
                    var message = Message.Message(emp_name, system_url, "template8");
                    new MailUtil().sendMail(message);
                }
            });
    }else{
        var scanningNameNew = '';
        for(var i = 0; i < req.body.fileNames.length; i++){
            var type = req.body.fileNames[i].split('.')[1];
            var timestamp = Date.now();
            var newName = String(i) + timestamp + '.' + type;
            fs.renameSync('../../scannings/'+req.body.fileNames[i],'../../scannings/'+newName);
            if(i < req.body.fileNames.length-1){
                scanningNameNew += (newName+',');
            }else
                scanningNameNew += newName;
        }
        var scanningNameOld = dataJson.SCANNING;
        if (scanningNameOld !== undefined) {
            for (var i = 0; i < scanningNameOld.length; i++) {
                scanningNameNew += (',' + scanningNameOld[i]);
            }
        }
        ApplicationEntity.update({"_id": dataJson._id}, {
                $set: {
                    "STATUS": 'Submitted',
                    "CHINESE_NAME": dataJson.CHINESE_NAME,
                    "IDENTIFICATION": dataJson.IDENTIFICATION,
                    "TRAINING_INSTITUTION": dataJson.TRAINING_INSTITUTION,
                    "TRAINING_PROGRAM": dataJson.TRAINING_PROGRAM,
                    "TOTAL_COST": dataJson.TOTAL_COST,
                    "COMPANY_COVER": '',
                    "SCANNING": scanningNameNew,
                    "TRAINING_PERIOD_FROM": dataJson.TRAINING_PERIOD_FROM,
                    "TRAINING_PERIOD_TO": dataJson.TRAINING_PERIOD_TO,
                    "REASON":dataJson.REASON
                }
            },
            {"multi": false, "upsert": false},
            function (err, saved) {
                if (err || !saved)
                    res.end("Application not saved");
                else {
                    res.end("Application saved");
                    var system_url = 'http://'+req.headers.host+'/#/alllist?rec_id='+saved._id;
                    var emp_name = req.body.application.EMP_NAME;
                    var message = Message.Message(emp_name, system_url, "template8");
                    new MailUtil().sendMail(message);
                }
            });
    }
    res.end('saved');
});

router.post('/:addInfo/save', multipartyMiddleware, function (req, res, next) {
    //new a folder to store scannings(use sync to new the folder first)
    if (req.files.file) {
        mkdirp.sync('../../scannings');
        if(Object.prototype.toString.call(req.files.file) == '[object Object]'){
            var scanning = req.files.file;
            var filePath = scanning.path;
            var originalFilename = scanning.originalFilename;
            if (originalFilename !== '') {
                var data = fs.readFileSync(filePath);
                var newPath = path.join(__dirname, '../../', '/scannings/' + originalFilename);
                //use sync to make sure that save scannings one by one
                fs.writeFileSync(newPath, data)
            } else {
                console.log('file null')
            }
        }else{
            for (var i = 0; i < req.files.file.length; i++) {
                var scanning = req.files.file[i];
                var filePath = scanning.path;
                var originalFilename = scanning.originalFilename;
                if (originalFilename !== '') {
                    var data = fs.readFileSync(filePath);
                    var newPath = path.join(__dirname, '../../', '/scannings/' + originalFilename);
                    //use sync to make sure that save scannings one by one
                    fs.writeFileSync(newPath, data)
                } else {
                    console.log('file null')
                }
            }
        }
    }
    res.json({"status":"saved"});
});
//init employee's first page lists
router.post('/first/:EMP_ID', function (req, res, next) {
    var query = ApplicationEntity.find({'EMP_ID': req.params.EMP_ID}).sort({"CREATE_DATE":-1});
    query.exec(function (error, Application) {
        if (error) {
            res.render('error', {error: "Error"});
            return;
        } else {
            res.json(Application);
            return;
        }
    });
});
//rename scanning name
router.post('/renameFiles/:application', function (req, res, next) {
    var scanningName = '';
    if(req.body.fileNames){
        for(var i = 0; i < req.body.fileNames.length; i++){
            var type = req.body.fileNames[i].split('.')[1];
            var timestamp = Date.now();
            var newName = String(i) + timestamp + '.' + type;
            fs.renameSync('../../scannings/'+req.body.fileNames[i],'../../scannings/'+newName);
            if(i < req.body.fileNames.length-1){
                scanningName += (newName+',');
            }else
                scanningName += newName;
        }
    }
    var dataJson = new ApplicationEntity(JSON.parse(req.params.application));
    dataJson.SCANNING = scanningName;
    dataJson.STATUS = 'Submitted';
    dataJson.save(
        function (err, saved) {
            if (err || !saved)
                res.end("Application not saved");
            else {
                var system_url = 'http://'+req.headers.host+'/#/alllist?rec_id='+saved._id;
                var emp_name = saved.EMP_NAME;
                var message = Message.Message(emp_name, system_url, "template1");
                new MailUtil().sendMail(message);
                res.end("Application saved");
            }
        });
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
