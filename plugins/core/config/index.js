module.exports = function setup(options, imports, register) {
  var fs = require("fs")
  var assert = require("assert")

  var bells, config

  assert(options.configFile, "Plugin option 'configFile' is required!")

  configObj = {
    config: config,
    loadConfig: function() {

      confFile = JSON.parse(fs.readFileSync(options.configFile, 'utf8'));
      assert(confFile, "Configuration file is empty!")
      configObj.config = confFile
      imports.eventbus.emit("config_configloaded")
      return true
    },
    saveConfig: function() {

    }
  }


  register(null, {
    config: configObj
  });
};
