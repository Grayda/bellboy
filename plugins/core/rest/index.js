module.exports = function setup(options, imports, register) {
  var restify = require('restify')
  var _ = require("lodash")
  var assert = require("assert")
  var RSS = require('rss')
  var os = require("os");

  assert(options.port, "Port option missing for REST plugin!")
  // assert(options.useRSS, "'useRSS' option missing for REST plugin. Must be true or false!")
  // assert(options.useREST, "'useREST' option missing for REST plugin. Must be true or false!")

  var server = restify.createServer();

  if (options.useREST == true) {
    server.get('/json/:bell', function(req, res, next) {
      res.json(_.get(imports.bells.bells, req.params.bell))
      next()
    });

    server.get("/json/:bell/:property", function(req, res, next) {
      res.json(_.get(imports.bells.bells[req.params.bell], req.params.property))
    })

    server.get('/json', function(req, res, next) {
      res.json(imports.bells.bells)
      next()
    });
  }

  server.get("/rss", function(req, res, next) {
    if (options.useRSS == false) {
      res.send(404)
    }
    var feed = new RSS({
      title: "Bellboy RSS feed",
      description: "Bells from Bellboy",
      feed_url: "http://" + os.hostname() + ":" + options.port,
      site_url: "http://" + os.hostname() + ":" + options.port,
    });

    Object.keys(imports.bells.bells).forEach(function(item) {
      var bellitem = imports.bells.bells[item]
      feed.item({
        title: bellitem.Name,
        description: bellitem.Description,
        guid: item,
        date: imports.scheduler.next(item)
      })
    })

    res.end(feed.xml({
      indent: true
    }))
    next();
  })

  server.listen(options.port, function() {
    imports.logger.log("REST plugin listening on port " + options.port, 1)
  });

  register(null, {
    rest: {}
  });

};
