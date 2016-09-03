module.exports = function setup(options, imports, register) {
  var package = require("./package.json")
  var later = require("later")
  var _ = require("lodash")
  later.date.localTime();

  var schedulerObj = {
    plugin: package,
    jobs: [],
    schedules: [],
    history: [],
    // Takes our bell object and makes schedules and jobs out of them using later.js
    load: function(bells) {
      Object.keys(bells).forEach(function(item) {
        // If it's a special bell (starts with an underscore), ignore it
        if (item.indexOf("_") == 0) {
          return
        }

        // Use local time for our scheduling

        // Create a new schedule out of the time
        schedulerObj.schedules[item] = later.parse.cron(imports.bells.get(item).time)
        if (bells[item].enabled == true) {
          imports.eventbus.emit("scheduler.scheduled", imports.bells.get(item))
        } else {
          imports.eventbus.emit("scheduler.scheduled.disabled", imports.bells.get(item))
        }

        // Clear existing jobs
        if (typeof schedulerObj.jobs[item] !== "undefined") {
          schedulerObj.jobs[item].clear()
        }
        // And create a new interval out of the schedule
        schedulerObj.jobs[item] = later.setInterval(function() {
          if (bells[item].enabled == true) {
            // Trigger the job if it's enabled
            schedulerObj.history.unshift(imports.bells.get(item))
            imports.eventbus.emit("scheduler.trigger.enabled", imports.bells.get(item))
          } else {
            // The calling code might want to know if the bell would have triggered, were it enabled, so
            // we can use 'triggerwhiledisabled' to let people know. Good for running additional calculations
            imports.eventbus.emit("scheduler.trigger.disabled", imports.bells.get(item))
          }
        }.bind(this), schedulerObj.schedules[item])
      })
      imports.eventbus.emit("scheduler.scheduled.finish")
    },
    trigger: function(id) {
      if (imports.bells.get(id) === "undefined") {
        imports.eventbus.emit("scheduler.invalidtrigger", id)
        return false
      } else {
        if (imports.bells.get(id).enabled == true) {
          imports.eventbus.emit("scheduler.trigger.enabled.manual", imports.bells.get(id))
          return true
        } else {
          imports.eventbus.emit("scheduler.trigger.disabled.manual", imports.bells.get(id))
          return true
        }
      }
    },
    next: function() {
      nextdates = []

      Object.keys(imports.bells.bells).forEach(function(item) {
        if (item.indexOf("_") == 0 || imports.bells.get(item).enabled == false) {
          return
        }

        nextdates.push({
          date: later.schedule(schedulerObj.schedules[item]).next(),
          bell: imports.bells.get(item)
        })

      })

      return _.sortBy(nextdates, function(d) {
        return d.date
      })[0]
    },
    prev: function() {
      prevdates = []

      Object.keys(imports.bells.bells).forEach(function(item) {
        if (item.indexOf("_") == 0 || imports.bells.get(item).enabled == false) {
          return
        }

        prevdates.push({
          date: later.schedule(schedulerObj.schedules[item]).prev(),
          bell: imports.bells.get(item)
        })

      })

      return _.sortBy(prevdates, function(d) {
        return -d.date
      })[0]
    }
  }

  imports.eventbus.on("bells.loaded", function() {
    schedulerObj.load(imports.bells.bells)
  })

  register(null, {
    scheduler: schedulerObj
  })
}
