#!/usr/bin/node

var compression = require('compression');
var minify = require('express-minify');
var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var config = require('./config.json');

global.__basedir = __dirname;

var authRouter = require('./routes/auth');
var imagesRouter = require('./routes/images');
var indexRouter = require('./routes/index');
var uploadRouter = require('./routes/upload');
var jsonRouter = require('./routes/json');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.locals.pretty = true;

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());

app.use(session({
    secret: config.sessionsecret,
    resave: true,
    saveUninitialized: true
}));

app.use(compression());
app.use('/static', express.static('static'))
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);
app.use('/images', imagesRouter);
app.use('/json', jsonRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  if (!res.headersSent)
    res.type('text/html');
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
