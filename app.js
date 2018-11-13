var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var firebase = require("firebase");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var boards = require('./routes/contents');

var session = require('express-session');
// var RedisStore = require('connect-redis')(session);

var app = express();

require("./lib/firebase_connect");

app.use(session({
    secret: '@#@$#UOS@$#$', //세션을 암호화하여 저장한다
    resave: false, //세션을 항상 저장할지 정한다
    saveUninitialized: true //세션이 저장되기전에 uninitialized상태로 미리 만들어 저장한다
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/boards',boards);

//set public folder
app.use(express.static(path.join(__dirname,'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;

// db연결
var mongoose = require('mongoose');
var config = require('./myModules/config.js');

mongoose.connect(config.dbUrl());
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log(" we're connected! ");
});
