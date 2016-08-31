module.exports = function setup(options, imports, register) {
    var winston = require('winston');
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {'timestamp': true, 'colorize': true });

    winston.level = process.env.LOG_LEVEL || 'debug'
    loggerObj = {
        pluginName: "Logger Plugin",
        pluginDescription: "Core plugin that records logs",
        log: function(text, type, obj) {
          if(typeof type === "undefined") {
            type = "info"
          }
          winston.log(type, text, obj || null)
          imports.eventbus.emit("logger." + type, text)
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
