module.exports = function setup(options, imports, register) {

  var express = require('express');
  var path = require('path');
  var favicon = require('serve-favicon');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var assert = require("assert")
  var socket = require("socket.io")


  var routes = require('./routes/index');
  var users = require('./routes/users');
  var api = require('./routes/api')(imports);
  var status = require('./routes/status')(imports);

  var app = express();

  assert(options.port, "'port' option for web plugin is missing!")

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  // uncomment after placing your favicon in /public
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'bower_components')));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/api', api);
  app.use('/status', status);
  app.use('/', routes);
  app.use('/users', users);


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



  /**
   * Module dependencies.
   */


  var debug = require('debug')('web:server');
  var http = require('http');

  /**
   * Get port from environment and store in Express.
   */

  var port = normalizePort(process.env.PORT || options.port);
  app.set('port', port);

  /**
   * Create HTTP server.
   */
  var server = http.createServer(app);

  var io = require('socket.io').listen(server)

  /**
   * Listen on provided port, on all network interfaces.
   */

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);


  /**
   * Normalize a port into a number, string, or false.
   */

  function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return false;
  }

  /**
   * Event listener for HTTP server "error" event.
   */

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */

  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    debug('Listening on ' + bind);
  }


  web = {
    io: io
  }

  imports.eventbus.on("trigger", function(bell) {
    web.io.sockets.emit("trigger", { bell: bell })
  })

  web.io.sockets.on("trigger", function(bell) {
    imports.eventbus("trigger", imports.bells.get(bell))
  })

  imports.eventbus.on("bells_bellchanged", function(bell, property, value) {
    web.io.sockets.emit("bells_bellchanged", { bell: bell, property: property, value: value })
  })


  register(null, {
    web: web
  });

  module.exports = app;
};
