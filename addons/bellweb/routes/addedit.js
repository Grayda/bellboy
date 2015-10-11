var express = require('express');
var router = express.Router();
var fs = require("fs")

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

  router.get('index', function(req, res) {
    if(req.isAuthenticated()) {
      // Display the Login page with any flash message, if any
      bellboy.modules["bellweb"].emit("pageloaded", req)
      res.render('add/index', { isAuthenticated: req.isAuthenticated(), req: req });
    } else {
      res.redirect("/login")
    }
  });

  router.post('/', function(req, res) {
    if(req.isAuthenticated()) {
      file = JSON.parse(fs.readFileSync(__dirname + "/../validators/addedit.json"))
      req.checkBody(file);

      var errors = req.validationErrors();
      if (errors) {
        var err
        errors.forEach(function(index) {
          err += index.msg + "\r\n"
        })
        res.render('error', {
          message: "Error adding bell",
          error: { "stack": "Errors returned were: " + err }
        });
        return;
      }
    } else {
      res.redirect("/login")
    }
  })


  return router;
}
