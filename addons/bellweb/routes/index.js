var express = require('express');
var router = express.Router();

// req: req,
// Date: {
//   "parsed": moment().format(bellboy.config.DateFormat),
//   "unix": moment().unix(),
//   "moment": moment
// },
// bellboy: bellboy,
// where: where,
// hostname: this.GetHostName(),
// cron: bellboy.modules["bellparser"],
// filename: BellWeb.Path + url.parse(req.url).pathname

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
