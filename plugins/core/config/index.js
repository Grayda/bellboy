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
      LoadBells: function() {
        try {
          this.bells = JSON.parse(fs.readFileSync(options.bellFile, 'utf8'));
          imports.eventbus.emit("bellsloaded")
          return true
        } catch (ex) {
          throw "Could not load bell file. Error was: " + ex
        }
      },
      LoadConfig: function() {
        try {
          this.config = JSON.parse(fs.readFileSync(options.bellFile, 'utf8'));
          imports.eventbus.emit("configloaded")
          return true
        } catch (ex) {
          throw "Could not load config file. Error was: " + ex
        }
      }
    }
  });
};
