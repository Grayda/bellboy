// BellPi module
// ==============
// Depends On: Bellboy
// Emits: ready, button1, button2, button3, button4, soundset

// This module provides backlight control and button press features for the Adafruit 2.2" TFT screen (that has 4 push buttons)
// It's purpose is to let another module react to button presses, meaning you can press buttons under the screen to manually ring bells or do other stuff.

var util = require("util"); // For inheriting the EventEmitter stuff so we can use it via this.emit();
var EventEmitter = require("events").EventEmitter;
util.inherits(BellPi, EventEmitter);

var os = require("os"); // Need to work out if we're on Windows or not
var exec = require('child_process').exec // For running command line apps
var gpio

var bellboy = {}

function BellPi(bellboyInstance) {
  bellboy = bellboyInstance
  EventEmitter.call(this); // Needed so we can emit() from this module

}

// Sets the backlight. Give it a value between 0 and 1023 for precise brightness, or true / false for 100% / 0% brightness
BellPi.prototype.Backlight = function(brightness) {
  if (os.platform() != "win32") {
    if (brightness === true) {
      brightness = 1023
    } else if (brightness === false) {
      brightness = 0
    }
    gpio.write(18, brightness)
  }
}

// Sets the volume on the RPi to a percentage.
BellPi.prototype.SetVolume = function(volume) {
  if(volume > 100 || volume < 0) { return false } // Hey, no invalid percentages, please!
  if (os.platform() != "win32") {
    runCommand("amixer sset PCM,0 " + volume + "%")
  }
}

// Sets the audio output method. 0 = Auto, 1 = 3.5mm jack, 2 = HDMI
BellPi.prototype.SetAudioOutput = function(mode) {
  runCommand("amixer cset numid=3 " + mode)
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
            this.emit("button1")
          }
        case 22:
          if (value == 1) {
            this.emit("button2")
          }
        case 23:
          if (value == 1) {
            this.emit("button3")
          }
        case 27:
          if (value == 1) {
            this.emit("button4")
          }
      }


    }.bind(this))

    this.emit("ready")
    if (typeof callback === "function") {
      callback(details);
    }
  }


  return true
}

BellPi.prototype.GetVolume = function() {
  if (os.platform() != "win32") {
    var vol
    exec("amixer get PCM|grep -o [0-9]*%", function(error, stdout, stderr) {
      console.log(error || stdout || stderr)
      vol = stdout.split("%")[0]
    })

    return vol
  }
}

function runCommand(command) {
  exec(command, function(error, stdout, stderr) {
    if(error || stderr) {
      return false
    } else {
      return true
    }
  })
}

module.exports = BellPi;
