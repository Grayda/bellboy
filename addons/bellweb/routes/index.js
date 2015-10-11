var express = require('express');
var router = express.Router();
var util = require("util")
var fs = require("fs")

var isAuthenticated = function(req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated()) {
    return next();
  } else {
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/login');
  }
}

module.exports = function(passport, bellboy) {

  /* GET login page. */
  router.get('/', function(req, res) {
    if(req.isAuthenticated()) {
      // Display the Login page with any flash message, if any
      bellboy.modules["bellweb"].emit("pageloaded", req)
      res.render('index', { isAuthenticated: req.isAuthenticated() });
    } else {
      res.redirect("/login")
    }
  });

  router.get('/includes/:file', function(req, res) {
      res.render(req.params.file, { isAuthenticated: req.isAuthenticated() });
      bellboy.modules["bellweb"].emit("pageloaded", req.params.file)
  });

  router.post("/schedule.ejs", function(req, res) {
    if(req.isAuthenticated()) {
      file = JSON.parse(fs.readFileSync(__dirname + "/../validators/schedule.json"))
      req.sanitize("file").escape()
      req.checkBody(file);

      var errors = req.validationErrors();
      if (errors) {
        res.render('error', {
          message: "Error switching schedules",
          error: { "stack": "Error returned was: " + errors[0].msg }
        });
        return;
      }
      bellboy.LoadBells("config/schedules/" + req.body.file)
      // Display the Login page with any flash message, if any
      bellboy.modules["bellweb"].emit("pageloaded", req)
      res.redirect("/")
    } else {
      res.redirect("/login")
    }
  })

  /* Handle Login POST */
  router.post('/login', passport.authenticate('login', {
    failureRedirect: '/login',
    successRedirect: '/',
    failureFlash: true
  }));

  /* Handle Logout */
  router.get('/logout', function(req, res) {
    bellboy.modules["bellweb"].emit("loggedout")
    req.logout();
    res.redirect('/');
  });

  router.get("/:file", function(req, res, next) {
    if(req.isAuthenticated() || bellboy.config.WebServer.NoAuth.indexOf(req.params.file) > -1) {
        bellboy.modules["bellweb"].emit("pageloaded", req)
        res.render(req.params.file, { isAuthenticated: req.isAuthenticated() });
    } else {
      res.redirect("/login")
    }

  })


  return router;
}
