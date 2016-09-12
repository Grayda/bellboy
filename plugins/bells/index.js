module.exports = function setup(options, imports, register) {
  var package = require("./package.json")
  var fs = require("fs")

  bellObj = {
    plugin: package,
    bells: null,
    load: function() {
      bellObj.bells = JSON.parse(fs.readFileSync(options.options.bellFile, 'utf8'))
      imports.eventbus.emit("bells.loaded", this.bells)
    },
    save: function() {
      fs.writeFileSync(options.options.bellFile, JSON.stringify(this.bells, null, 2))
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
    create: function(bell) {
      if(this.exists(Object.keys(bell))) {
        return false
      }
      bellObj.bells[Object.keys(bell)] = bell[Object.keys(bell)]
      this.save()
      return true
    },
    delete: function(id) {
      if(this.get(id).locked == true) {
        return false
      }
      delete bellObj.bells[id]
      this.save()
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
    },
    exists: function(bell) {
      if(typeof bellObj.bells[Object.keys(bell)] === "undefined") {
        return false
      } else {
        return true
      }
    }
  }

  register(null, {
    bells: bellObj
  });
};
