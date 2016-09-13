module.exports = function setup(options, imports, register) {
    var package = require("./package.json")
    var _ = require("lodash") // For shuffling arrays
    var cp = require("child_process") // For running our audio player
    var os = require("os"); // Determines if Windows or Linux
    var fs = require("fs") // For retrieving files in a folder
    var path = require("path")

    imports.eventbus.on(/(scheduler\.trigger\.enabled.*|scheduler\.trigger\.disabled\.manual)/, function(bell) {
        imports.logger.log("audio", "A bell is triggered. Checking to see if it should play", "debug")
            // If the audio action is enabled
        if (bell.actions.audio.enabled == true) {
            imports.logger.log("audio", "Audio needs to be played. Shuffling and playing file", "debug")
                // Shuffle the list of audio
            file = _.shuffle(bell.actions.audio.files)[0]
                // Play the filename, and loop it.
            audio.play(file.filename, file.loop, file.timeout)
        }
    })

    imports.eventbus.on(/(scheduler\.scheduled\.enabled|scheduler\.scheduled\.disabled)/, function(bell) {
        if (typeof bell.actions.audio.files !== "undefined") {
            bell.actions.audio.files.forEach(function(item) {
                fs.access(path.resolve(options.options.audioPath + "/" + item.filename), fs.F_OK, function(err) {
                    if (err) {
                        throw new Error("File not found: " + item.filename)
                    }
                })
            })
        }

    })

    // Define our plugin and functions
    var audio = {
        plugin: package,
        play: function(file, loop, timeout) {
            try {
                imports.logger.log("audio", "Attempting to play " + path.resolve(options.options.audioPath + "/" + file) + " " + loop + " times", "debug")
                    // If we're on a non-Windows platform
                if (os.platform() !== "win32") {
                    // Let anyone who is interested, know that we're starting to play some audio
                    imports.eventbus.emit("audio.playing", {
                        file: file,
                        loop: loop
                    })
                    proc = cp.exec("mpg123 --loop " + loop + " \"" + path.resolve(options.options.audioPath + "/" + file) + "\"", {
                        cwd: __dirname + "/mpg123",
                    }, function(error, stdout, stderr) {
                        if (error || stderr) {
                            imports.logger.error("audio", stderr)
                        } else if (stdout) {
                            imports.logger.log("audio", stdout)
                        }
                    })

                    if (typeof timeout !== "undefined") {
                        imports.logger.log("audio", "Audio has a timeout. Will stop ringing after " + timeout + " milliseconds")
                        setTimeout(function() {
                            imports.logger.log("audio", "Attempting to kill mpg123")
                            proc.kill("SIGINT")
                        }, timeout)
                    }

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
                    proc = cp.exec("\"" + path.resolve(process.cwd() + options.options.playerPath + "\\mpg123.exe\"") + " --loop " + loop + " " + path.resolve(process.cwd() + "/" + options.options.audioPath + "/" + file) + "\"", {
                        cwd: options.options.playerPath
                    }, function(error, stdout, stderr) {
                        if (error || stderr) {
                            imports.logger.error("audio", stderr)
                        } else if (stdout) {
                            imports.logger.log("audio", stdout)
                        }
                    })

                    if (typeof timeout !== "undefined") {
                        imports.logger.log("audio", "Audio has a timeout. Will stop ringing after " + timeout + " milliseconds")
                        setTimeout(function() {
                            imports.logger.log("audio", "Attempting to kill mpg123", "debug")
                            proc.kill("SIGINT")
                        }, timeout)
                    }

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
            return fs.readdirSync(path.resolve(process.cwd() + "/" + options.options.audioPath))
        },
        volume: function(value) {
            percent = 0
                // Get the volume. We can't get the volume in Windows, so we just return 100
            if (typeof volume === "undefined") {
                if (os.platform() !== "win32") {
                    // Run the command to get our percentage. Timeout after 1 second if nothing returned.
                    percent = cp.execSync("amixer sget PCM|grep -o [0-9]*%", {
                        "timeout": 1000
                    }).toString().split("%")[0]
                    imports.eventbus.emit("audio.volume.get", percent)
                    return percent
                } else {
                    imports.eventbus.emit("audio.volume.get", 100)
                    return 100
                }
            } else {
                // Set the volume
                if (os.platform() !== "win32") {
                    cp.execSync("amixer sset PCM,0 " + percent + "%")
                    cp.execSync("alsactl store")
                    imports.eventbus.emit("audio.volume.set", percent)
                    return percent
                } else {
                    imports.eventbus.emit("audio.volume.set", 100)
                    return percent
                }
            }
        }
    }

    fs.access(process.cwd() + "/" + options.options.audioPath, fs.F_OK, function(err) {
        if (!err) {
            register(null, {
                audio: audio
            });

        } else {
            register("Unable to load audio directory", null)
        }
    });

};
