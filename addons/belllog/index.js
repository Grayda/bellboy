// BellLog module
// ==============
// Depends On: Bellboy
// Emits: ready

// This module reads logs and such.
var fs = require("fs");
var stripANSI = require("strip-ansi");

var util = require("util"); // For inheriting the EventEmitter stuff so we can use it via this.emit();
var EventEmitter = require("events").EventEmitter;
util.inherits(BellLog, EventEmitter);

var bellboy = {}

function BellLog(bellboyInstance) {
  bellboy = bellboyInstance
  EventEmitter.call(this); // Needed so we can emit() from this module
}


BellLog.prototype.Prepare = function(callback) {
  // Nothing to set up. Let's rock and roll!
  this.emit("ready")
  if (typeof callback === "function") {
    callback(details);
  }
  return true
}

BellLog.prototype.GetLog = function(callback) {
  try {
    log = stripANSI(fs.readFileSync(__dirname + "/../../bellboy.log").toString())
    this.emit("log", log)
    return log
  } catch(ex) {
    return ex
  }
}

BellLog.prototype.DeleteLog = function() {
  // Don't actually delete the log, just overwrite it
  fs.writeFileSync(__dirname + "/../../bellboy.log", "")
  this.emit("logdeleted")
}

module.exports = BellLog;
