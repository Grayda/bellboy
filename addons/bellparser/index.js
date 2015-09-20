// BellParser module
// ==============
// Depends On: Bellboy
// Emits: ready

// This module provides some cron-based utilities, such as converting cron to date, and determining the next job, given a Bellboy bell
// TO-DO: Need to clean this up, make it a little more standardized

var util = require("util"); // For inheriting the EventEmitter stuff so we can use it via this.emit();
var EventEmitter = require("events").EventEmitter;
util.inherits(BellParser, EventEmitter);

var moment = require("moment"); // For formatting of dates
var parser = require('cron-parser');

var bellboy = {}

function BellParser(bellboyInstance) {
  bellboy = bellboyInstance
  EventEmitter.call(this); // Needed so we can emit() from this module
}


BellParser.prototype.Prepare = function(callback) {
  // Nothing to set up. Let's rock and roll!
  this.emit("ready")
  if (typeof callback === "function") {
    callback(details);
  }
  return true
}

// CronToDate takes a bell ID (so not a bell object, just the key) and returns various info about the cron job
BellParser.prototype.CronToDate = function(bell, callback) {

  var details = {}
  var interval = parser.parseExpression(bellboy.bells[bell].Time).next();
  details["name"] = bellboy.bells[bell].Name
  details["time"] = bellboy.bells[bell].Time
  details["calendar"] = moment(interval).calendar()
  details["parsed"] = moment().to(interval)
  details["shortparsed"] = moment(interval).format("ddd MMM Do HH:MM:SS")

  if (typeof callback === "function") {
    callback(details);
  }

  return details
}


// GetNextJob follows a similar pattern to CronToDate. It loops through all bells and find the one that is closest to the current date.
// Then it returns a bunch of useful information for display.
BellParser.prototype.GetNextJob = function(callback) {
  var time
  var results = []
  // Because the diff is a negative number (smaller as it approaches "now") and we're lookiung for a number > the smallest, we set this insanely low
  results["diff"] = -999999999999999999999
  Object.keys(bellboy.bells).forEach(function(item) {
    if (item == "_all") {
      return
    }
    if (bellboy.bells[item].Enabled == true) { // Only interested in enabled bells
      var interval = parser.parseExpression(bellboy.bells[item].Time).next();
      diff = moment().diff(interval)
      if (diff > results["diff"]) {

        results["name"] = bellboy.bells[item].Name
        results["parsed"] = interval
        results["shortparsed"] = moment(results["parsed"]).format("ddd MMM Do HH:MM:SS")
        results["diff"] = diff
        results["time"] = bellboy.bells[item].Time
        results["calendar"] = moment(interval).calendar()

      }
    }
  })

  if (typeof callback === "function") {
    callback(results);
  }
  return results
}

module.exports = BellParser;
