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
    res.redirect("http://localhost:3030/#/profile/" + req.user.dataValues.id);
  })

  router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', "https://www.googleapis.com/auth/userinfo.email"] }));

  router.get('/auth/google/callback',
    passport.authenticate('google'),
    function(req, res) {
      res.redirect("http://localhost:3030/#/profile/" + req.user.dataValues.id);
    });


    router.get('/loggedin', function(req, res, next){
      console.log('inside get logged in', req.user);
      if(req.user){
        res.send('true')
      }else{
        res.send('false')
      }
    })

    router.post('/myprofile', function(req, res){
      User.findById(req.body.userid)
      .then(user=>{
        res.send(user)
      })
      .catch(err=>console.log(err))
    })

    router.post('/saveedit', function(req, res){
      console.log('inside save edit', req.body);
      User.findById(req.body.userid)
      .then(user=>{
        console.log(user);
        return user.save({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          usernae: req.body.username,
          email: req.body.email
        })
      })
      .then(user=>res.send(user))
      .catch(err=>console.log(err))
    })


  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.send('logout successful!')
  });

  return router;
};
