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
  router.get('/auth/facebook/callback', passport.authenticate('facebook'), function(req, res){
    res.send(req.user);
  })

  router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

  router.get('/auth/google/callback',
    passport.authenticate('google'),
    function(req, res) {
      // Successful authentication, redirect home.
      res.send(req.user);
    });


  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.send('logout successful!')
  });

  return router;
};
