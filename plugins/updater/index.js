module.exports = function setup(options, imports, register) {
    var package = require("./package.json")
    var _ = require("lodash") // For shuffling arrays
    var cp = require("child_process") // For running our audio player

    // Define our plugin and functions
    var updaterObj = {
        plugin: package,
        update: function() {
          imports.logger.log("Attempting to update", "warn")
          imports.eventbus.emit("updater.update.start")
          imports.logger.log(cp.execSync("gulp update", { cwd: process.cwd() }), "info")
          // If the update takes, nodemon should reload the files.
          imports.eventbus.emit("updater.update.finished")
          imports.logger.log("Update complete. Either nothing to update, or nodemon doesn't need to restart", "info")
        }
    }

    // Finally, register our plugin so Architect can do its magic.
    register(null, {
        updater: updaterObj
    });
};
