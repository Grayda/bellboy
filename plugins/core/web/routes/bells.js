var express = require('express');
var router = express.Router();

module.exports = function(imports) {

  /* GET home page. */
  router.get('/api/bells', function(req, res, next) {
    res.json(imports.bells.bells)
  }.bind(this));

  return router

}
