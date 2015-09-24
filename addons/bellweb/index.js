var util = require("util"); // For inheriting the EventEmitter stuff so we can use it via this.emit();
var EventEmitter = require("events").EventEmitter;
util.inherits(BellWeb, EventEmitter);

var bellboy = {}

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var moment = require("moment")
var where = require("lodash.where")
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var io // For socket.io

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var routes = require('./routes/index');

var app = express();

function BellWeb(bellboyInstance) {
  bellboy = bellboyInstance
  EventEmitter.call(this); // Needed so we can emit() from this module
}

BellWeb.prototype.Prepare = function(root, port, callback) {
  app.set('port', 8080);

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');


  // Middleware
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(cookieParser());

  // Authentication with Passport-Local
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  setupPassport()

  app.use(session({
    store: new FileStore,
    secret: 'keyboard cat'
  }));

  passport.use('local-login', new LocalStrategy({
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form

      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      if (username == "demo" && password == "demo") {
        console.log("logged in!")
        return done(null, username);
      } else {
        console.log("Barruck!")
        return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
      }
    }));

    passport.serializeUser(function(user, done) {
      done(null, user);
    });

    passport.deserializeUser(function(user, done) {
      done(null, user);
    });


  // Sets app.locals so that our templates can use it. If it's in here, the template can use it,
  // TO-DO: Make this more secure, as someone could dump sensitive info from config.json
  app.locals.bellboy = bellboy
  app.locals.date = {
    "parsed": moment().format(bellboy.config.DateFormat),
    "unix": moment().unix(),
    "moment": moment
  }
  app.locals.where = where

  // Routes. Pretty straightforward
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/includes', routes);

  app.post('/login',
    passport.authenticate('local-login', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    })
  );

  app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


  app.use('/', routes);


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

  server.listen(port);

  server.on("listening", function() {
    this.emit("ready")
  }.bind(this))

  io = require('socket.io').listen(server); // For browser-server communication
  io.sockets.on('connection', function(socket) {
    BellWeb.prototype.socket = socket
    this.emit("socketready")
  }.bind(this));

}

BellWeb.prototype.GetHostName = function() {
  return require('os').hostname().toLowerCase()
}

BellWeb.prototype.SocketEmit = function(event, data) {
  io.sockets.emit(event, data)
}

function setupPassport() {


}



var server = http.createServer(app);

module.exports = BellWeb;
