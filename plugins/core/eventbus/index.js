var EventEmitter = require("events").EventEmitter

module.exports = function setup(options, imports, register) {
    var emitter = new EventEmitter()
    register(null, {
      eventbus: {
        emit: emitter.emit,
        on: emitter.on
      }
    });
};
