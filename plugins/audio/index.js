module.exports = function setup(options, imports, register) {
    var _ = require("lodash") // For shuffling arrays
    var cp = require("child_process") // For running our audio player
    var os = require("os"); // Determines if Windows or Linux
    var fs = require("fs") // For retrieving files in a folder


    // Whenever a bell is triggered, we want to respond.
    imports.eventbus.on("scheduler.trigger.enabled*", function(bell) {
        // If the audio action is enabled
        if (bell.actions.audio.enabled == true) {
            // Shuffle the list of audio
            file = _.shuffle(bell.actions.audio.files)[0]
                // Play the filename, and loop it.
            audio.play(file.filename, file.loop)
        }
    })

    imports.eventbus.on("scheduler.trigger.disabled.manual", function(bell) {
        // If the audio action is enabled
        if (bell.actions.audio.enabled == true) {
            // Shuffle the list of audio
            file = _.shuffle(bell.actions.audio.files)[0]
                // Play the filename, and loop it.
            audio.play(file.filename, file.loop)
        }
    })

    // Define our plugin and functions
    var audio = {
        pluginName: "Audio Plugin",
        pluginDescription: "Plugin that provides audio playback",
        play: function(file, loop) {

            try {
                // If we're on a non-Windows platform
                if (os.platform() !== "win32") {
                    // Let anyone who is interested, know that we're starting to play some audio
                    imports.eventbus.emit("audio.playing", {
                        file: file,
                        loop: loop
                    })
                    proc = cp.exec("mpg123 --loop " + loop + " \"" + options.options.audioPath + "/" + file + "\"", {
                        cwd: __dirname + "/mpg123"
                    }, function(error, stdout, stderr) {
                      if(error || stderr) {
                        imports.logger.error(stderr)
                      } else if(stdout) {
                        imports.logger.log(stdout)
                      }
                    })

                    // When we're truly done playing the audio, let everyone know
                    proc.on("close", function(code, signal) {
                            imports.eventbus.emit("audio.stopped", {
                                code: code,
                                file: file,
                                loop: loop
                            })
                        })
                        // But if we're on Windows
                } else {
                    // This is all basically the same, except the process we call to play the MP3
                    imports.eventbus.emit("audio.playing", {
                        file: file,
                        loop: loop
                    })
                    proc = cp.exec("\"" + __dirname + "\\mpg123\\mpg123.exe\" --loop " + loop + " " + options.options.audioPath + "/" + file + "\"", {
                        cwd: __dirname + "/mpg123"
                    }, function(error, stdout, stderr) {
                      if(error || stderr) {
                        imports.logger.error(stderr)
                      } else if(stdout) {
                        imports.logger.log(stdout)
                      }
                    })

                    proc.on("close", function(code, signal) {
                        imports.eventbus.emit("audio.stopped", {
                            code: code,
                            file: file,
                            loop: loop
                        })
                    })

                }
            } catch (ex) {
                imports.eventbus.error(ex)
            }
        },
        // Retrieve a list of files
        files: function() {
            return fs.readdirSync(options.options.audioPath)
        }
    }

    // Finally, register our plugin so Architect can do its magic.
    register(null, {
        audio: audio
    });
};
