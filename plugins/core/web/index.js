module.exports = function setup(options, imports, register) {

    require("./app.js")
    require("./bin/www")

    register(null, {
      web: { }
    });
};
