module.exports = function setup(options, imports, register) {
  var package = require("./package.json")
  var restify = require("restify")
  var passport = require("passport")
  var Strategy = require('passport-http-bearer').Strategy;
  var bonjour = require("bonjour")()

  imports.eventbus.on("app.ready", function() {
    if(options.options.bonjour == true) {
      imports.logger.log("rest", "Publishing bellboy via bonjour", "info")
      bonjour.publish({ name: 'Bellboy', type: 'bellboy', port: options.options.port })
    }
  })

  // browse for all http services
bonjour.find({ type: 'bellboy' }, function (service) {
  imports.logger.log("rest", "Found another Bellboy instance", "info", { ip: service.addresses[0], host: service.host })
})

  var restObj = {
    plugin: package,
    restify: restify,
    get: {
      bells: function(req, res, next) {
        if (typeof req.params.id === "undefined") {
          res.json(imports.bells.bells)
        } else {
          res.json(imports.bells.get(req.params.id))
        }

        next()
      },
      nextbell: function(req, res, next) {
        res.send(imports.scheduler.next())
        next()
      },
      allbells: function(req, res, next) {
        res.send(imports.scheduler.next(true))
        next()
      },
      allprevbells: function(req, res, next) {
        res.send(imports.scheduler.prev(true))
        next()
      },
      prevbell: function(req, res, next) {
        res.json(imports.scheduler.prev())
        next()
      },
      audiofiles: function(req, res, next) {
        res.json(imports.audio.files())
        next()
      },
      volume: function(req, res, next) {
        percent = imports.audio.volume()
        res.json({percent: percent})
        next()
      },
      time: function(req, res, next) {
        res.send(new Date)
        next()
      },
      logs: function(req, res, next) {
        imports.logger.query({
          from: req.body.start || new Date - 24 * 60 * 60 * 1000,
          until: req.body.end || new Date,
          limit: req.body.limit || 0,
          start: req.body.offset || 0,
          order: req.body.sort || 'desc'
        }, function(err, results) {
          res.json(results)
          next()
        })

      }
    },
    set: {
      update: function(req, res, next) {

      },
      enable: function(req, res, next) {
        if (imports.bells.enable(req.params.id) == false) {
          res.send(423, new Error("Can't enable bell. Perhaps " + req.params.id + " is locked?"))
        } else {
          res.json(imports.bells.get(req.params.id))
          next()
        }
      },
      disable: function(req, res, next) {
        if (imports.bells.disable(req.params.id) == false) {
          res.send(423, new Error("Can't disable bell. Perhaps " + req.params.id + " is locked?"))
        } else {
          res.json(imports.bells.get(req.params.id))
          next()
        }
      },
      enableAll: function(req, res, next) {
        res.send(imports.bells.enableAll())
        next()
      },
      disableAll: function(req, res, next) {
        res.send(imports.bells.disableAll())
        next()
      },
      create: function(req, res, next) {
        res.send(imports.bells.create(req.body))
        next()
      },
      delete: function(req, res, next) {
        delRes = imports.bells.delete(req.params.id)
        if (delRes == false) {
          res.send(423, new Error("Can't delete bell. Perhaps " + req.params.id + " is locked?"))
        } else {
          res.send(delRes)
        }
      },
      appUpdate: function(req, res, next) {
        res.send(imports.updater.update())
      },
      volume: function(req, res, next) {
        res.json({percent: imports.audio.volume(req.body.percent)})
      }
    },
    trigger: function(req, res, next) {
      res.send(imports.scheduler.trigger(req.params.id))
    }
  }


  restObj.server = restify.createServer();


  restObj.server.use(passport.initialize());
  restObj.server.use(restify.bodyParser());

  passport.use(new Strategy(
    function(token, cb) {
      success = imports.users.authenticate(token)
      if (!success) {
        return cb(false)
      } else {
        return cb(null, token);
      }

    }))

  // The list of methods we can call. Each one is authenticated using Passport, and the relevant function is called above
  // restObj.server.get('/bells', passport.authenticate('bearer', { session: false }), restObj.get.bells);

  restObj.server.get('/bells/next', passport.authenticate('bearer', {
    session: false,
    scope: ["read"]
  }), restObj.get.nextbell);
  restObj.server.get('/bells/next/all', passport.authenticate('bearer', {
    session: false,
    scope: ["read"]
  }), restObj.get.allbells);
  restObj.server.get('/bells/prev', passport.authenticate('bearer', {
    session: false
  }), restObj.get.prevbell);
  restObj.server.get('/bells/prev/all', passport.authenticate('bearer', {
    session: false
  }), restObj.get.allprevbells);
  restObj.server.get('/bells/:id', passport.authenticate('bearer', {
    session: false
  }), restObj.get.bells);
  restObj.server.get('/bells', passport.authenticate('bearer', {
    session: false
  }), restObj.get.bells);
  restObj.server.get('/files/audio', passport.authenticate('bearer', {
    session: false
  }), restObj.get.audiofiles);
  restObj.server.get('/audio/volume', passport.authenticate('bearer', {
    session: false
  }), restObj.get.volume);
  restObj.server.get('/files/logs', passport.authenticate('bearer', {
    session: false
  }), restObj.get.logs);
  restObj.server.get('/time', passport.authenticate('bearer', {
    session: false
  }), restObj.get.time);
  restObj.server.post('/bells/create', passport.authenticate('bearer', {
    session: false
  }), restObj.set.create);
  restObj.server.post('/bells/enable/all', passport.authenticate('bearer', {
    session: false
  }), restObj.set.enableAll);
  restObj.server.post('/bells/disable/all', passport.authenticate('bearer', {
    session: false
  }), restObj.set.disableAll);
  restObj.server.post('/bells/enable/:id', passport.authenticate('bearer', {
    session: false
  }), restObj.set.enable);
  restObj.server.post('/bells/trigger/:id', passport.authenticate('bearer', {
    session: false
  }), restObj.trigger);
  restObj.server.post('/bells/disable/:id', passport.authenticate('bearer', {
    session: false
  }), restObj.set.disable);
  restObj.server.post('/audio/volume', passport.authenticate('bearer', {
    session: false
  }), restObj.set.volume);
  restObj.server.post('/app/update', passport.authenticate('bearer', {
    session: false
  }), restObj.set.appUpdate);
  restObj.server.del('/bells/:id', passport.authenticate('bearer', {
    session: false
  }), restObj.set.delete);



  restObj.server.listen(options.options.port, function() {
    imports.logger.log("rest", "REST server started. Access it via " + restObj.server.url)
  });


  register(null, {
    rest: restObj
  })
}
