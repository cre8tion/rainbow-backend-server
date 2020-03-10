require('babel-register');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var square = require('./routes/square').default;
var api = require('./routes/api');
var index = require('./routes/index');

var app = express();

/* db router */
const dbRouter = require('./db/dbRoutes.js');
app.use('/db', dbRouter);

app.use('/db/test', (req,res,next) => {
  res.send("helloworld");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api', api);

// catch 404 and forward to error handler`
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/* Set up to listen for db api */
app.listen(process.env.DBPORT || '3000', () => {
  console.log(`Server is running on port: ${process.env.DBPORT || '3000'}`);
});


module.exports = app;
