var express = require('express');
var router = express.Router();
var models = require('../models');
var User = require('../models').User;
var Questionnaire = models.Questionnaire;
var apartmentsApi = require('./apartmentsApi');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;

router.post('/questionnaire', (req, res) => {
  var questionnaire = {};
  Object.keys(req.body.answers).map((key) => {
    questionnaire[`${key}_personal`] = req.body.answers[key].personal;
    questionnaire[`${key}_others`] = req.body.answers[key].others;
  })
  Questionnaire.findOne({where: {user_id: req.user.id}})
  .then((obj) => {
    if(!obj){
      Questionnaire.create(Object.assign({}, questionnaire, {user_id: req.user.id}))
      .then(()=>{
        res.json({
          success: true,
          message: 'successfully saved questionnaire responses'
        })
      })
    } else {
      if(!req.body.retrieve) {
        console.log('updating with questionnaire...', questionnaire);
        obj.update(questionnaire)
        .then((response)=> {
          res.json({
            success: true,
            message: 'successfully saved questionnaire responses'
          })
        })
      } else {
        res.json({
          success: true,
          message: 'found questionnaire responses',
          answers: decodeQuestionnaire(obj.dataValues)
        })
      }
    }
  })
})

const decodeQuestionnaire = dbObj => {
    var obj = {};
    Object.keys(dbObj).map((key) => {
        var questionType = key.split('_');
        if(questionType.length === 2 && questionType[0] !== 'user'){
          if(!obj[questionType[0]]) obj[questionType[0]] = {};
          console.log(key, dbObj[key]);
          obj[questionType[0]][questionType[1]] = dbObj[key];
        }
    })
    return obj;
}

const matchingAlgorithm = (user1Resps, user2Resps) => {
  let p1Total = 0;
  let p2Sig = 0;
  for (var i = 0; i < user1Resps; i++) {
    p2Sig += user2Resps[i].others;
    p1Total += user2Resps[i].others * Math.abs(user1Resps[i].personal - user2Resps[i].personal);
  }
  let p1Score = p1Total / p2Sig;

  let p2Total = 0;
  let p1Sig = 0;
  for (var j = 0; j < user2Resps; j++) {
    p1Sig += user1Resps[j].others;
    p2Total += user1Resps[j].others * Math.abs(user2Resps[j].personal - user1Resps[j].personal);
  }
  let p2Score = p2Total / p1Sig;

  return (5 - ((p1Score + p2Score)/2)) / 5;
}

router.get('/matches/:userid', async (req, res) => {
    var resp = await Questionnaire.findOne({where: {user_id: req.params.userid}});
    let userResps = decodeQuestionnaire(resp.dataValues);

    User.findAll({where: {user_id: {[Op.ne]: req.params.userid}}})
    .then(respo => {
      Promise.all(
        respo.map(user => {
          return Questionnaire.findOne({where: {user_id: user.dataValues.id}})
          .then(response => {
            let otherUserResps = decodeQuestionnaire(response.dataValues);
            return {user: user.dataValues, score: matchingAlgorithm(userResps, otherUserResps)};
          })
        })
      )
    })
    .then(aResp => {
      res.json({matches: aResp.sort((a,b) => a.score - b.score).slice(0,10)});
    })
    .catch(error => res.json({error: error}))
})


///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
