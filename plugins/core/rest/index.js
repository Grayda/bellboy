module.exports = function setup(options, imports, register) {
  var restify = require('restify')
  var _ = require("lodash")
  var assert = require("assert")

  assert(options.port, "Port option missing for REST plugin!")

  var server = restify.createServer();
  server.get('/get/:bell', function(req, res, next) {
    res.send(_.get(imports.bells.bells, req.params.bell))
    next()
  });

  server.get('/get', function(req, res, next) {
    res.send(imports.bells.bells)
    next()
  });


  server.listen(options.port, function() {
    imports.logger.log("REST plugin listening on port " + options.port, 1)
  });

  register(null, {
    rest: {}
  });

};
