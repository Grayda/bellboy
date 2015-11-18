var architect = require("architect");

// A list of plugins we'd like to load. Some of them require options, so be sure to check the plugin for what options are required
var plugins = [
  { packagePath: "./plugins/core/config", root: __dirname, configFile: __dirname + "/core/config/config_default.json" },
  { packagePath: "./plugins/core/bells", root: __dirname, bellFile: __dirname + "/core/config/schedules/test.json" },
  // { packagePath: "./plugins/core/audio", audioPath: __dirname + "/audio/", playerPath: __dirname + "/plugins/core/audio/mpg123/mpg123.exe" },
  { packagePath: "./plugins/core/scheduler" },
  { packagePath: "./plugins/core/rest", port: 9001, useREST: true, useRSS: true },
  // { packagePath: "./plugins/core/rssfeed", port: 9002 },
  { packagePath: "./plugins/core/logger" },
  { packagePath: "./plugins/core/eventbus"},
  { packagePath: "./plugins/core/validate" }
]

plugins = architect.resolveConfig(plugins, __dirname)

// Start our app. The callback happens when all plugins have loaded, so plugin order shouldn't really matter
architectApp = architect.createApp(plugins, function (err, app) {
    if (err) {
        throw "Error while trying to start app. Error was: " + err
    }

    console.log("===============================")

    app.services.eventbus.on("bells_bellsloaded", function() {
      app.services.logger.log("Bells loaded!")
    })

    app.services.eventbus.on("config_configloaded", function() {
      app.services.logger.log("Configuration loaded!")
    })

    app.services.eventbus.on("error", function(err) {
      throw err
    })

    app.services.config.loadConfig()
    app.services.bells.loadBells()
    app.services.scheduler.scheduleBells(app.services.bells.bells)

});

architectApp.on("service", function(name, service) {
  console.log("Loaded plugin: %s", name)
})

architectApp.on("error", function(err) {
  console.log(err)
})
