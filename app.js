require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cron = require('node-cron');
var axios = require('axios');
const cors = require("cors");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var gameRouter = require('./routes/game');


// MongoDB connection
mongoose.connect(`${process.env.MONGODB_URI}`, {
  user: `${process.env.MONGODB_USER}`,
  pass: `${process.env.MONGODB_PASS}`,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

//gameRouter.generateCountryDescription();
cron.schedule('0 0 * * *', () => {
    gameRouter.generateCountryDescription();
});

// Enable CORS before routes
var app = express();
app.use(cors()); // Add this line here

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Define routes after enabling CORS
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/game', gameRouter.router);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
