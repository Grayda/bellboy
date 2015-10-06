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
var cp = require("child_process") // For setting the date manually when network time isn't available.
var gpio // GPIO pins on the RPi, as exposed by the rpi-gpio package
var isPi // Are we running on a Raspberry Pi?

var bellboy = {}

function BellPi(bellboyInstance) {
  bellboy = bellboyInstance
  EventEmitter.call(this); // Needed so we can emit() from this module

}

// Sets the backlight. Give it a value between 0 and 100 for precise brightness, or true / false for 100% / 0% brightness
BellPi.prototype.SetBacklight = function(percentage, timeout, revertedbrightness) {
  if (isPi) {

    if (percentage === true) {
      percentage = 100
    } else if (percentage === false) {
      percentage = 0
    }

    // Convert our brightness into a value out of 1023
    brightness = percentage * 1023 / 100
    this.Write(18, brightness)

    // If we've set a timeout
    if (typeof timeout !== "undefined") {
      this.TogglePin(18, brightness, revertedbrightness, timeout)
    }

    this.emit("backlightchanged", percentage)
  }
}


// Gets our module ready and listens on various pins for changes.
BellPi.prototype.Prepare = function(callback) {
  isPi = this.IsPi()
  if (isPi) {
    gpio = require("rpi-gpio");
    this.Setup(18, 0) // For the backlight

    this.Setup(17, 1); // Button 1
    this.Setup(22, 1); // Button 2
    this.Setup(23, 1); // Button 1
    this.Setup(27, 1); // Button 1

    gpio.on('change', function(pin, value) {
      switch (pin) {
        case 17:
          if (value == 1) {
            this.emit("button", 1)
          } else {
            this.emit("buttonreleased", 1)
          }
          break;
        case 22:
          if (value == 1) {
            this.emit("button", 2)
          } else {
            this.emit("buttonreleased", 2)
          }

          break;
        case 23:
          if (value == 1) {
            this.emit("button", 3)
          } else {
            this.emit("buttonreleased", 3)
          }

          break;
        case 27:
          if (value == 1) {
            this.emit("button", 4)
          } else {
            this.emit("buttonreleased", 4)
          }

          break;
        case 18:
          this.emit("backlightchanged", value / 1023 * 100)
      }
      this.emit("pinchange", pin, value)
    }.bind(this))

    this.emit("ready")
    if (typeof callback === "function") {
      callback(details);
    }
  }


  return true
}

BellPi.prototype.Write = function(pin, value) {
  gpio.write(pin, value)
  this.emit("pinwrite", pin, value)
}

// Turns a pin on (or off) and holds it like so for <timeout>
BellPi.prototype.TogglePin = function(pin, onvalue, offvalue, timeout) {
  if (isPi) {
    this.Write(pin, onvalue, function() {
      setTimeout(function() {
        this.Write(pin, offvalue)
      }.bind(this), timeout)
    }.bind(this))
  }
}

// Sets up pins on the RPi. Direction = 0 for Output, 1 for Input
BellPi.prototype.Setup = function(pin, direction) {
  if (isPi) {
    var dir
    if (direction == 0) {
      dir = gpio.DIR_OUT
    } else {
      dir = gpio.DIR_IN
    }

    gpio.setup(pin, dir);
    this.emit("pinsetup", pin, direction)
  }
}

BellPi.prototype.SetDate = function(date) {
    cp.spawnSync("date -s \"" + date + "\"")
    this.emit("datechanged", date)
}

// Are we running on a RPi? Useful for select-loading modules or something.
BellPi.prototype.IsPi = function() {
  try {
    hardware = fs.readFileSync("/proc/cpuinfo")
    if (hardware.indexOf("BCM2708") > -1) {
      return true
    } else {
      return false
    }
  } catch (ex) {
    return false
  }


}

module.exports = BellPi;
