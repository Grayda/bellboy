var express = require('express');
var router = express.Router();

module.exports = function(passport, bellboy) {

  router.get('/', function(req, res) {
      // Display the Login page with any flash message, if any
      bellboy.modules["bellweb"].emit("pageloaded", req)
      res.render('add/index.ejs', { isAuthenticated: req.isAuthenticated(), req: req });
  });

  router.get('/:file', function(req, res) {
      // Display the Login page with any flash message, if any
      bellboy.modules["bellweb"].emit("pageloaded", req)
      res.render('add/' + req.params.file, { isAuthenticated: req.isAuthenticated(), req: req });
  });


  return router;
}
