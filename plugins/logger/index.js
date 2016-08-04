module.exports = function setup(options, imports, register) {
    loggerObj = {
      pluginName: "Logger Plugin",
      pluginDescription: "Core plugin that records logs",
      log: function(text, type) {
        if(typeof type === "undefined") {
          type = "log"
        }
        console.log(new Date() + " - " + "[" + type + "]" . text)
        imports.eventbus.emit("logger." . type, text)
      },
      error: function(text) {
        this.log(text, "error")
      },
      warn: function(text) {
        this.log(text, "warn")
      },
      debug: function(text) {
        this.log(text, "debug")
      }

    }

    register(null, {
      logger: loggerObj
    });
};
