// BellValidate module
// ==============
// Depends On: Bellboy
// Emits: ready, log[logfile], logdeleted

// This module checks data and such, ensuring it's correct.

var CronJob = require('cron').CronJob;
var jjv = require("jjv")()
var fs = require("fs");
var lodash = require("lodash")

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

BellValidate.prototype.IfExists = function(object, variable) {
  return lodash.has(object, variable)
}

// Shorthand for testing if a var exists and returning it's value
BellValidate.prototype.GetValue = function(object, variable, defaultVal) {
  if(typeof defaultVal === "undefined") {
    defaultVal = "undefined"
  }

  return lodash.get(object, variable, defaultVal)
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

BellValidate.prototype.ValidateJSON = function(json, schema) {
  json = fs.readFileSync(json)
  schema = fs.readFileSync(schema)
  jjv.addSchema("bells", schema.toString())
  results = jjv.validate("bells", json.toString())

  if(results == null) {
    return true
  } else {
    return results
  }

}


module.exports = BellValidate;
