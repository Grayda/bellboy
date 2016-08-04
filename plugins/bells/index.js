module.exports = function setup(options, imports, register) {
  var fs = require("fs")

  bellObj = {
    pluginName: "Bell Plugin",
    pluginDescription: "Core plugin that loads bells from a JSON file",
    bells: null,
    load: function() {
      bellObj.bells = JSON.parse(fs.readFileSync(options.options.bellFile, 'utf8'))
      imports.eventbus.emit("bells.loaded")
      return true
    },
    save: function() {
      fs.writeFileSync(options.options.bellFile, JSON.stringify(this.bells))
      imports.eventbus.emit("bells.saved")
    }
  }

  register(null, {
    bells: bellObj
  });
};
