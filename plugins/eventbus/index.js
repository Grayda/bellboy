var EventEmitter2 = require("eventemitter2").EventEmitter2

module.exports = function setup(options, imports, register) {
    var emitter = new EventEmitter2()
    eventbusObj = {
      pluginName: "Event Bus Plugin",
      pluginDescription: "Core plugin that provides inter-plugin communication",
      emitter: emitter,
      emit: emitter.emit,
      on: emitter.on,
      error: function(err, module) {
        eventbusObj.emit("error", err, module)
      }
    }

    register(null, {
      eventbus: eventbusObj
    });
};