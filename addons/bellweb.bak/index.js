// BellWeb module
// ==============
// Depends On: Bellboy, BellParser
// Emits: ready, pageloaded(request, response), cssloaded(request, response), lessloaded(request, response), imageloaded(request, response)

// This module provides a web front-end for managing the bells.

var util = require("util"); // For inheriting the EventEmitter stuff so we can use it via this.emit();
var EventEmitter = require("events").EventEmitter;
util.inherits(BellWeb, EventEmitter);

var dispatcher = require('httpdispatcher'); // For handling our web server requests
var parser = require('cron-parser');
var less = require('less');
var http = require('http'); // For our web server
var url = require("url"); // For parsing URLs
var moment = require("moment"); // For formatting of dates
var ejs = require('ejs'); // Text template engine, used for web parsing
var fs = require('fs'); // For reading files
var where = require("lodash.where"); // For quick and easy counting of enabled bells


var bellboy = {}
var server, io


function BellWeb(bellboyInstance) {
  bellboy = bellboyInstance
  EventEmitter.call(this); // Needed so we can emit() from this module
}

BellWeb.prototype.Prepare = function(root, port, callback) {
  // The root path to our files (e.g. /pages)
  BellWeb.Path = root

  server = http.createServer(function(request, response) {

    dispatcher.dispatch(request, response);
  });



  // Forward slash only
  dispatcher.beforeFilter(/^\/$/gm, function(req, res) {
    res.writeHead(302, {
      'Location': '/index.html'
    });
    res.end();
  }.bind(this));

  // Our index page
  dispatcher.beforeFilter(/\.html$|\.js$/gm, function(req, res) {
    // try {
      file = this.LoadFile(req)
      res.setHeader('content-type', 'text/html');
      res.end(file)
      this.emit("pageloaded", req, res)
    // } catch (ex) {
    //   res.writeHead(404);
    //   console.log(ex)
    //   req.url = "/404.html"
    //   file = this.LoadFile(req)
    //   res.end(file);
    //   this.emit("pageloadederror", req)
    // }

  }.bind(this));

  // Loads CSS
  dispatcher.beforeFilter(/\.css/g, function(req, res) {
    file = this.LoadFile(req)
    res.setHeader('content-type', 'text/css');
    res.end(file)
    this.emit("cssloaded", req, res)
  }.bind(this));

  // Loads .less files
  dispatcher.beforeFilter(/\.less/g, function(req, res) {

    file = this.LoadFile(req)
    res.setHeader('content-type', 'text/css');
    less.render(file, {
      paths: [BellWeb.Path]
    }, function(err, output) {
      if (err) {
        console.log(err)
      }
      res.end(output.css)

    })
    this.emit("lessloaded", req, res)
  }.bind(this));

  // Loads image files
  dispatcher.beforeFilter(/\.jpg|\.png|\.gif|\.bmp\.ttf|\.woff/g, function(req, res) {
    file = this.LoadFile(req, true)
      // No header set because LOL I'm lazy!
    res.end(file, "binary")
    this.emit("imageloaded", req, res)
  }.bind(this));

  // After our setup, set our server to listen
  server.listen(port, function() {
    //console.log("Server listening on: http://localhost:" + bellboy.config.ServerPort);
    this.emit("ready")
    if (typeof callback === "function") {
      callback(details);
    }
  }.bind(this));

  io = require('socket.io').listen(server); // For browser-server communication
  io.sockets.on('connection', function(socket) {
    BellWeb.prototype.socket = socket
      this.emit("socketready")
  }.bind(this));
}

BellWeb.prototype.LoadFile = function(req, binary) {
  var file
  if (binary == true) {
    return fs.readFileSync(BellWeb.Path + url.parse(req.url).pathname)
  } else {
    file = fs.readFileSync(BellWeb.Path + url.parse(req.url).pathname).toString()
    var options = {
      req: req,
      Date: {
        "parsed": moment().format(bellboy.config.DateFormat),
        "unix": moment().unix(),
        "moment": moment
      },
      bellboy: bellboy,
      where: where,
      hostname: this.GetHostName(),
      cron: bellboy.modules["bellparser"],
      filename: BellWeb.Path + url.parse(req.url).pathname
    }
    return ejs.render(file, options)
  }

}

BellWeb.prototype.GetHostName = function() {
  return require('os').hostname().toLowerCase()
}

BellWeb.prototype.SocketEmit = function(event, data) {
  io.sockets.emit(event, data)
}


#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('web:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

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


BellWeb.prototype.server = server
module.exports = BellWeb;
