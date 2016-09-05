module.exports = function setup(options, imports, register) {
    var package = require("./package.json")
    var _ = require("lodash") // For shuffling arrays
    var cp = require("child_process") // For running our audio player
    var os = require("os"); // Determines if Windows or Linux
    var fs = require("fs") // For retrieving files in a folder

    imports.eventbus.on(/(scheduler\.trigger\.enabled.*|scheduler\.trigger\.disabled\.manual)/, function(bell) {
        imports.logger.log("A bell is triggered. Checking to see if it should play", "debug")
        // If the audio action is enabled
        if (bell.actions.audio.enabled == true) {
            imports.logger.log("Audio needs to be played. Shuffling and playing file", "debug")
            // Shuffle the list of audio
            file = _.shuffle(bell.actions.audio.files)[0]
                // Play the filename, and loop it.
            audio.play(file.filename, file.loop)
        }
    })

    // Define our plugin and functions
    var audio = {
        plugin: package,
        play: function(file, loop) {
            try {
                imports.logger.log("Attempting to play " + file + " " + loop + " times", "debug")
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
                    proc = cp.exec("\"" + process.cwd() + options.options.playerPath + "\\mpg123.exe\" --loop " + loop + " " + process.cwd() + "/" + options.options.audioPath + "/" + file + "\"", {
                        cwd: options.options.playerPath
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
            return fs.readdirSync(process.cwd() + "/" + options.options.audioPath)
        }
    }

    // Finally, register our plugin so Architect can do its magic.
    register(null, {
        audio: audio
    });
};
