var express = require('express');
var router = express.Router();
var http = require("http");
var url = require("url");
var fs = require('fs');
const userConfigPath = 'conf/conf.properties';
var conf = {};
var systemInfo = {};
var adminlistString = [];
var approverlistString = [];
var accountantlistString = [];
var emailgrouptlistString = [];
//send mail
var MailUtil = require('../models/EmailUtil');
var Message = require('../models/MessageUtil');

/* GET adminIndex page. */
router.get('/', function (req, res) {
    if (req.session.passport == undefined) {
        res.redirect('/logout');
    } else {
        res.render('employeeIndex', {
            title: 'Training Tracking',
            roles: 'admin',
            username: req.session.passport.user.username
        });
    }
});
/* admin view scanning */
router.get('/approve/viewScanning/viewFile', function (req, res) {
    console.log(req.url.split('=')[1])
    res.render('viewFile', {fileName: req.url.split('=')[1]});
});
function getConfig() {
    conf = parseproperties(userConfigPath);
    var regName = /\w*\.{1}\w*/g;
    var admins = conf.user_admin.toString().match(/\w*\.{1}\w*/g);
    var approvers = conf.user_approver.toString().match(/\w*\.{1}\w*/g);
    var accountants = conf.user_accountant.toString().match(/\w*\.{1}\w*/g);
    var emailgroups = conf.email_group.toString().match(/[\w\d]+/g);
    var adminlist = new Array();
    var approverlist = new Array();
    var accountantlist = new Array();
    var emailgrouplist = new Array();
    admins.forEach(function (admin) {
        var ad = {};
        ad.name = admin;
        adminlist.push(ad);
    });
    approvers.forEach(function (approver) {
        var ap = {};
        ap.name = approver;
        approverlist.push(ap);
    });
    accountants.forEach(function (account) {
        var ac = {};
        ac.name = account;
        accountantlist.push(ac);
    });
    emailgroups.forEach(function (emailgroup) {
        var eg = {};
        eg.name = emailgroup;
        emailgrouplist.push(eg);
    });
    systemInfo.adminListJson = adminlist;
    systemInfo.approverListJson = approverlist;
    systemInfo.accountantlistJson = accountantlist;
    systemInfo.emailgrouptlist = emailgrouplist;
    return systemInfo;
}
function setConfig(adminlist, approverlist, accountantlist, emailgrouptlist) {
    conf = parseproperties(userConfigPath);
    adminlistString = [];
    approverlistString = [];
    accountantlistString = [];
    emailgrouptlistString = [];
    buildRoleString(adminlist, approverlist, accountantlist, emailgrouptlist);
    conf.user_admin = adminlistString;
    conf.user_approver = approverlistString;
    conf.user_accountant = accountantlistString;
    conf.email_group = emailgrouptlistString;
    var conf_new = 'authentication=' + conf.authentication + '\n' + 'cas_url=' + conf.cas_url + '\n' + 'mongodb_host=' + conf.mongodb_host + '\n' + 'mongodb_port=' + conf.mongodb_port + '\n' + 'user_admin=' + conf.user_admin + '\n' + 'user_approver=' + conf.user_approver + '\n' + 'user_accountant=' + conf.user_accountant + '\n' + 'email_group=' + conf.email_group + '\n';
    fs.writeFileSync(userConfigPath, conf_new);
}
/* admin system config */
router.get('/getconfiglist', function (req, res) {
    console.log(getConfig().adminListJson)
    res.json(getConfig());
});
/*admin update config*/
router.post('/updateSystemConfig', function (req, res) {
    var adminlistJson = req.query.adminlist;
    var approverlistJson = req.query.approverlist;
    var accountantlistJson = req.query.accountantlist;
    var emailgrouptlistJson = req.query.emailgrouptlist;
    setConfig(adminlistJson, approverlistJson, accountantlistJson, emailgrouptlistJson);
    res.end("success");
});
function parseproperties(uri, encode) {
    var encoding = encode == null ? 'UTF-8' : encode;
    try {
        var content = fs.readFileSync(uri, encoding);
        var regexjing = /\s*(#+)/;
        var regexkong = /\s*=\s*(.+)/;
        var keyvalue = {};
        var regexline = /.+/g;
        var arr_case;
        while (arr_case = regexline.exec(content)) {

            if (!regexjing.test(arr_case)) {
                keyvalue[arr_case.toString().split(regexkong)[0]] = arr_case.toString().split(regexkong)[1];
            }
        }
    } catch (e) {
        console.log("There is no parseperoperties file in " + uri.toString());
        return null;
    }
    return keyvalue;
}
function buildRoleString(adminlist, approverlist, accountantlist, emailgrouptlist) {
    adminlistString.push('[');
    if (adminlist.constructor !== Array) {
        adminlistString.push(JSON.parse(adminlist).name + "|")
    } else {
        adminlist.forEach(function (admin) {
            adminlistString.push(JSON.parse(admin).name + "|")
        })
    }
    adminlistString.push(']');
    adminlistString = adminlistString.toString().replace(/\,/g, '');
    approverlistString.push('[');
    if (approverlist.constructor !== Array) {
        approverlistString.push(JSON.parse(approverlist).name + '|')
    } else {
        approverlist.forEach(function (approver) {
            approverlistString.push(JSON.parse(approver).name + "|")
        })
    }
    approverlistString.push(']');
    approverlistString = approverlistString.toString().replace(/\,/g, '');
    accountantlistString.push('[');
    if (accountantlist.constructor !== Array) {
        accountantlistString.push(JSON.parse(accountantlist).name + '|')
    } else {
        accountantlist.forEach(function (accountant) {
            accountantlistString.push(JSON.parse(accountant).name + "|")
        })
    }
    accountantlistString.push(']');
    accountantlistString = accountantlistString.toString().replace(/\,/g, '');
    emailgrouptlistString.push('[');
    if (emailgrouptlist.constructor !== Array) {
        emailgrouptlistString.push(JSON.parse(emailgrouptlist).name + '|')
    } else {
        emailgrouptlist.forEach(function (emailgroup) {
            emailgrouptlistString.push(JSON.parse(emailgroup).name + "|")
        })
    }
    emailgrouptlistString.push(']');
    emailgrouptlistString = emailgrouptlistString.toString().replace(/\,/g, '');
}

//send refundFee
router.get('/sendEmail/refundFee', function (req, res) {
    var emp_name = req.query.EMP_NAME;
    var refundFee = req.query.refundFee;
    var program = req.query.TRAINING_PROGRAM;
    var service_from = req.query.service_from;
    var service_to = req.query.service_to;
    var separationDate = req.query.separationDate;
    var companyCover = req.query.companyCover;
    var refund_to = Message.sendRefundFee(service_from, service_to, separationDate, emp_name, companyCover, refundFee, program);
    new MailUtil().sendMail(refund_to);
    res.end();
});

module.exports = router;
