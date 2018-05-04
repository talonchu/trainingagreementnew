var nodemailer = require('nodemailer');
var directTransport = require('nodemailer-direct-transport');
var transport = nodemailer.createTransport(directTransport());

function MailUtil() {
    this.sendMail = function(message){
        transport.sendMail(message);
    }
}

module.exports = MailUtil;
