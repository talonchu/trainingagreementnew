var express = require('express');
var fs = require('fs');
var router = express.Router();
const userConfigPath = 'conf/conf.properties';
var passport = require('passport');


//parse properties file from url
var parseproperties = function (uri, encode) {
    var encoding = encode == null ? 'UTF-8' : encode;
    try {
        var content = fs.readFileSync(uri, encoding);
        var regexComment = /\s*(#+)/;
        var regexBlank = /\s*=\s*(.+)/;
        var keyvalue = {};
        var regexline = /.+/g;
        var arr_case;
        while (arr_case = regexline.exec(content)) {

            if (!regexComment.test(arr_case)) {
                keyvalue[arr_case.toString().split(regexBlank)[0]] = arr_case.toString().split(regexBlank)[1];
            }
        }
    } catch (e) {
        console.log("There is no parseperoperties file in " + uri.toString());
        return null;
    }
    return keyvalue;
}

//fetch properties from ./config/conf.properties
var conf = {};
conf = parseproperties(userConfigPath);

//Login from CAS
var loginName;
var roles;
var CasStrategy = require('passport-cas2').Strategy;

var cas = new CasStrategy({
    casURL: conf.cas_url
}, function (username, profile, done) {
    conf = parseproperties(userConfigPath);
    var reg_admin = conf.user_admin.toString().indexOf(username);
    var reg_approver = conf.user_approver.toString().indexOf(username);
    username = username.split('.');
    var firstName = username[0].substring(0, 1).toUpperCase() + username[0].substring(1);
    var lastName = username[1].substring(0, 1).toUpperCase() + username[1].substring(1);
    username = firstName + '.' + lastName;
    console.log("reg:"+reg_admin+reg_approver);
    if (reg_admin > 0) {
        console.log("admin:" + username)
        loginName = username;
        roles = 'admin';
        done(null, {username: username, roles: 'Admin'});
    }else if(reg_approver > 0){
        console.log("approver:" + username)
        loginName = username;
        roles = 'approver';
        done(null, {username: username, roles: 'Approver'});
    } else {
        console.log("employee:" + username)
        loginName = username;
        roles = 'employee';
        done(null, {username: username, roles: 'employee'});
    }
});


//store userInfo to session
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
passport.use(cas);

//login function
router.get('/', passport.authenticate('cas', {failureRedirect: '/'}), function (req, res) {
    res.session = loginName;
    res.redirect('/'+roles+'/');
});

//logout function
router.get('/logout', function (req, res) {
    var returnURL = conf.cas_url + '/logout?service=http://' + req.headers.host;
    cas.logout(req, res, returnURL);
});

module.exports = router;
