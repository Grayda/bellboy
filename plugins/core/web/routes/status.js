var express = require('express');
var router = express.Router();

module.exports = function(imports) {
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('status');
});

return router

}
