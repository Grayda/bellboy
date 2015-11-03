var architect = require("architect");

var config = architect.loadConfig(__dirname + "/config/plugins.js");

architect.createApp(config, function (err, app) {
    if (err) {
        console.error("Error while starting the app:" + err);
    }

});
