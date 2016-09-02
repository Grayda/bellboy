var fs = require("fs")
var architect = require("architect")
var cfonts = require("cfonts")

console.log()
console.log()
console.log("    Welcome to")
cfonts.say(' bellboy', {
    font: 'block',        //define the font face
    align: 'left',        //define text alignment
    colors: ["white", "black"], //define all colors
    background: 'black', //define the background color    letterSpacing: 1,     //define letter spacing
    lineHeight: 1,        //define the line height
    space: false,          //define if the output text should have empty lines on top and on the bottom
    maxLength: '0'        //define how many character can be on one line
})
console.log("        The Bell Timer System")
console.log()
console.log()

// A list of plugins we'd like to load. Some of them require options, so be sure to check the plugin for what options are required
plugins = architect.resolveConfig(JSON.parse(fs.readFileSync("./plugins/plugins.json", 'utf8')), __dirname);

console.log("Loading plugins..")
console.log()
// Start our app. The callback happens when all plugins have loaded, so plugin order shouldn't really matter
architectApp = architect.createApp(plugins, function (err, app) {
    if (err) {
        throw "Error while trying to start app. Error was: " + err
    }

    app.services.eventbus.on("scheduler.scheduled", function(item) {
      // app.services.logger.log("Bell scheduled: " + item.name)
    })

    app.services.eventbus.on("bells.loaded", function(bells) {
      app.services.logger.log(Object.keys(app.services.bells.bells).length + " bells loaded")
    })

    app.services.eventbus.on("scheduler.scheduled.finish", function(item) {
      app.services.logger.log(Object.keys(app.services.scheduler.schedules).length + " bells scheduled")
    })

    app.services.eventbus.on("scheduler.scheduled.disabled", function(item) {
      // app.services.logger.log("Bell disabled, but scheduled: " + item.name)
    })

    app.services.eventbus.on("bells.enabled", function(id) {
      app.services.logger.log("Bell enabled: " + app.services.bells.get(id).name)
    }.bind(this))

    app.services.eventbus.on("bells.disabled", function(id) {
      app.services.logger.log("Bell disabled: " + app.services.bells.get(id).name)
    }.bind(this))

    app.services.eventbus.on("bells.all.disabled", function() {
      app.services.logger.log("All bells disabled!", "WARN")
    }.bind(this))

    app.services.eventbus.on("bells.all.enabled", function() {
      app.services.logger.log("All bells enabled!", "WARN")
    }.bind(this))

    app.services.eventbus.on("scheduler.trigger.enabled", function(item) {
      app.services.logger.log("Bell triggered: " + item.name)
    })

    app.services.eventbus.on("audio.stopped", function() {
      nextBell = app.services.scheduler.next()
      app.services.logger.log("Next bell to ring will be: " + nextBell.bell.name + " at " + nextBell.date)
    })

    app.services.eventbus.on("scheduler.trigger.manual", function(item) {
      app.services.logger.log("Bell manually triggered: " + item.name, "WARN")
    })

    app.services.eventbus.on("scheduler.trigger.disabled.manual", function(item) {
      app.services.logger.log("Disabled bell manually triggered: " + item.name, "WARN")
    })

    app.services.eventbus.on("users.authenticate.success", function(key) {
      app.services.logger.log("A user has logged in")
    })

    app.services.eventbus.on("users.authenticate.fail", function(key) {
      app.services.logger.log("A failed login attempt was detected using key " + key, "WARN")
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

architectApp.on("ready", function(app) {
  nextBell = app.services.scheduler.next()
  app.services.logger.log("Next bell to ring will be: " + nextBell.bell.name + " at " + nextBell.date)
})
