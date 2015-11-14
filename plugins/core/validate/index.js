module.exports = function setup(options, imports, register) {
    var validator = require("validator")

    validator.extend('isFilename', function (str) {
      return /^[^\\\/:"*?<>|]+$/i.test(str);
    });

    register(null, {
      validate: validator
    });
};
