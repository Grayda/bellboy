module.exports = function setup(options, imports, register) {
  var fs = require("fs")
  var assert = require("assert")

  var bells, config

  assert(options.configFile, "Plugin option 'configFile' is required!")

  register(null, {
    config: {
      root: options.root,
      config: config,
      loadConfig: function() {
        try {
          confFile = JSON.parse(fs.readFileSync(options.configFile, 'utf8'));
          assert(confFile, "Configuration file is empty!")
          this.config = confFile
          imports.eventbus.emit("config_configloaded")
          return true
        } catch (ex) {
          imports.eventbus.error(ex)
        }
      },
      saveConfig: function() {

      }
    }
  });
};
