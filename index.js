var fs = require("fs")
var architect = require("architect")

// A list of plugins we'd like to load. Some of them require options, so be sure to check the plugin for what options are required
plugins = architect.resolveConfig(JSON.parse(fs.readFileSync("./plugins/plugins.json", 'utf8')), __dirname);

console.log("Welcome to Bellboy! Loading plugins..")
console.log()
// Start our app. The callback happens when all plugins have loaded, so plugin order shouldn't really matter
architectApp = architect.createApp(plugins, function (err, app) {
    if (err) {
        throw "Error while trying to start app. Error was: " + err
    }

    app.services.eventbus.on("scheduler.scheduled", function(item) {
      app.services.logger.log("Bell scheduled: " + item.name)
    })

    app.services.eventbus.on("bells.loaded", function(bells) {
      app.services.logger.log(app.services.bells.bells.length + " bells loaded")
      app.services.scheduler.load(app.services.bells.bells)
    })

    app.services.eventbus.on("scheduler.trigger", function(item) {
      app.services.logger.log("Bell triggered: " + item.name)
    })

    console.log()
    app.services.bells.load()

});

architectApp.on("service", function(name, service) {
  console.log("Loaded plugin: " + service.pluginName)
})

architectApp.on("error", function(err) {
  console.log(err)
})
