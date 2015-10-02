// BellValidate module
// ==============
// Depends On: Bellboy
// Emits: ready, log[logfile], logdeleted

// This module checks data and such, ensuring it's correct.

var CronJob = require('cron').CronJob;

var util = require("util"); // For inheriting the EventEmitter stuff so we can use it via this.emit();
var EventEmitter = require("events").EventEmitter;
util.inherits(BellValidate, EventEmitter);

var bellboy = {}

function BellValidate(bellboyInstance) {
  bellboy = bellboyInstance
  EventEmitter.call(this); // Needed so we can emit() from this module
}


BellValidate.prototype.Prepare = function(callback) {
  // Nothing to set up. Let's rock and roll!
  this.emit("ready")
  if (typeof callback === "function") {
    callback(details);
  }
  return true
}

BellValidate.prototype.IfExists = function(variable) {
  if(typeof variable === "undefined") {
    return false
  } else {
    return true
  }
}

// Shorthand for testing if a var exists and returning it's value
BellValidate.prototype.GetValue = function(variable) {

  if(typeof variable === "undefined") {
    return "undefined"
  } else {
    return variable
  }
}



BellValidate.prototype.IsNumber = function(number) {
  if(typeof variable === "number") {
    return false
  } else {
    return true
  }
}

BellValidate.prototype.IsCron = function(cron) {
  try {
    new CronJob(cron, function() {})
    return true
  } catch (ex) {
    if(ex) {
      return false
    }
  }
}


module.exports = BellValidate;
