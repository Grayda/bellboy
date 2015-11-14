module.exports = function setup(options, imports, register) {
    register(null, {
      logger: {
        log: function(text, level) {
          // If we haven't set a level, set it to 0
          if(!imports.validate.isInt(level)) {
            level = 0
          }

          // If we haven't set a DEBUG environment variable, set it to 0
          if(!imports.validate.isInt(process.env.DEBUG)) {
            process.env.DEBUG = 0
          }

          // If DEBUG level is greater or equal to the logging level, display the text
          if(process.env.DEBUG >= level) {
            console.log(text)
          }

        }
      }
    });
};
