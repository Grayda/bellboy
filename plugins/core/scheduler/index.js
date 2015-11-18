module.exports = function setup(options, imports, register) {
  var later = require("later")
  var assert = require("assert")
  var _ = require("lodash")

  var jobs = []
  var schedules = []
  var lastJob = {}

  var scheduler = {
    jobs: jobs,
    schedules: schedules,
    lastJob: lastJob,
    scheduleBells: function(bells) {
      Object.keys(bells).forEach(function(item) {
        if (item.indexOf("_") > -1) {
          return
        }
        imports.logger.log("Bell scheduled: " + item, 1)
        later.date.localTime();
        schedules[item] = later.parse.cron(bells[item].Time)
        jobs[item] = later.setInterval(function() {
          if (bells[item].Enabled == true) {
            // Trigger the job if it's enabled
            lastJob.name = item
            lastJob.date = new Date()
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
    },
    getNextJob: function() {
      var nextdates = []
      Object.keys(imports.bells.bells).forEach(function(item) {
        nextdates.push({ date: scheduler.next(item), name: item })
      })

      return _.sortBy(nextdates, function(d) { return d.date; })
    }
  }

  register(null, {
    scheduler: scheduler
  })
}
