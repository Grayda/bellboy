var express = require('express');
var router = express.Router();

module.exports = function(passport, bellboy) {

  router.get('/', function(req, res) {
      // Display the Login page with any flash message, if any
      bellboy.modules["bellweb"].emit("pageloaded", req)
      res.render('help/index', { isAuthenticated: req.isAuthenticated() });
  });

  router.get('/:file', function(req, res) {
      // Display the Login page with any flash message, if any
      bellboy.modules["bellweb"].emit("pageloaded", req)
      res.render('help/' + req.params.file, { isAuthenticated: req.isAuthenticated() });
  });


  return router;
}
