module.exports = function setup(options, imports, register) {
    var package = require("./package.json")
    var restify = require("restify")
    var passport = require("passport")
    var Strategy = require('passport-http-bearer').Strategy;

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
                prevbell: function(req, res, next) {
                    res.json(imports.scheduler.prev())
                    next()
                },
                audiofiles: function(res, res, next) {
                    res.json(imports.audio.files())
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
                res.send(imports.bells.delete(req.params.id))
            },
            appUpdate: function(req, res, next) {
                res.send(imports.updater.update())
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
restObj.server.get('/bells/prev', passport.authenticate('bearer', {
    session: false
}), restObj.get.prevbell);
restObj.server.get('/bells/:id', passport.authenticate('bearer', {
    session: false
}), restObj.get.bells);
restObj.server.get('/bells', passport.authenticate('bearer', {
    session: false
}), restObj.get.bells);
restObj.server.del('/bells/:id', passport.authenticate('bearer', {
    session: false
}), restObj.set.delete);
restObj.server.post('/bells/create', passport.authenticate('bearer', {
    session: false
}), restObj.set.create);
restObj.server.get('/files/audio', passport.authenticate('bearer', {
    session: false
}), restObj.get.audiofiles);
restObj.server.post('/files/logs', passport.authenticate('bearer', {
    session: false
}), restObj.get.logs);
restObj.server.post('/app/update', passport.authenticate('bearer', {
    session: false
}), restObj.set.appUpdate);


restObj.server.listen(9001, function() {
    imports.logger.log("REST server started. Access it via " + restObj.server.url)
});


register(null, {
    rest: restObj
})
}
