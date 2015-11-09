module.exports = function setup(options, imports, register) {
    var jobs, schedules
    var later = require("later")
    register(null, {
        scheduler: {
          jobs: jobs,
          schedules: schedules,
          scheduleBells: function(bells) {
            Object.keys(bells).forEach(function(item) {
                if(item.indexOf("_") > -1) { return }
                console.log(this.bells[item].Time)
                this.schedules[item] = later.parse.cron(this.bells[item].Time)
                this.jobs[item] = later.setInterval(function() {

                  if (this.bells[item].Enabled == true) {
                    // Trigger the job if it's enabled
                    imports.eventbus.emit("trigger", this.bells[item])
                  } else {
                    // The calling code might want to know if the bell would have triggered, were it enabled, so
                    // we can use 'triggerwhiledisabled' to let people know. Good for running additional calculations
                    this.emit("disabledtrigger", this.bells[item])
                  }
                }.bind(this), this.schedules[item])
              })
            }
          }
        })
    }
