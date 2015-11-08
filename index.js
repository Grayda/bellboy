var architect = require("architect");


var plugins = [
  { packagePath: "./plugins/core/eventbus"},
  { packagePath: "./plugins/core/config", bellFile: __dirname + "/bells.json", configFile: __dirname + "/config.json" }
]


plugins = architect.resolveConfig(plugins, __dirname)

architect.createApp(plugins, function (err, app) {
    if (err) {
        throw "Error while trying to start app. Error was: " + err
    }

});
