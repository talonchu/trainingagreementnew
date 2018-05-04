var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');

/*Specify the Js file*/
var users = require('./routes/users');
var loginIndex = require('./routes/loginIndex');
var employeeIndex = require('./routes/employeeIndex');
var employeeRoute = require('./routes/employeeRoute');
var adminIndex = require('./routes/adminIndex');
var adminRoute = require('./routes/adminRoute');
var approverIndex = require('./routes/approverIndex');
var approverRoute = require('./routes/approverRoute');
var exportExcelRoute = require('./routes/exportExcel');

var app = express();

app.use(passport.initialize());
/*app.use(passport.session());*/


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//javascripts.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret : 'super secret key',
	resave : false,
	saveUninitialized : true
}));


app.use('/', loginIndex);
app.use('/users', users);
app.use('/employee/', employeeIndex);
app.use('/employee/list/', employeeRoute);
app.use('/employee/record/', employeeRoute);
app.use('/employee/comment/', employeeRoute);
app.use('/admin/',adminIndex);
/*app.use('/admin/sendEmail/refundFee',adminIndex)*/
app.use('/admin/list/', adminRoute);
app.use('/admin/record/', adminRoute);
app.use('/admin/updateStatus/', adminRoute);
app.use('/getFirstPage', employeeRoute);
app.use('/employeeAdd/save/', employeeRoute);
app.use('/employeeModified/update/', employeeRoute);
app.use('/approver/',approverIndex);
app.use('/approve',approverRoute);
app.use('/approver/record/',approverRoute);
app.use('/api/exportExcel/', exportExcelRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
