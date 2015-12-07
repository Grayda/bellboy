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
        // There's a BUG here: Virtual bells aren't alphanumeric, so you couldn't set _all this way!
        if (imports.validate.isAlphanumeric(item.ID) && imports.validate.isBoolean(item.Enabled)) {
          // Set the bell's Enabled property to item.Enabled
          imports.logger.log("Bell " + item.ID + " set to " + item.Enabled + " by " + bell.Name, 1)
          bellObj.set(item.ID + ".Enabled", item.Enabled)
        }
      })
    }
  })

  // For our form in web



  imports.schema.append(
    {
   type: "object",
   properties: {
     name: { type: "string", minLength: 2, title: "Name", description: "Name or alias" },
     title: {
       type: "string",
       enum: ['dr','jr','sir','mrs','mr','NaN','dj'],
     },
     default: "Hello"
   }
 }, [
    "*",
    {
      type: "submit",
      title: "Save",
    }
  ]
)

  var bellObj = {
    bells: [],
    toArray: function(omitVirtual) {
      var res = []

      bellObj.bells.forEach(function(item) {
        if (item.ID.indexOf("_") == 0 && omitVirtual == true) {
          return
        }
        res.push(item)
      })

      return res
    },
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
    get: function(id) {
      return _.where(bellObj.bells, {
        'ID': id
      })[0]
    },
    set: function(bell) {

      bellObj.bells.forEach(function(item, index, arr) {
        if (item.ID === bell.ID) {
          if (item.Locked == true) {
            imports.eventbus.emit("bells_error_locked", item)
          } else {
            arr[index] = bell
          }
        }
      })

      imports.eventbus.emit("bells_bellchanged", bell)

    },
    delete: function(bell) {
      if (bell.Locked == true) {
        imports.eventbus.emit("bells_error_locked", item)
        return false
      }

      _.remove(bellObj.bells, function(item) {
        return item.ID === bell.ID
      })
    },
    toggle: function(bell, status) {
      if (bellObj.get(bell.ID).Locked == true) {
        imports.eventbus.emit("bells_error_locked", bell)
        return false
      }

      bell.Enabled = imports.validate.toBoolean(status)
      bellObj.set(bell)
    }
  }

  register(null, {
    bells: bellObj
  });
};
