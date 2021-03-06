// BellAudio module
// ==============
// Depends On: Bellboy
// Emits: ready

// This module provides a Windows and Linux compatible way of playing MP3s

var cp = require("child_process")
var os = require("os");
var fs = require("fs"); // For peeking inside our audio directory
var lodash = require("lodash");

var util = require("util"); // For inheriting the EventEmitter stuff so we can use it via this.emit();
var EventEmitter = require("events").EventEmitter;
util.inherits(BellAudio, EventEmitter);

var bellboy = {}

function BellAudio(bellboyInstance) {
  bellboy = bellboyInstance
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
  return fs.readdirSync(bellboy.__dirname + "/audio")
}

// Play the audio file
BellAudio.prototype.Play = function(directory, files, loop) {
    file = lodash.shuffle(files)[0]

    if(typeof loop === "number") {
      loop = "--loop " + loop
    } else {
      loop = ""
    }
    if (os.platform() !== "win32") {
      console.log("Trying to play " + "mpg123 \"" + bellboy.__dirname + directory + file + "\" " + loop)
      cp.exec("mpg123 " + loop + " \"" +bellboy.__dirname + directory + file + "\"", function(error, stdout, stderr) {
        console.log(stdout || stderr || error)
      })
  } else {
    console.log("Trying to play " + "\"" + __dirname + "/mpg123.exe\" " + loop + " \"" + bellboy.__dirname + directory + file + "\"")
    cp.exec("\"" + __dirname + "/mpg123/mpg123.exe\" " + loop + " \"" + bellboy.__dirname + directory + file + "\" ", function(error, stdout, stderr) {
      console.log(stdout || stderr || error)
    })

  }
}

BellAudio.prototype.SetVolume = function(percent) {
    if (os.platform() !== "win32") {
      cp.exec("amixer sset PCM,0 " + percent + "%", function(error, stdout, stderr) {
        this.emit("setvolume", percent)
      }.bind(this))
      cp.exec("alsactl store")
    } else {
      this.emit("setvolume", percent)
    }
}

BellAudio.prototype.GetVolume = function(percent) {
    if (os.platform() !== "win32") {
      // Run the command to get our percentage. Timeout after 1 second if nothing returned.
      return cp.execSync("amixer sget PCM|grep -o [0-9]*%", {"timeout": 1000}).toString().split("%")[0]
    } else {
      return 100
    }
}

// Sets the audio output method. 0 = Auto, 1 = 3.5mm jack, 2 = HDMI
BellAudio.prototype.SetAudioOutput = function(mode) {
  if(os.platform() !== "win32") {
    if(mode !== 1 || mode !== 2 || mode !== 3) { return false }
    fs.exec("amixer cset numid=3 " + mode)
    this.emit("outputchanged", mode)
    return true
  }
}

module.exports = BellAudio;
