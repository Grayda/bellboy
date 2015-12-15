var express = require('express');
var router = express.Router();

module.exports = function(imports) {

  // =====================================================================================================================
  // Bell related API functions
  // =====================================================================================================================

  // Returns a list of bells
  router.get('/bells/all', function(req, res, next) {
    imports.logger.log("API - Get all bells (including virtual)", 1)
    res.json(imports.bells.toArray(false))
  });

  router.get('/bells/get', function(req, res, next) {
    imports.logger.log("API - Get all bells", 1)
    res.json(imports.bells.toArray(true))
  });

  router.get("/bells/get/:bell", function(req, res, next) {
    imports.logger.log("API - Get bell: " + req.params.bell, 1)
    res.send(imports.bells.get(req.params.bell))
  })

  router.get("/bells/next", function(req, res, next) {
    imports.logger.log("API - Get next ring time for all bells", 1)
    res.send(imports.scheduler.next())
  })

  router.get("/bells/next/:bell", function(req, res, next) {
    imports.logger.log("API - Get next ring time for bell: " + req.params.bell, 1)
    res.send(imports.scheduler.next(imports.bells.get(req.params.bell)))
  })

  router.get("/bells/next/:bell/date", function(req, res, next) {
    imports.logger.log("API - Get human readable next ring time for bell: " + req.params.bell, 1)
    res.send(imports.scheduler.toString(imports.bells.get(req.params.bell)))
  })

  router.get("/bells/next/:bell/:amount", function(req, res, next) {
    imports.logger.log("API - Get next " + req.params.amount + " ring times for bell: " + req.params.bell, 1)
    res.send(imports.scheduler.next(imports.bells.get(req.params.bell), req.params.amount))
  })

  router.get("/bells/previous/:bell", function(req, res, next) {
    imports.logger.log("API - Get previous ring time for bell: " + req.params.bell, 1)
    res.send(imports.scheduler.previous(imports.bells.get(req.params.bell)))
  })

  router.get("/bells/previous/:bell/:amount", function(req, res, next) {
    imports.logger.log("API - Get last " + req.params.amount + " ring times for bell: " + req.params.bell, 1)
    res.send(imports.scheduler.previous(imports.bells.get(req.params.bell), req.params.amount))
  })

  router.post("/bells/toggle/:bell", function(req, res, next) {
    if (imports.bells.get(req.params.bell).Locked == true) {
      imports.logger.log("API - Tried to toggle bell: " + req.params.bell + " but was locked", 1)
      imports.eventbus.emit("bells_error_locked", imports.bells.get(req.params.bell))
      res.sendStatus(423)
      return
    }

    imports.bells.toggle(imports.bells.get(req.params.bell), !imports.bells.get(req.params.bell).Enabled)
    imports.logger.log("API - Bell: " + req.params.bell + " toggled. New state is: " + imports.bells.get(req.params.bell).Enabled, 1)
    res.send(imports.bells.get(req.params.bell).Enabled)
  })

  router.post("/bells/toggle/:bell/:state", function(req, res, next) {
    if (imports.bells.get(req.params.bell).Locked == true) {
      imports.logger.log("API - Tried to toggle bell: " + req.params.bell + " to state: " + req.params.state + ", but was locked", 1)
      imports.eventbus.emit("bells_error_locked", imports.bells.get(req.params.bell))
      res.sendStatus(423)
      return
    }

    state = imports.validate.toBoolean(req.params.state)
    imports.logger.log("API - Bell: " + req.params.bell + " toggled. State is: " + state, 1)
    imports.bells.toggle(imports.bells.get(req.params.bell), state)
    res.send(imports.bells.get(req.params.bell).Enabled)
  })

  router.post("/bells/trigger/:bell", function(req, res, next) {
    imports.logger.log("API - Bell triggered: " + req.params.bell, 1)
    imports.eventbus.emit("trigger", imports.bells.get(req.params.bell))
  })

  router.delete("/bells/delete/:bell", function(req, res, next) {
    if (imports.bells.get(req.params.bell).Locked == true) {
      imports.logger.log("API - Tried to delete bell: " + req.params.bell + ", but was locked", 1)
      imports.eventbus.emit("bells_error_locked", imports.bells.get(req.params.bell))
      res.sendStatus(423)
      return
    }

    imports.logger.log("API - Bell deleted: " + req.params.bell, 1)
    res.send(imports.bells.delete(imports.bells.get(req.params.bell)))
  })

  router.put("/bells/update/:bell", function(req, res, next) {
    if (imports.bells.get(req.params.bell).Locked == true) {
      imports.logger.log("API - Tried to update bell: " + req.params.bell + " with: " + req.body + ", but was locked", 1)
      imports.eventbus.emit("bells_error_locked", imports.bells.get(req.params.bell))
      res.sendStatus(423)
      return
    }

    imports.logger.log("API - Bell updated: " + req.params.bell + " with: " + req.body, 1)
    imports.bells.set(req.body)
    res.send(imports.bells.get(req.params.bell))
  })

  router.post("/bells/create/", function(req, res, next) {
    // =========================================%%%%%%%%%===========================================================================================

    // YOU THERE! Don't forget: When you create a bell, you need to reschedule all the jobs, otherwise nothing will happen with the new bell until reboot!

    // I'm intentionally making this CoMmEnT ugly so              it'll gall you until you read it and UnDeRStAnD + fix it!!!!!!!!!??????????,,,,,,,,,,,,,,,,



    // ===================================================================================================================================================
    imports.logger.log("API - Bell created: " + req.body, 1)
    imports.bells.create(req.body)
  })

  // =====================================================================================================================
  // Schema related functions
  // =====================================================================================================================

  router.get("/schema", function(req, res, next) {
    imports.logger.log("API - Schema requested", 1)
    res.json(imports.schema.schema)
  })

  return router

}
