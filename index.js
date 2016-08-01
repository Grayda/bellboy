var architect = require("architect")
var plugins = require("./plugins.json")
plugins = architect.resolveConfig(plugins, __dirname)

architectApp = architect.createApp(plugins, function (err, app) {

})

architectApp.on("service", function(name, service) {
  console.log("Loaded plugin: " + name)
})
