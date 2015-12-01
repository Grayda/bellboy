var express = require('express');
var router = express.Router();

module.exports = function(imports) {

  // =====================================================================================================================
  // Bell related API functions
  // =====================================================================================================================

  // Returns a list of bells
  router.get('/bells/get', function(req, res, next) {
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
    if (imports.bells.get(req.params.bell).Locked == true) {
      imports.eventbus.emit("bells_error_locked", imports.bells.get(req.params.bell))
      res.sendStatus(423)
      return
    }

    imports.bells.toggle(imports.bells.get(req.params.bell), !imports.bells.get(req.params.bell).Enabled)
    res.send(imports.bells.get(req.params.bell).Enabled)
  })

  router.post("/bells/toggle/:bell/:state", function(req, res, next) {
    if (imports.bells.get(req.params.bell).Locked == true) {
      imports.eventbus.emit("bells_error_locked", imports.bells.get(req.params.bell))
      res.sendStatus(423)
      return
    }

    state = imports.validate.toBoolean(req.params.state)
    imports.bells.toggle(imports.bells.get(req.params.bell), state)
    res.send(imports.bells.get(req.params.bell).Enabled)
  })

  router.post("/bells/trigger/:bell", function(req, res, next) {
    imports.eventbus.emit("trigger", imports.bells.get(req.params.bell))
  })

  router.delete("/bells/delete/:bell", function(req, res, next) {
    if (imports.bells.get(req.params.bell).Locked == true) {
      imports.eventbus.emit("bells_error_locked", imports.bells.get(req.params.bell))
      res.sendStatus(423)
      return
    }
    res.send(imports.bells.delete(imports.bells.get(req.params.bell)))
  })

  router.put("/bells/update/:bell", function(req, res, next) {
    if (imports.bells.get(req.params.bell).Locked == true) {
      imports.eventbus.emit("bells_error_locked", imports.bells.get(req.params.bell))
      res.sendStatus(423)
      return
    }

    imports.bells.set(req.body)
    res.send(imports.bells.get(req.params.bell))
  })

  router.post("/bells/create/", function(req, res, next) {
    imports.bells.create(req.body)
  })

  // =====================================================================================================================
  // Schema related functions
  // =====================================================================================================================

  router.get("/schema", function(req, res, next) {
    res.json(imports.schema.schema)
  })

  return router

}
