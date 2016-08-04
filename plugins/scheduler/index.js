module.exports = function setup(options, imports, register) {
  var later = require("later")

  var scheduler = {
    pluginName: "Scheduler Plugin",
    pluginDescription: "Core plugin that schedules bells to trigger",
    jobs: [],
    schedules: [],
    history: [],
    // Takes our bell object and makes schedules and jobs out of them using later.js
    load: function(bells) {
      bells.forEach(function(item) {
        // If it's a special bell (starts with an underscore), ignore it
        if (item.id.indexOf("_") == 0) {
          return
        }

        // Use local time for our scheduling
        later.date.localTime();
        // Create a new schedule out of the time
        schedules[item.id] = later.parse.cron(item.time)
        imports.eventbus.emit("scheduler.scheduled", item)
          // And create a new interval out of the schedule
        jobs[item.id] = later.setInterval(function() {
          if (item.enabled == true) {
            // Trigger the job if it's enabled
            history.unshift(item)
            imports.eventbus.emit("scheduler.trigger", item)
          } else {
            // The calling code might want to know if the bell would have triggered, were it enabled, so
            // we can use 'triggerwhiledisabled' to let people know. Good for running additional calculations
            imports.eventbus.emit("scheduler.trigger.disabled", item)
          }
        }.bind(this), schedules[item.id])
      })
    }

  }
  register(null, {
    scheduler: scheduler
  })
}
