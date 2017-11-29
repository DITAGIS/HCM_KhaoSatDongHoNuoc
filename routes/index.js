var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.isAuthenticated())
    res.render('map', {
      title: ''
    });
  else
    res.redirect('/login');
});

module.exports = router;