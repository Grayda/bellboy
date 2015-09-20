var fs = require('fs'); // For reading files

var util = require("util"); // For inheriting the EventEmitter stuff so we can use it via this.emit();
var EventEmitter = require("events").EventEmitter;
util.inherits(Bellboy, EventEmitter);
var CronJob = require('cron').CronJob; // Handles the timing
var moment = require("moment"); // For formatting of dates
var parser = require('cron-parser'); // For parsing and comparing of cron jobs

// The configuration, bells and cron jobs for this system
var config, bells
var modules = []
var jobs = {}

function Bellboy() {
  EventEmitter.call(this); // Needed so we can emit() from this module
  this.Prepare() // Calling "this.emit()" here doesn't work, so we need to call a Prepare() function
}

// Nothing to prepare. It's up to our calling code to load the bells
// TO-DO: Should this actually be the case?
Bellboy.prototype.Prepare = function() {
  this.emit("ready")
}

// =========================================================================
// Bell loading / saving functions

Bellboy.prototype.LoadSettings = function(file) {
  // Load and parse the JSON
  config = JSON.parse(fs.readFileSync(__dirname + "/" + file, 'utf8'));
  // So other files can use the config
  Bellboy.prototype.config = config;
  // Let everyone know we're ready, and what file we loaded
  this.emit("settingsloaded", __dirname + "/" + file)
}

Bellboy.prototype.LoadBells = function(file) {
  bells = JSON.parse(fs.readFileSync(__dirname + "/" + file, 'utf8'));
  Bellboy.prototype.bells = bells;
  this.emit("bellsloaded", __dirname + "\\" + file)
}

Bellboy.prototype.SaveSettings = function(file) {
  fs.writeFile(__dirname + "\\" + file, JSON.stringify(this.bells, null, 2))
	this.emit("settingssaved", __dirname + "\\" + file)
}

Bellboy.prototype.SaveBells = function(file) {
  fs.writeFile(__dirname + "\\" + file, JSON.stringify(this.bells, null, 2))
	this.emit("bellssaved", __dirname + "\\" + file)
}

Bellboy.prototype.AddBell = function(id, bell) {
  this.bells[id] = bell
  this.emit("belladded", id)
}

Bellboy.prototype.UpdateBell = function(id, bell) {
  this.bells[id] = bell
  this.emit("bellupdated", id)
}


Bellboy.prototype.DeleteBell = function(bell) {
  if(this.bells[bell].Locked == true) { return }
  delete this.bells[bell]
  this.emit("belldeleted", bell)
}





Bellboy.prototype.Start = function(file) {
  // Loop through all bells
  Object.keys(bells).forEach(function(item) {
      // "_all" is a "fake" bell. If this is disabled, all bells are disabled
      if (item === "_all") {
        return
      }

      // New cronjob. Takes a function on trigger, a function on completion (the "null" below),
      // true / false on startup status (if false, you need to call job[item].start() manually), plus a timezone
      jobs[item] = new CronJob(bells[item].Time, function() {
        // "cron" has a bug where jobs can prematurely fire minutes before they should,
        // so we check to make sure the job only starts when it should
        if(this.CompareTimes(item) == true) { this.emit("trigger", item) }
      }.bind(this), function() {
        if(this.CompareTimes(item) == true) { this.emit("triggerdone", item) }
      }.bind(this), bells[item].Enabled, config.Timezone)

      this.emit("jobadded", item)
    }.bind(this))
    // Let everyone know all jobs have been loaded.
  this.emit("jobsloaded", jobs)
}

// Manually triggers a bell
Bellboy.prototype.Trigger = function(bell) {
  this.emit("trigger", bell)
}

// Disables a bell
Bellboy.prototype.DisableBell = function(bell) {
	if(this.ToggleBell(bell, false) == true) {
		this.emit("belldisabled", bell)
	}
}

// Enables a bell
Bellboy.prototype.EnableBell = function(bell) {
  if(this.ToggleBell(bell, true) == true) {
		this.emit("bellenabled", bell)
	}

}

Bellboy.prototype.ToggleBell = function(bell, state) {

  if(this.bells[bell].Locked == true) {
    return false
  }

  if(state == true) {
	  this.bells[bell].Enabled = true
    this.jobs[bell].start()
  } else if(state == false) {
    this.bells[bell].Enabled = false
    this.jobs[bell].stop()
  }

  return true
}

Bellboy.prototype.CompareTimes = function(bell) {
  var interval = moment().diff(parser.parseExpression(this.bells[bell].Time).next());

  console.log("Diff is: " + interval)
  if(interval > -1 && interval < 1) {
    return true
  } else {
    return false
  }
}

Bellboy.prototype.config = config;
Bellboy.prototype.bells = bells;
Bellboy.prototype.jobs = jobs;
Bellboy.prototype.modules = modules

module.exports = Bellboy; // And make every exported Bellboy function available to whatever file wishes to use it.
