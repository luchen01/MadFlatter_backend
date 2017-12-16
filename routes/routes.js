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
    console.log('not req.user');
    // res.redirect("http://localhost:3030/#/");
    res.json({success: false, message: 'req.user not found'})
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

router.post('/myprofile', function(req, res){
  console.log("inside my profile", req.body)
  User.findById(req.body.userid)
  .then(user=>{
    res.send(user)
  })
  .catch(err=>console.log(err))
})

router.post('/saveedit', function(req, res){
  console.log('inside save edit', req.body);
  User.update({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    email: req.body.email,
    birthday: req.body.birthday,
  }, {where: {id: req.body.userid}})
  .then(resp=>{
    console.log("resp in saved", resp);
    res.send(resp);
  })
  .catch(err=>console.log(err))
})

router.post('/leavegroup', function(req, res){
  console.log("inside leave group", req.body, req.user);
  User.update({
    groupId: null
  }, {where: {id: req.user.id}})
  .then(resp=>{
    console.log("resp in saved", resp);
  })
  .catch(err=>console.log(err))
})


///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
