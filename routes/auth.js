// Add Passport-related auth routes here.
var express = require('express');
var router = express.Router();
var User = require('../models').User;

module.exports = function(passport) {

  // GET registration page

  router.post('/signup', function(req, res) {
    // validation step
    console.log('req.body', req.body);
    User.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      birthday: req.body.birthday
    })
      .then(()=>res.send('Success!'))
      .catch(err=>console.log(err));
  });

  // GET Login page

  // POST Login page
  router.post('/login', passport.authenticate('local'),function(req, res){
    res.send(req.user);
  });

  router.get('/auth/facebook', passport.authenticate('facebook'));
  router.get('/auth/facebook/callback', passport.authenticate('facebook', {scope: ['email', 'public_profile']}), function(req, res){
    console.log("req.user inside facebook cb", req.user)
    res.redirect("http://localhost:3030/#/profile");
  })

  router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', "https://www.googleapis.com/auth/userinfo.email"] }));

  router.get('/auth/google/callback',
    passport.authenticate('google'),
    function(req, res) {
      console.log("req.user inside google cb", req.user)
      res.redirect("http://localhost:3030/#/profile");
    });


  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.send('logout successful!')
  });

  return router;
};
