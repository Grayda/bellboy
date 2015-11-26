var EventEmitter = require("events").EventEmitter

module.exports = function setup(options, imports, register) {
    var emitter = new EventEmitter()
    eventbusObj = {
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
