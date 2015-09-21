// BellAudio module
// ==============
// Depends On: Bellboy
// Emits: ready

// This module provides a Windows and Linux compatible way of playing MP3s

var exec = require("child_process").exec
var os = require("os");
var fs = require("fs"); // For peeking inside our audio directory

var util = require("util"); // For inheriting the EventEmitter stuff so we can use it via this.emit();
var EventEmitter = require("events").EventEmitter;
util.inherits(BellAudio, EventEmitter);

var bellboy = {}

function BellAudio(bellboyInstance) {
  bellaudio = bellboyInstance
  EventEmitter.call(this); // Needed so we can emit() from this module
}


BellAudio.prototype.Prepare = function(callback) {
  // Nothing to set up. Let's rock and roll!
  this.emit("ready")
  if (typeof callback === "function") {
    callback(details);
  }
  return true
}

BellAudio.prototype.ViewFiles = function() {
  return fs.readdirSync(__dirname + "/audio")
}

// Play the audio file
BellAudio.prototype.Play = function(file) {
  console.log("Trying to play:" + __dirname + "/cmdmp3.exe " + __dirname + file)
  if (os.platform() == "win32") {
    exec("\"" + __dirname + "/cmdmp3.exe\" \"" + __dirname + file + "\"", function(error, stdout, stderr) {
      console.log(stdout || stderr)
    });
  } else {
    var Player = require('player'); // Plays MP3s. We put this here because the script freezes up on Windows on this line
    player = new Player(__dirname + file)
    player.on('error', function(err) {
      console.log(err)
    })
    player.play()
  }
}

BellAudio.prototype.SetVolume = function(percent) {
    if (os.platform() !== "win32") {
      var loudness = require("loudness")
      loudness.setVolume(45, function (err) {
        this.emit("volumechanged", percent)
      }.bind(this));
    }
}

BellAudio.prototype.GetVolume = function(percent) {
    if (os.platform() !== "win32") {
      var vol
      var loudness = require("loudness")
      loudness.getVolume(function (err, volume) {
        this.emit("volumechanged", percent)
        vol = volume
      }.bind(this));
      return vol
    } else {
      return 100
    }
}

// Sets the audio output method. 0 = Auto, 1 = 3.5mm jack, 2 = HDMI
BellAudio.prototype.SetAudioOutput = function(mode) {
  if(os.platform() !== "win32") {
    exec("amixer cset numid=3 " + mode)
    this.emit("outputchanged", mode)
    return true
  }
}


module.exports = BellAudio;
