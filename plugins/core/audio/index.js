module.exports = function setup(options, imports, register) {
  var _ = require("lodash")
  var validator = require("validator")
  var cp = require("child_process")
  var os = require("os");

  imports.eventbus.on("trigger", function(bell) {
    play(bell)
  })

  register(null, {
    audio: {
      play: function(bell) {
        try {
          file = _.shuffle(bell.Actions.Audio.File)[0]
          this.playFile(file)
        } catch (ex) {
          imports.eventbus.error(ex)
        }
      },
      playFile: function(file, loop) {
        if (typeof loop === "number") {
          loop = "--loop " + loop
        } else {
          loop = ""
        }
        if (os.platform() !== "win32") {
          console.log("Trying to play " + "mpg123 \"" + bellboy.__dirname + directory + file + "\" " + loop)
          cp.exec("mpg123 " + loop + " \"" + bellboy.__dirname + directory + file + "\"", function(error, stdout, stderr) {
            console.log(stdout || stderr || error)
          })
        } else {
          console.log("Trying to play " + "\"" + __dirname + "/mpg123.exe\" " + loop + " \"" + bellboy.__dirname + directory + file + "\"")
          cp.exec("\"" + __dirname + "/mpg123/mpg123.exe\" " + loop + " \"" + bellboy.__dirname + directory + file + "\" ", function(error, stdout, stderr) {
            console.log(stdout || stderr || error)
          })

        }
      },
    }
  });
};
