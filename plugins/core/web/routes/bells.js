var express = require('express');
var router = express.Router();

module.exports = function(imports) {

  /* GET home page. */
  router.get('/bells', function(req, res, next) {
    var data = []
    Object.keys(imports.bells.bells).forEach(function(item) {
      if(item.indexOf("_") == 0) { return }
      name = item
      item = imports.bells.bells[item]
      time = imports.scheduler.next(name)
      item.CalculatedTime = imports.scheduler.toString(name)
      item.HumanReadableTime = imports.scheduler.toNow(name)
      item.TimeDifference = imports.scheduler.toInt(name)
      item.ID = name
      data.push(item)
    }.bind(this))
    res.json(data)
  });

  router.get("/bells/:bell", function(req, res, next) {
    var data = imports.bells.bells[req.params.bell]
    data.ID = req.params.bell
    data.CalculatedTime = imports.scheduler.toString(req.params.bell)
    data.HumanReadableTime = imports.scheduler.toNow(req.params.bell)
    res.json(data)
  })
  return router

}
