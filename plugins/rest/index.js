module.exports = function setup(options, imports, register) {
  var restify = require("restify")
  var passport = require("passport")

  var restObj = {
    pluginName: "REST Plugin",
    pluginDescription: "Plugin that provides RESTful access to Bellboy",
    restify: restify,
    get: {
      bells: function(req, res, next) {
        res.json(imports.bells.bells)
        next()
      },
      nextbell: function(req, res, next) {
        res.json(imports.scheduler.next())
        next()
      },
      prevbell: function(req, res, next) {
        res.json(imports.scheduler.prev())
        next()
      }
    },
    set: {
      bell: function(req, res, next) {

      }
    }
  }

  restObj.server = restify.createServer();
  restObj.server.get('/bells', restObj.get.bells);
  restObj.server.get('/bells/next', restObj.get.nextbell);
  restObj.server.get('/bells/prev', restObj.get.prevbell);
  restObj.server.post('/bells/:id', restObj.set.bell);


  restObj.server.listen(9001, function() {
    imports.logger.log("REST server started. Access it via " + restObj.server.url)
  });


  register(null, {
    rest: restObj
  })
}
