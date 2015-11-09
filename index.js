var architect = require("architect");


var plugins = [
  { packagePath: "./plugins/core/config", bellFile: __dirname + "/config/schedules/bells.json", configFile: __dirname + "/config.json" },
  { packagePath: "./plugins/core/eventbus"}
]


plugins = architect.resolveConfig(plugins, __dirname)

architect.createApp(plugins, function (err, app) {
    if (err) {
        throw "Error while trying to start app. Error was: " + err
    }

    app.services.config.LoadBells()

    app.services.eventbus.on("bellsloaded", function() {
      console.log("Bells loaded!")
    })

});
