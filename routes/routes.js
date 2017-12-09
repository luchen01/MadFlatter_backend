var express = require('express');
var router = express.Router();
var models = require('../models');
var User = models.User;

//////////////////////////////// PUBLIC ROUTES ////////////////////////////////
// Users who are not logged in can see these routes

router.get('/', function(req, res, next) {
  res.render('home');
});

router.post('/myprofile', function(req, res){
  console.log('insidemyprofile');
  User.findById(req.body.userid)
  .then(user=>{
    console.log('user', user);
    res.send(user)
  })
  .catch(err=>console.log(err))
})
///////////////////////////// END OF PUBLIC ROUTES /////////////////////////////

// router.use(function(req, res, next){
//   if (!req.user) {
//     res.redirect('/login');
//   } else {
//     return next();
//   }
// });

//////////////////////////////// PRIVATE ROUTES ////////////////////////////////
// Only logged in users can see these routes

router.get('/protected', function(req, res, next) {
  res.render('protectedRoute', {
    username: req.user.username,
  });
});

///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
