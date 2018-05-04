var express = require('express');
var router = express.Router();
var http = require("http");
var url = require("url");

//GET employeeIndex page.
router.get('/', function(req, res) {
    if(req.session.passport == undefined){
        res.redirect('/logout');
    }else{
        res.render('employeeIndex', { title: 'Training Tracking', roles: 'employee', username:req.session.passport.user.username});
    }
});

module.exports = router;
