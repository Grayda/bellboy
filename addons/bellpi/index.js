// BellPi module
// ==============
// Depends On: Bellboy
// Emits: ready, button[index], outputchanged[index], volumeset[percentage], getvolume[percentage] backlightchanged[percentage]

// This module provides backlight control and button press features for the Adafruit 2.2" TFT screen (that has 4 push buttons)
// It's purpose is to let another module react to button presses, meaning you can press buttons under the screen to manually ring bells or do other stuff.

var util = require("util"); // For inheriting the EventEmitter stuff so we can use it via this.emit();
var EventEmitter = require("events").EventEmitter;
util.inherits(BellPi, EventEmitter);

var os = require("os"); // Need to work out if we're on Windows or not
var fs = require('fs') // For running command line apps
var gpio

var bellboy = {}

function BellPi(bellboyInstance) {
  bellboy = bellboyInstance
  EventEmitter.call(this); // Needed so we can emit() from this module

}

// Sets the backlight. Give it a value between 0 and 100 for precise brightness, or true / false for 100% / 0% brightness
BellPi.prototype.SetBacklight = function(percentage, timeout, revertedbrightness) {
  if (os.platform() != "win32") {

    if (percentage === true) {
      percentage = 100
    } else if (percentage === false) {
      percentage = 0
    }

    // Convert our brightness into a value out of 1023
    brightness = percentage*1023/100
    gpio.write(18, brightness)

    // If we've set a timeout
    if(typeof timeout !== "undefined") {
      setTimeout(function() {
          // Revert back to revertedbrightness after <timeout> seconds
          this.SetBacklight(revertedbrightness)
      }, timeout)
    }
    this.emit("backlightchanged", percentage)
  }
}

// Gets our module ready and listens on various pins for changes.
BellPi.prototype.Prepare = function(callback) {
  if (os.platform() != "win32") {
    gpio = require("rpi-gpio");
    gpio.setup(18, gpio.DIR_OUT); // For the backlight

    gpio.setup(17, gpio.DIR_IN); // Button 1
    gpio.setup(22, gpio.DIR_IN); // Button 2
    gpio.setup(23, gpio.DIR_IN); // Button 3
    gpio.setup(27, gpio.DIR_IN); // Button 4

    gpio.on('change', function(channel, value) {
      switch (channel) {
        case 17:
          if (value == 1) {
            this.emit("button", channel) //
          }
          break;
        case 22:
          if (value == 1) {
            this.emit("button", channel)
          }
          break;
        case 23:
          if (value == 1) {
            this.emit("button", channel)
          }
          break;
        case 27:
          if (value == 1) {
            this.emit("button", channel)
          }
          break;
        case 18:
          this.emit("backlightchanged", value/1023*100)
      }

    }.bind(this))

    this.emit("ready")
    if (typeof callback === "function") {
      callback(details);
    }
  }


  return true
}

// Are we running on a RPi? Useful for select-loading modules or something.
BellPi.prototype.IsPi = function() {
  try {
    hardware = fs.readFileSync("/proc/cpuinfo")
    if(hardware.indexOf("BCM2708") > -1) {
      return true
    } else {
      return false
    }
  } catch (ex) {
    return false
  }


}

module.exports = BellPi;
