module.exports = function setup(options, imports, register) {
    var package = require("./package.json")
    var winston = require('winston');
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.File, {
        filename: options.options.logfile
    });
    winston.add(winston.transports.Console, {
        'timestamp': true,
        'colorize': true
    });

    winston.level = process.env.LOG_LEVEL || 'debug'
    loggerObj = {
        plugin: package,
        log: function(text, type, obj) {
            if (typeof type === "undefined") {
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
        },
        query: winston.query.bind(winston)
    }

    register(null, {
        logger: loggerObj
    });
};
