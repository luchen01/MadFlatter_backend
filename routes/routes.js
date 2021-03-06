var express = require('express');
var router = express.Router();
var models = require('../models');
var User = require('../models').User;
var Messages = require('../models').Messages;
var Questionnaire = models.Questionnaire;
var sequelize = require('../models').sequelize;
var apartmentsApi = require('./apartmentsApi');


//////////////////////////////// PUBLIC ROUTES ////////////////////////////////
// Users who are not logged in can see these routes

// router.get('/', function(req, res, next) {
//   res.render('home');
// });

router.get('/hello', (req, res) => {
  res.json({
    message: true
  })
})

///////////////////////////// END OF PUBLIC ROUTES /////////////////////////////

router.use(function(req, res, next){
  if (!req.user && req.method !== 'OPTIONS') {
    console.log('not req.userrrrrrrrrrrrrrrrr');
    res.status(404).json({success: false, message: 'req.user not found'})
  } else {
    console.log('returning next', req.user);
    return next();
  }
});

//////////////////////////////// PRIVATE ROUTES ////////////////////////////////
// Only logged in users can see these routes

router.post('/myprofile', function(req, res){
  console.log("inside my profile", req.body)
  User.findById(req.body.userid)
  .then(user=>{
    res.send({profileUser: user, currentUser: req.user});
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

router.post('/myMessages', (req, res)=>{
  console.log('inside my messages');
  var response;
  Messages.findAll({
    where: {
      user_id: req.body.userid
    },
    group: ["roomId"],
    attributes: ["roomId", [sequelize.fn('COUNT', 'id'), 'MsgCount'], [sequelize.fn('max', sequelize.col('createdAt')), 'LastMsg']],
  }, {order: sequelize.col('LastMsg')})
  .then( async (resp)=>{
    response = resp;
    let otherUser = [];
    var messengers = await Promise.all(resp.map((msg)=>{
      try{
      let userId = msg.roomId.split('_').filter((user)=>{return user !== req.body.userid})
      return User.findById(parseInt(userId))
      .then(user=>{
        console.log('user in find by id', msg.dataValues);
        msg.dataValues.otherUser = user.id;
        msg.dataValues.username = user.username;
        msg.dataValues.otherProfileUrl = user.profileUrl;
        otherUser.push(user);
      })
      .catch(err=>console.log(err))
    }
    catch(e) {
      console.log(e);
    }
  }))
    console.log('resp in my messages', otherUser);
    res.send({currenUser: req.user, messages: response});
  })
  .catch(err=>console.log(err))
})

router.post('/getMessage', function(req, res){
  console.log('get message');
  Messages.findAll({
    where: {
      roomId: req.body.roomId
    },
    include: [{
      model: User,
      as: 'user',
      attributes: ['username'],
        foreignKey: 'user_id'
    }]
  }, {order: sequelize.col('createdAt')})
  .then(resp=>{
    console.log('inside getMessages', resp);
    res.send(resp);
  })
  .catch(err=>console.log(err))
})

router.post('/newMessage', function(req, res){
  console.log("inside new Message", req.body);
  Messages.create({
    roomId: req.body.roomId,
    user: req.body.user,
    timeStamp: req.body.timeStamp,
    content: req.body.content,
    user_id: req.body.user_id
  })
  .then((message)=>{
    console.log("resp in message", message);
    res.send(message);
  })
  .catch(err=>console.log(err));
})

///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
