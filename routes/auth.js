// Add Passport-related auth routes here.
var express = require('express');
var router = express.Router();
var User = require('../models').User;

module.exports = function(passport) {

  // GET registration page

  router.post('/signup', function(req, res) {
    // validation step
    if (req.body.password!==req.body.passwordRepeat) {
      return res.render('signup', {
        error: "Passwords don't match."
      });
    }
    User.create({username: req.body.username, password: req.body.password})
      .then((user)=>res.send(user))
      .catch(err=>console.log(err));
  });

  // GET Login page

  // POST Login page
  router.post('/login', passport.authenticate('local'),function(req, res){
    res.send(req.user);
  }));

  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.send('logout successful!')
  });

  return router;
};
