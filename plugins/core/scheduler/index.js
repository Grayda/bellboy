module.exports = function setup(options, imports, register) {
  var later = require("later")
  var assert = require("assert")
  var _ = require("lodash")
  var moment = require("moment")

  var jobs = []
  var schedules = []
  var lastJob = []

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
            lastJob.unshift({ name: item, date: new Date() })
            imports.eventbus.emit("trigger", bells[item])
          } else {
            // The calling code might want to know if the bell would have triggered, were it enabled, so
            // we can use 'triggerwhiledisabled' to let people know. Good for running additional calculations
            imports.eventbus.emit("disabledtrigger", bells[item])
          }
        }.bind(this), schedules[item])
      })
    },
    // This function works out the next occurrence of bell. If no bell specified, searches all bells for the next time
    next: function(bell) {
      var nextdates = []
      if (imports.validate.isNull(bell)) {
        Object.keys(imports.bells.bells).forEach(function(item) {
          nextdates.push({
            date: scheduler.next(item),
            name: item
          })
        })

        return _.sortBy(nextdates, function(d) {
          return d.date;
        })
      } else {
        return later.schedule(schedules[bell]).next()
      }
    },
    previous: function(bell) {
      var prevdates = []
      if (imports.validate.isNull(bell)) {
        Object.keys(imports.bells.bells).forEach(function(item) {
          prevdates.push({
            date: scheduler.previous(item),
            name: item
          })
        })

        return _.sortBy(prevdates, function(d) {
          return -d.date;
        })
      } else {
        return later.schedule(schedules[bell]).prev()
      }
    },
    toString: function(name) {
      return moment(scheduler.next(name)).format("D MMMM YYYY, hh:mm:ssa")
    },
    toNow: function(name) {
      return moment().to(scheduler.next(name))
    }
  }

  register(null, {
    scheduler: scheduler
  })
}
