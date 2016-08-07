module.exports = function setup(options, imports, register) {
    var restify = require("restify")
    var passport = require("passport")
    var Strategy = require('passport-http-bearer').Strategy;

    var restObj = {
        pluginName: "REST Plugin",
        pluginDescription: "Plugin that provides RESTful access to Bellboy",
        restify: restify,
        get: {
            bells: function(req, res, next) {
                passport.authenticate('bearer', { session: false })
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

            },
            enable: function(req, res, next) {
                imports.bells.enable(req.params.id)
                res.json(imports.bells.bells[req.params.id])
                next()
            },
            disable: function(req, res, next) {
                imports.bells.disable(req.params.id)
                res.json(imports.bells.bells[req.params.id])
                next()
            },
            enableAll: function(req, res, next) {
                imports.bells.enableAll()
                res.send(true)
            },
            disableAll: function(req, res, next) {
                imports.bells.disableAll()
                res.send(true)
            }
        }
    }


    restObj.server = restify.createServer();


    restObj.server.use(passport.initialize());

    passport.use(new Strategy(
      function(token, cb) {
        success = imports.users.authenticate(token)
        if(!success) {
          return cb(false)
        } else {
          return cb(null, "ABC123");
        }

        })
      )

    restObj.server.get('/bells', passport.authenticate('bearer', { session: false }), restObj.get.bells);
    restObj.server.get('/bells/next', restObj.get.nextbell);
    restObj.server.get('/bells/enable/all', restObj.set.enableAll);
    restObj.server.get('/bells/disable/all', restObj.set.disableAll);
    restObj.server.get('/bells/enable/:id', restObj.set.enable);
    restObj.server.get('/bells/disable/:id', restObj.set.disable);
    restObj.server.get('/bells/prev', restObj.get.prevbell);
    // restObj.server.post('/bells/:id', restObj.set.bell);


    restObj.server.listen(9001, function() {
        imports.logger.log("REST server started. Access it via " + restObj.server.url)
    });


    register(null, {
        rest: restObj
    })
}
