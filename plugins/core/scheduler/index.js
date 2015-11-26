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
      bells.forEach(function(item) {
        if (item.ID.indexOf("_") > -1) {
          return
        }
        imports.logger.log("Bell scheduled: " + item.ID, 1)
        later.date.localTime();
        schedules[item.ID] = later.parse.cron(item.Time)
        jobs[item.ID] = later.setInterval(function() {
          if (item.Enabled == true) {
            // Trigger the job if it's enabled
            lastJob.unshift({ id: item.ID, date: new Date() })
            imports.eventbus.emit("trigger", item)
          } else {
            // The calling code might want to know if the bell would have triggered, were it enabled, so
            // we can use 'triggerwhiledisabled' to let people know. Good for running additional calculations
            imports.eventbus.emit("disabledtrigger", item)
          }
        }.bind(this), schedules[item.ID])
      })
    },
    // This function works out the next occurrence of bell. If no bell specified, searches all bells for the next time
    next: function(bell, amount) {
      if(typeof amount === "undefined") { amount = 1 }
      var nextdates = []
      if (imports.validate.isNull(bell)) {
        imports.bells.bells.forEach(function(item) {
          if(item.ID.indexOf("_") == 0 || item.Enabled == false) { return }
          nextdates.push({
            date: scheduler.next(item),
            id: item.ID
          })
        })

        return _.sortBy(nextdates, function(d) {
          return d.date;
        })
      } else {
        return later.schedule(schedules[bell.ID]).next(amount)
      }
    },
    previous: function(bell) {
      var prevdates = []
      if (imports.validate.isNull(bell)) {
        imports.bells.bells.forEach(function(item) {
          if(item.ID.indexOf("_") == 0 || item.Enabled == false) { return }
          prevdates.push({
            date: scheduler.previous(item),
            id: item.ID
          })
        })

        return _.sortBy(prevdates, function(d) {
          return -d.date;
        })
      } else {
        return later.schedule(schedules[bell.ID]).prev()
      }
    },
    toString: function(bell) {
      return moment(scheduler.next(bell)).format("D MMMM YYYY, hh:mm:ssa")
    },
    toNow: function(bell) {
      return moment().to(scheduler.next(bell))
    },
    toInt: function(bell) {
      return moment().diff(scheduler.next(bell))
    }
  }

  register(null, {
    scheduler: scheduler
  })
}
