module.exports = function setup(options, imports, register) {
  var _ = require("lodash") // For shuffling arrays
  var cp = require("child_process") // For running our audio player
  var assert = require("assert") // For ensuring options exist, variables are there, and so forth
  var os = require("os"); // Determines if Windows or Linux

  // Have we not passed the audioPath option? Exit!
  assert(options.audioPath, "audioPath option required!")

  // Whenever a bell is triggered, we want to respond.
  imports.eventbus.on("trigger", function(bell) {
    imports.logger.log("Bell triggered:" + bell.Name, 1)
    audio.play(bell)
  })

  // Define our plugin and functions
  var audio = {
    play: function(bell) {

      // If our bell object doesn't have Actions.Audio.Files, or the bell is disabled, just return. We don't need that kind of negativity in our lives!
      if(!_.has(bell, "Actions.Audio.Files") || _.get(bell, "Actions.Audio.Enabled") == false) {
        return
      }

      // If bell.Actions.Audio.Files is not an array, make it into one
      if(!Array.isArray(bell.Actions.Audio.Files)) {
        bell.Actions.Audio.Files = [bell.Actions.Audio.Files.toString()]
      }

      try {
        var loop
        // Shuffle the array of music
        file = _.shuffle(bell.Actions.Audio.Files)[0]
        assert(imports.validate.isFilename(file), "Audio file contains invalid (non filename) characters!")

        if(imports.validate.isInt(bell.Actions.Audio.Loop) && loop > 0) {
          loop = "--loop " + bell.Actions.Audio.Loop
        } else {
          loop = ""
        }

        // If we're on a non-Windows platform
        if (os.platform() !== "win32") {
          // Let anyone who is interested, know that we're starting to play some audio
          imports.eventbus.emit("audio_started", file)
          proc = cp.exec("mpg123 " + loop + " \"" + options.audioPath + "/" + file + "\"", function(error, stdout, stderr) {
            imports.logger.log(stdout || stderr || error, 1)
          })

          // When we're truly done playing the audio, let everyone know
          proc.on("close", function(code, signal) {
            imports.eventbus.emit("audio_finished", file)
          })
        // But if we're on Windows
        } else {
          // This is all basically the same, except the process we call to play the MP3
          imports.eventbus.emit("audio_started", file)
          proc = cp.exec("\"" + __dirname + "/mpg123/mpg123.exe\" " + loop + " \"" + options.audioPath + "/" + file + "\" ", function(error, stdout, stderr) {
            imports.logger.log(stdout || stderr || error, 1)
          })

          proc.on("close", function(code, signal) {
            imports.eventbus.emit("audio_finished", file)
          })

        }
      } catch (ex) {
        imports.eventbus.error(ex)
      }
    }
  }

  // Finally, register our plugin so Architect can do its magic.
  register(null, {
    audio: audio
  });
};
