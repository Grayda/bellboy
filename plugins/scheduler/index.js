module.exports = function setup(options, imports, register) {
  var later = require("later")
  var _ = require("lodash")
  later.date.localTime();

  var schedulerObj = {
    pluginName: "Scheduler Plugin",
    pluginDescription: "Core plugin that schedules bells to trigger",
    jobs: [],
    schedules: [],
    history: [],
    // Takes our bell object and makes schedules and jobs out of them using later.js
    load: function(bells) {
      Object.keys(bells).forEach(function(item) {
        // If it's a special bell (starts with an underscore), ignore it
        if (bells[item].id.indexOf("_") == 0) {
          return
        }

        // Use local time for our scheduling

        // Create a new schedule out of the time
        schedulerObj.schedules[bells[item].id] = later.parse.cron(bells[item].time)
        if (bells[item].enabled == true) {
          imports.eventbus.emit("scheduler.scheduled", bells[item])
        } else {
          imports.eventbus.emit("scheduler.scheduled.disabled", bells[item])
        }
          // And create a new interval out of the schedule
        schedulerObj.jobs[bells[item].id] = later.setInterval(function() {
          if (bells[item].enabled == true) {
            // Trigger the job if it's enabled
            schedulerObj.history.unshift(bells[item])
            imports.eventbus.emit("scheduler.trigger", bells[item])
          } else {
            // The calling code might want to know if the bell would have triggered, were it enabled, so
            // we can use 'triggerwhiledisabled' to let people know. Good for running additional calculations
            imports.eventbus.emit("scheduler.trigger.disabled", bells[item])
          }
        }.bind(this), schedulerObj.schedules[bells[item].id])
      })
    },
    trigger: function(id) {
      if(typeof imports.bells.bells[id] === "undefined") {
        imports.eventbus.emit("scheduler.invalidtrigger", id)
        return false
      } else {
        if(imports.bells.bells[id].enabled == true) {
          imports.eventbus.emit("scheduler.trigger", imports.bells.bells[id])
          imports.eventbus.emit("scheduler.trigger.manual", imports.bells.bells[id])
        } else {
          imports.eventbus.emit("scheduler.trigger.disabled", imports.bells.bells[id])
          imports.eventbus.emit("scheduler.trigger.manual.disabled", imports.bells.bells[id])
        }
      }
    },
    next: function() {
      nextdates = []
      Object.keys(imports.bells.bells).forEach(function(item) {
        if (imports.bells.bells[item].id.indexOf("_") == 0 || imports.bells.bells[item].enabled == false) {
          return
        }

        nextdates.push({
          date: later.schedule(schedulerObj.schedules[imports.bells.bells[item].id]).next(),
          bell: imports.bells.bells[item]
        })

      })

      return _.sortBy(nextdates, function(d) {
        return { bell: imports.bells.bells[d.id], date: d.date }
      })[0]
    },
    prev: function() {
      prevdates = []
      Object.keys(imports.bells.bells).forEach(function(item) {
        if (imports.bells.bells[item].id.indexOf("_") == 0 || imports.bells.bells[item].enabled == false) {
          return
        }

        prevdates.push({
          date: later.schedule(schedulerObj.schedules[imports.bells.bells[item].id]).prev(),
          id: imports.bells.bells[item].id
        }).reverse()

      })

      return _.sortBy(prevdates, function(d) {
        return { bell: imports.bells.bells[d.id], date: d.date }
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
