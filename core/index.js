var fs = require('fs'); // For reading files

var util = require("util"); // For inheriting the EventEmitter stuff so we can use it via this.emit();
var EventEmitter = require("events").EventEmitter;
util.inherits(Bellboy, EventEmitter);
var later = require('later'); // Handles the timing
var moment = require("moment"); // For formatting of dates
var parser = require('cron-parser'); // For parsing and comparing of cron jobs

// The configuration, bells and cron jobs for this system
var config, bells
var modules = []
var jobs = {}
var schedules = {}

function Bellboy() {
  EventEmitter.call(this); // Needed so we can emit() from this module
  this.Prepare() // Calling "this.emit()" here doesn't work, so we need to call a Prepare() function
}

// Nothing to prepare. It's up to our calling code to load the bells
// TO-DO: Should this actually be the case?
Bellboy.prototype.Prepare = function() {
  later.date.localTime()
  this.emit("ready")
}

// =========================================================================
// Bell loading / saving functions

Bellboy.prototype.LoadSettings = function(file) {
  try {
    config = JSON.parse(fs.readFileSync(file, 'utf8'));
    // So other files can use the config
    Bellboy.prototype.config = config;
    // Let everyone know we're ready, and what file we loaded
    this.emit("settingsloaded", file)

  } catch (ex) {
    this.emit("settingsloaded_error", ex)
    console.log("Error loading settings file: " + file + ". Error was: " + ex + ". Loading default bells instead")
    config = JSON.parse(fs.readFileSync(__dirname + "/config/config_default.json", 'utf8'));
    Bellboy.prototype.config = config;
    this.emit("settingsloaded", file)
  }
  // Load and parse the JSON
}

Bellboy.prototype.LoadBells = function(file) {
  try {
    bells = JSON.parse(fs.readFileSync(file, 'utf8'));
    Bellboy.prototype.bells = bells;
    this.emit("bellsloaded", file)
  } catch (ex) {
    this.emit("bellsloaded_error", ex)
    console.log("Error loading bell file: " + file + ". Error was: " + ex + ". Loading default bells instead")
    bells = JSON.parse(fs.readFileSync(__dirname + "/config/bells_default.json", 'utf8'));
    Bellboy.prototype.bells = bells;
    this.emit("bellsloaded", file)
  }
}

Bellboy.prototype.SaveSettings = function(file) {
  if (JSON.stringify(this.config, null, 2) == "") {
    this.emit("settingssaved_error")
    return false
  }

  fs.writeFileSync(file, JSON.stringify(this.config, null, 2))
  this.emit("settingssaved", file)
}

Bellboy.prototype.SaveBells = function(file) {
  if (JSON.stringify(this.bells, null, 2) == "") {
    this.emit("bellssaved_error")
    return false
  }

  fs.writeFileSync(file, JSON.stringify(this.bells, null, 2))
  this.emit("bellssaved", file)
}

Bellboy.prototype.AddBell = function(id, bell) {
  this.bells[id] = bell
  this.emit("belladded", id)
}

Bellboy.prototype.UpdateBell = function(id, bell) {
  // TO-DO: Add 'if exists' clause
  if (this.bells[id].Locked == true) {
    return
  }
  this.bells[id] = bell
  this.emit("bellupdated", id)
}


Bellboy.prototype.DeleteBell = function(bell) {
  if (this.bells[bell].Locked == true) {
    return
  }
  delete this.bells[bell]
  this.emit("belldeleted", bell)
}

Bellboy.prototype.Start = function(file) {
  // Loop through all bells
  Object.keys(this.bells).forEach(function(item) {
      // We want to ignore bells that start with _, as they're special cases
      if (item.substring(0, 1) == "_") {
        return
      }
      // New cronjob. Takes a function on trigger, a function on completion (the "null" below),
      // true / false on startup status (if false, you need to call job[item].start() manually), plus a timezone
      if (typeof this.bells[item].Time !== "undefined") {
        schedules[item] = later.parse.cron(this.bells[item].Time)
        jobs[item] = later.setInterval(function() {
          if (this.bells[item].Enabled == true) {
            this.emit("trigger", item)
          }
        }.bind(this), schedules[item])
      }

      this.emit("jobadded", item)
    }.bind(this))
    // Let everyone know all jobs have been loaded.
  this.emit("jobsloaded", jobs)
}

// Manually triggers a bell
Bellboy.prototype.Trigger = function(bell) {
  this.emit("manualtrigger", bell)
  this.emit("trigger", bell)
}

// Disables a bell
Bellboy.prototype.DisableBell = function(bell) {
  if (this.ToggleBell(bell, false) == true) {
    this.emit("belldisabled", bell)
  }
}

// Enables a bell
Bellboy.prototype.EnableBell = function(bell) {
  if (this.ToggleBell(bell, true) == true) {
    this.emit("bellenabled", bell)
  }

}

Bellboy.prototype.ToggleBell = function(bell, state) {

  if (bell.indexOf("_") > -1) {
    theBell = this.bells[bell]
  } else {
    theBell = this.bells[bell]
  }
  if (theBell.Locked == true) {
    return false
  }

  if (state == true) {
    theBell.Enabled = true
  } else if (state == false) {
    theBell.Enabled = false
  }

  return true
}

Bellboy.prototype.config = config;
Bellboy.prototype.__dirname = ""
Bellboy.prototype.bells = bells;
Bellboy.prototype.jobs = jobs;
Bellboy.prototype.modules = modules

module.exports = Bellboy; // And make every exported Bellboy function available to whatever file wishes to use it.
