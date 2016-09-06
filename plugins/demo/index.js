module.exports = function setup(options, imports, register) {
    // Required by all plugins. Lets Architect get the author, package name and description
    var package = require("./package.json")

    // Plugins can react to events. For example, you can do something every time a bell is triggered
    // If you want to trigger an event, it's best to consume that plugin and do it that way.
    imports.eventbus.on(/(.*)/, function() {
      // imports.logger.log("An event was detected: " + this.event)
    })

    demoObj = {
        plugin: package,
        test: function() {
          // Outputs "world" to the log
          imports.logger.log(options.options.hello)
          // Emits "demo.test" over the event bus. See the eventbus plugin for more info
          imports.eventbus.emit("demo.test")
        }
    }

    // package.json tells Architect to expect a "demo" object, and we tell Architect about it here
    register(null, {
        demo: demoObj
    });
};
