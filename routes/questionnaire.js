var express = require('express');
var router = express.Router();
var models = require('../models');
var User = require('../models').User;
var Questionnaire = models.Questionnaire;
var apartmentsApi = require('./apartmentsApi');

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
      if(!req.body.retrieve){
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

router.get('/questionnaire/:userid', (req, res) => {
    Questionnaire.findOne({where: {user_id: req.params.userid}})
    .then((response) => {
      res.json({
        questionnaire: decodeQuestionnaire(response.dataValues)
      })
    })
})

const decodeQuestionnaire = (dbObj) => {
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



///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
