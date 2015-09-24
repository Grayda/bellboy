var express = require('express');
var router = express.Router();
var url = require("url");


/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("AUthenticated!!")
    res.render('index');
    next();
  } else {
    console.log("NO AUTH> LOGING!!!")
    res.redirect('/login');
  }

});

// Loads
router.get("/:file", function(req, res, next) {
  if (req.params.file == "login") {
      console.log("NO AUTH> LOGING!!!")
    res.render(req.params.file)
  } else {
    if (req.isAuthenticated()) {
      res.render(req.params.file);
    } else {
      res.redirect('/login');
    }
  }
});
/* GET home page. */
router.get('/includes/:file', function(req, res, next) {
  res.render("includes/" + req.params.file);
});



module.exports = router;
