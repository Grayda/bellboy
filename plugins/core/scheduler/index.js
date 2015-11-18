module.exports = function setup(options, imports, register) {
  var later = require("later")
  var assert = require("assert")

  var jobs = []
  var schedules = []

  var scheduler = {
    jobs: jobs,
    schedules: schedules,
    scheduleBells: function(bells) {
      Object.keys(bells).forEach(function(item) {
        if (item.indexOf("_") > -1) {
          return
        }
        imports.logger.log("Bell scheduled: " + item, 2)
        later.date.localTime();
        schedules[item] = later.parse.cron(bells[item].Time)
        jobs[item] = later.setInterval(function() {
          if (bells[item].Enabled == true) {
            // Trigger the job if it's enabled
            imports.eventbus.emit("trigger", bells[item])
          } else {
            // The calling code might want to know if the bell would have triggered, were it enabled, so
            // we can use 'triggerwhiledisabled' to let people know. Good for running additional calculations
            imports.eventbus.emit("disabledtrigger", bells[item])
          }
        }.bind(this), schedules[item])
      })
    },
    next: function(bell) {
      assert(bell, "A bell name must be provided when calling 'scheduler.next()'!")
      return later.schedule(schedules[bell]).next()
    }
  }
  register(null, {
    scheduler: scheduler
  })
}
