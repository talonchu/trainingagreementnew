var express = require('express');
var fs = require('fs');
const userConfigPath = 'conf/conf.properties';
var conf = {};
//parse properties file from url
var parseproperties =function (uri, encode) {
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
var Message = function (emp_name,system_url,template) {
    /*var to = "talon.chu@perficient.com"*/
    conf = parseproperties(userConfigPath);
    var regName = /\w*\.{1}\w*/g;
    var admins = conf.user_admin.toString().match(/\w*\.{1}\w*/g);
    var approvers = conf.user_approver.toString().match(/\w*\.{1}\w*/g);
    var to_admin = '';
    var to_approver = '';
    var system_link = system_url;
    admins.forEach(function (admin) {
        to_admin += (admin + '@perficient.com,');
    });
    approvers.forEach(function (approver) {
        to_approver += (approver + '@perficient.com,');
    });
    if(template === "template1"){
        return{
            from: 'TrainingAgreement TrainingAgreement@perficient.com',
            to: to_admin,
            subject: emp_name + ' submitted a training agreement',
            html: 'Hi, '+'<br/><br/>'+ emp_name + ' submitted a training agreement, click <a href="' + system_link + '">here</a> to view the detail.<br/><br/>Thank you,<br/>Perficient Training Agreement'
        }
    }
    if(template === "template2"){
        return{
            from: 'TrainingAgreement TrainingAgreement@perficient.com',
            to: emp_name + "@perficient.com",
            subject: 'Your training agreement has been accepted' ,
            html: 'Hi,'+emp_name + '<br/><br/>Your training agreement has been accepted, click <a href="' + system_link + '">here</a> to view the detail.<br/><br/>Thank you,<br/>Perficient Training Agreement'
        }
    }
    if(template === "template3"){
        return{
            from: 'TrainingAgreement TrainingAgreement@perficient.com',
            to: to_approver,
            subject: 'Training agreement submitted by '+ emp_name +' has been accepted' ,
            html: 'Hi,' + '<br/><br/>Training agreement submitted by '+ emp_name +' was accepted by admin, click <a href="' + system_link + '">here</a> to view the detail.<br/><br/>Thank you,<br/>Perficient Training Agreement'
        }
    }
    if(template === "template4"){
        return{
            from: 'TrainingAgreement TrainingAgreement@perficient.com',
            to: emp_name + "@perficient.com",
            subject: 'Your training agreement has been rejected' ,
            html: 'Hi,'+ emp_name + '<br/><br/>Your training agreement has been rejected, click <a href="' + system_link + '">here</a> to view the detail.<br/><br/>Thank you,<br/>Perficient Training Agreement'
        }
    }
    if(template === "template5"){
        return{
            from: 'TrainingAgreement TrainingAgreement@perficient.com',
            to: emp_name + "@perficient.com",
            subject: 'Your training agreement has been approved' ,
            html: 'Hi,'+ emp_name + '<br/><br/>Your training agreement has been approved, click <a href="' + system_link + '">here</a> to view the detail.<br/><br/>Thank you,<br/>Perficient Training Agreement'
        }
    }
    if(template === "template6"){
        return{
            from: 'TrainingAgreement TrainingAgreement@perficient.com',
            to: to_admin,
            subject: 'Training agreement submitted by '+ emp_name +' has been disapproved' ,
            html: 'Hi,' + '<br/><br/>Training agreement submitted by '+ emp_name +' has been disapproved by approver, click <a href="' + system_link + '">here</a> to view the detail.<br/><br/>Thank you,<br/>Perficient Training Agreement'
        }
    }
    if(template === "template7"){
        return{
            from: 'TrainingAgreement TrainingAgreement@perficient.com',
            to: emp_name + "@perficient.com",
            subject: 'Your training agreement has been disapproved' ,
            html: 'Hi,'+ emp_name + '<br/><br/>Your training agreement has been disapproved by approver, click <a href="' + system_link + '">here</a> to view the detail.<br/><br/>Thank you,<br/>Perficient Training Agreement'
        }
    }
    if(template === "template8"){
        return{
            from: 'TrainingAgreement TrainingAgreement@perficient.com',
            to: to_admin,
            subject: emp_name + ' resubmitted a training agreement' ,
            html: 'Hi,' + '<br/><br/>'+ emp_name + ' resubmitted a training agreement, click <a href="' + system_link + '">here</a> to view the detail.<br/><br/>Thank you,<br/>Perficient Training Agreement'
        }
    }
}

var sendRefundFee = function (service_from,service_to,separationDate,emp_name,companyCover,refundFee,program) {
    conf = parseproperties(userConfigPath);
    var accountants = conf.user_accountant.toString().match(/\w*\.{1}\w*/g);
    var to_accountant = '';
    accountants.forEach(function (accountant) {
        to_accountant += (accountant + '@perficient.com,');
    });
    return{
        from: 'TrainingAgreement TrainingAgreement@perficient.com',
        to: to_accountant,
        subject: emp_name + ' Refund Fee.' ,
        html: 'Hi,' + '<br/><br/>'+ emp_name + ' should pay refund fee: '+ refundFee +' CNY<br/><br/>Company Cover Fee: '+companyCover+' CNY<br/><br/>Related Training Program: '+program+'<br/><br/>Service Date: '+service_from+' - '+service_to+'<br/><br/>Leave Date: '+separationDate+'<br/><br/><br/>Thank you,<br/>Perficient Training Agreement'
    }
}


exports.Message = Message;
exports.sendRefundFee = sendRefundFee;