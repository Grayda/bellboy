module.exports = function setup(options, imports, register) {
  var _ = require("lodash")
  var fs = require("fs")
  var assert = require("assert")

  assert(options.bellFile, "Plugin option 'bellFile' is required!")

  // When a bell is triggered, we may need to switch schedules or disable / enable bells etc.
  imports.eventbus.on("trigger", function(bell) {

    // If we've got a "ToggleBells" action
    if (_.has(bell, "Actions.ToggleBells") && Array.isArray(bell.Actions.ToggleBells)) {
      // Go through each of the bells mentioned
      bell.Actions.ToggleBells.forEach(function(item) {
        // If the item has an alphanumeric name and a boolean "Enabled" flag
        if (imports.validate.isAlphanumeric(item.Name) && imports.validate.isBoolean(item.Enabled)) {
          // Set the bell's Enabled property to item.Enabled
          imports.logger.log("Bell " + item.Name + " set to " + item.Enabled + " by " + bell.Name, 1)
          bellObj.set(item.Name + ".Enabled", item.Enabled)
        }
      })
    }
  })

  var bellObj = {
    bells: [],
    loadBells: function() {
      try {
        bellFile = JSON.parse(fs.readFileSync(options.bellFile, 'utf8'));
        assert(bellFile, "Bell file is empty!")
        bellObj.bells = bellFile
        imports.eventbus.emit("bells_bellsloaded")
        return true
      } catch (ex) {
        imports.eventbus.error(ex)
      }
    },
    saveBells: function() {

    },
    get: function(property) {
      return _.get(bellObj.bells, property)
    },
    set: function(property, value) {
      return _.set(bellObj.bells, property, value)
    },
    delete: function(bell, property) {
      return _.omit(bell, property)
    }
  }


  register(null, {
    bells: bellObj
  });
};
