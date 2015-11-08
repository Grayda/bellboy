var architect = require("architect");

var config = architect.loadConfig(__dirname + "/config/plugins.js");

architect.createApp(config, function (err, app) {
    if (err) {
        throw err
    }

    app.services.database.insert("blah", {"blah": "hello"})
    console.log(app.services.database.find("blah"))

});
