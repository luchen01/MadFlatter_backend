var express = require('express');
var router = express.Router();
var models = require('../models');
var apartmentsApi = require('./apartmentsApi');


//////////////////////////////// PUBLIC ROUTES ////////////////////////////////
// Users who are not logged in can see these routes

// router.get('/', function(req, res, next) {
//   res.render('home');
// });



///////////////////////////// END OF PUBLIC ROUTES /////////////////////////////

router.use(function(req, res, next){
  if (!req.user) {
    res.redirect("http://localhost:3030/#/login/");
  } else {
    return next();
  }
});


//////////////////////////////// PRIVATE ROUTES ////////////////////////////////
// Only logged in users can see these routes

router.get('/protected', function(req, res, next) {
  res.render('protectedRoute', {
    username: req.user.username,
  });
});

router.use('/', apartmentsApi);


///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
