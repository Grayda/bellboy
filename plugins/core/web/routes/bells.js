var express = require('express');
var router = express.Router();

module.exports = function(imports) {

  /* GET home page. */
  router.get('/bells', function(req, res, next) {
    res.json(imports.bells.toArray(true))
  });

  router.get("/bells/get/:bell", function(req, res, next) {
    res.send(imports.bells.get(req.params.bell))
  })

  router.get("/bells/next", function(req, res, next) {
    res.send(imports.scheduler.next())
  })

  router.get("/bells/next/:bell", function(req, res, next) {
    res.send(imports.scheduler.next(imports.bells.get(req.params.bell)))
  })

  router.get("/bells/next/:bell/date", function(req, res, next) {
    res.send(imports.scheduler.toString(imports.bells.get(req.params.bell)) || "test")
  })

  router.get("/bells/next/:bell/:amount", function(req, res, next) {
    res.send(imports.scheduler.next(imports.bells.get(req.params.bell), req.params.amount))
  })

  router.get("/bells/previous/:bell", function(req, res, next) {
    res.send(imports.scheduler.previous(imports.bells.get(req.params.bell)))
  })

  router.get("/bells/previous/:bell/:amount", function(req, res, next) {
    res.send(imports.scheduler.previous(imports.bells.get(req.params.bell), req.params.amount))
  })

  router.post("/bells/toggle/:bell", function(req, res, next) {
    if(imports.bells.get(req.params.bell).Locked == true) {
      res.sendStatus(423)
      return
    }

    imports.bells.set(req.params.bell, "Enabled", !imports.bells.get(req.params.bell).Enabled)
    res.send(imports.bells.get(req.params.bell).Enabled)
  })

  router.post("/bells/toggle/:bell/:state", function(req, res, next) {
    if(imports.bells.get(req.params.bell).Locked == true) {
      res.sendStatus(423)
      return
    }

    var state = (req.params.state === "true")

    console.log(state)
    imports.bells.set(req.params.bell, "Enabled", state)
    res.send(imports.bells.get(req.params.bell).Enabled)
  })

  return router

}
