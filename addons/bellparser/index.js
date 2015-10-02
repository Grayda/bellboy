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
var later = require("later")
var lodash = require("lodash")
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

BellParser.prototype.GetNextJob2 = function(callback) {

  // Object.keys(bellboy.bells).forEach(function(item) {
  //   if bellboy.bells[item].Enabled == true {
  //     arr[item].push(parser.parseExpression(bellboy.bells[item].Time).next())
  //   }
  // })
  //
  // arr = arr.sort()
  //
  // results["calendar"] = moment(arr[0]).calendar()
  // Object.keys(bellboy.schedules).forEach(function(item) {
  //   arr.push(bellboy.schedules[item])
  // })
  // derp = later.schedule({"schedules": arr})
  // console.dir(derp.next(2))


}

// GetNextJob follows a similar pattern to CronToDate. It loops through all bells and find the one that is closest to the current date.
// Then it returns a bunch of useful information for display.
BellParser.prototype.GetNextJob = function(callback) {
  var time
  var results = []
  // Because the diff is a negative number (smaller as it approaches "now") and we're lookiung for a number > the smallest, we set this insanely low
  results["diff"] = -999999999999999999999
  Object.keys(bellboy.bells).forEach(function(item) {
    // We want to ignore bells that start with _, as they're special cases
    if (item.substring(0,1) == "_") {
      return
    }
    if (bellboy.bells[item].Enabled == true) { // Only interested in enabled bells
      var interval = parser.parseExpression(bellboy.bells[item].Time).next();

      if (moment().diff(interval) > results["diff"]) {

        results["name"] = bellboy.bells[item].Name
        results["parsed"] = interval
        results["shortparsed"] = moment(results["parsed"]).format("ddd MMM Do HH:MM:SS")
        results["diff"] = moment().diff(interval)
        results["cron"] = bellboy.bells[item].Time
        results["fromnow"] = moment(interval).fromNow(true)
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
