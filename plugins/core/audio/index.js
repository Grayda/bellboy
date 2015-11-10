module.exports = function setup(options, imports, register) {
    var _ = require("lodash")

    imports.eventbus.on("trigger", function(bell) {
      play(bell)
    })

    register(null, {
      audio: {
        play: function(bell) {
          try {
            file = _.shuffle(bell.Actions.Audio.File)
            this.playFile(file[0])
          } catch(ex) {
            imports.eventbus.error(ex)
          }
        },
        playFile: function(file) {

        },
      }
    });
};
