/**
 * Created by talon.chu on 2017-04-14.
 */
var express = require('express');
var router = express.Router();
var http = require("http");
var url = require("url");

/* GET adminIndex page. */
router.get('/', function(req, res) {
    if(req.session.passport == undefined){
        res.redirect('/logout');
    }else{
        res.render('employeeIndex', { title: 'Training Tracking', roles: 'approver', username:req.session.passport.user.username});
    }
});
/* approver view scanning */
router.get('/approve/viewScanning/viewFile', function(req, res) {
    console.log(req.url.split('=')[1])
    res.render('viewFile',{fileName:req.url.split('=')[1]});
});

module.exports = router;