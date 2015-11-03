module.exports = function setup(options, imports, register) {
  var EventEmitter = require("events").EventEmitter
  var emitter = new EventEmitter()
  register(null, {
    // "auth" is a service this plugin provides
    eventbus: {
      emit: emitter.emit,
      on: emitter.on,
    }
  });

};
