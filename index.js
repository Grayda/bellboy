var architect = require("architect");

// A list of plugins we'd like to load. Some of them require options, so be sure to check the plugin for what options are required
var plugins = [
  { packagePath: "./plugins/core/config", configFile: __dirname + "/core/config/config_default.json" },
  { packagePath: "./plugins/core/bells", bellFile: __dirname + "/core/config/schedules/bells.json" },
  // { packagePath: "./plugins/core/audio", audioPath: __dirname + "/audio/", playerPath: __dirname + "/plugins/core/audio/mpg123/mpg123.exe" },
  { packagePath: "./plugins/core/logger" },
  { packagePath: "./plugins/core/web", port: 3000 },
  { packagePath: "./plugins/core/eventbus"},
  { packagePath: "./plugins/core/scheduler" },
  { packagePath: "./plugins/core/schema" },
  { packagePath: "./plugins/core/validate" },
  { packagePath: "./plugins/core/pitft", backlight: 18, button1: 17, button2: 22, button3: 23, button4: 27 }
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

    app.services.eventbus.on("button1", function() {
      app.services.eventbus.emit("trigger", app.services.bells.get("test"))
    })

    app.services.eventbus.on("trigger", function(bell) {
      app.services.logger.log("Bell was triggered: " + bell.Name)
    })

    // app.services.config.loadConfig()
    app.services.bells.loadBells()
    app.services.scheduler.scheduleBells(app.services.bells.bells)

});

architectApp.on("service", function(name, service) {
  console.log("Loaded plugin: %s", name)
})

architectApp.on("error", function(err) {
  console.log(err)
})
