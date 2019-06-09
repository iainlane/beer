var path = require('path');
var config = require(path.join(global.__basedir, 'config.json'));
var express = require('express');
var router = express.Router();
var passport = require('passport');

router.use(passport.initialize());
router.use(passport.session());

function addTemplateVariables (req, res, next) {
  if (req.session.passport) {
    res.locals.profile = req.session.passport.user;
  }
  next();
}

function checkID (req, res, next) {
    if (req.user)
        res.locals.can_upload = config.allowed_ids.includes(req.user.id);
    next();
}

router.use(addTemplateVariables);
router.use(checkID);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '&#x1F37A;' });
});

module.exports = router;
