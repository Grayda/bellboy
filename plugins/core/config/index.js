module.exports = function setup(options, imports, register) {
  var fs = require("fs")
  var assert = require("assert")

  var bells, config

  assert(options.bellFile, "Plugin option 'bellFile' is required!")
  assert(options.configFile, "Plugin option 'configFile' is required!")

  register(null, {
    config: {
      root: options.root,
      bells: bells,
      config: config,
      loadBells: function() {
        try {
          bellFile = JSON.parse(fs.readFileSync(options.bellFile, 'utf8'));
          assert(bellFile, "Bell file is empty!")
          this.bells = bellFile
          imports.eventbus.emit("config_bellsloaded")
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
          imports.eventbus.emit("config_configloaded")
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
