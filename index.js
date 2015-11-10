var architect = require("architect");


var plugins = [
  { packagePath: "./plugins/core/config", bellFile: __dirname + "/core/config/schedules/bells_default.json", configFile: __dirname + "/core/config/config_default.json" },
  { packagePath: "./plugins/core/scheduler" },
  { packagePath: "./plugins/core/eventbus"}
]


plugins = architect.resolveConfig(plugins, __dirname)

architect.createApp(plugins, function (err, app) {
    if (err) {
        throw "Error while trying to start app. Error was: " + err
    }

    app.services.eventbus.on("bellsloaded", function() {
      console.log("Bells loaded!")
    })

    app.services.eventbus.on("configloaded", function() {
      console.log("Configuration loaded!")
    })

    app.services.eventbus.on("error", function(err) {
      throw err
    })

    app.services.config.loadConfig()
    app.services.config.loadBells()
    app.services.scheduler.scheduleBells(app.services.config.bells)

});
