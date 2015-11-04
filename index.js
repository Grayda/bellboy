var architect = require("architect");

var config = architect.loadConfig(__dirname + "/config/plugins.js");

architect.createApp(config, function (err, app) {
    if (err) {
        console.error("Error while starting the app:" + err);
    }

    app.services.database.db.collections(function(e, cols) {
        cols.forEach(function(col) {
            console.log(col.collectionName);
        });
    });

    app.services.database.insert("blah", {a: "hello"})
    console.log(app.services.database.find())

});
