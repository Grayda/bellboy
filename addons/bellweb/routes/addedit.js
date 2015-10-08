var express = require('express');
var router = express.Router();

module.exports = function(passport, bellboy) {

  /* GET login page. */
  router.get('/', function(req, res) {
    if(req.isAuthenticated()) {
      // Display the Login page with any flash message, if any
      bellboy.modules["bellweb"].emit("pageloaded", req)
      res.render('add/index', { isAuthenticated: req.isAuthenticated(), req: req });
    } else {
      res.redirect("/login")
    }
  });

  router.get('/:file', function(req, res) {
    if(req.isAuthenticated()) {
      // Display the Login page with any flash message, if any
      bellboy.modules["bellweb"].emit("pageloaded", req)
      res.render('add/' + req.params.file, { isAuthenticated: req.isAuthenticated(), req: req });
    } else {
      res.redirect("/login")
    }
  });


  return router;
}
