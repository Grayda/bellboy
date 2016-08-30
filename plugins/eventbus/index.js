var EventEmitter = require("pattern-emitter")

module.exports = function setup(options, imports, register) {
    var emitter = new EventEmitter()
    eventbusObj = {
      pluginName: "Event Bus Plugin",
      pluginDescription: "Core plugin that provides inter-plugin communication",
      emitter: emitter,
      emit: emitter.emit.bind(emitter),
      on: emitter.on.bind(emitter),
      once: emitter.once.bind(emitter),
      error: function(err, module) {
        eventbusObj.emit("error", err, module)
      }
    }

    register(null, {
      eventbus: eventbusObj
    });
};
