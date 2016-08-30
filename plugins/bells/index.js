module.exports = function setup(options, imports, register) {
  var fs = require("fs")

  bellObj = {
    pluginName: "Bell Plugin",
    pluginDescription: "Core plugin that loads bells from a JSON file",
    bells: null,
    load: function() {
      bellObj.bells = JSON.parse(fs.readFileSync(options.options.bellFile, 'utf8'))
      imports.eventbus.emit("bells.loaded", this.bells)
    },
    save: function() {
      fs.writeFileSync(options.options.bellFile, JSON.stringify(this.bells))
      imports.eventbus.emit("bells.saved", this.bells)
      this.load()
    },
    get: function(id) {
      if(typeof bellObj.bells[id] !== "undefined") {
        return bellObj.bells[id]
      } else {
        return false
      }
    },
    enable: function(id) {
      if(this.get(id).locked == true) {
        return false
      }
      this.get(id).enabled = true
      imports.eventbus.emit("bells.enabled", id)
      bellObj.save()
      return true
    },
    disable: function(id) {
      if(this.get(id).locked == true) {
        return false
      }
      this.get(id).enabled = false
      imports.eventbus.emit("bells.disabled", id)
      bellObj.save()
      return true
    },
    enableAll: function() {
      this.enable("_all")
      imports.eventbus.emit("bells.all.enabled")
      bellObj.save()
    },
    disableAll: function() {
      this.disable("_all")
      imports.eventbus.emit("bells.all.disabled")
      bellObj.save()
    }
  }

  register(null, {
    bells: bellObj
  });
};
