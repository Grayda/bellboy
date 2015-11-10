module.exports = function setup(options, imports, register) {
  var fs = require("fs")
  var assert = require("assert")

  var bells, config

  assert(options.bellFile, "bellFile is required!")
  assert(options.configFile, "configFile is required!")

  register(null, {
    config: {
      bells: bells,
      config: config,
      loadBells: function() {
        try {
          bellFile = JSON.parse(fs.readFileSync(options.bellFile, 'utf8'));
          assert(bellFile, "Bell file is empty!")
          this.bells = bellFile
          imports.eventbus.emit("bellsloaded")
          return true
        } catch (ex) {
          imports.eventbus.error(ex)
        }
      },
      loadConfig: function() {
        try {
          confFile = JSON.parse(fs.readFileSync(options.bellFile, 'utf8'));
          assert(confFile, "Configuration file is empty!")
          this.config = confFile
          imports.eventbus.emit("configloaded")
          return true
        } catch (ex) {
          imports.eventbus.error(ex)
        }
      },
      saveBells: function() {

      },
      saveConfig: function() {

      }
    }
  });
};
