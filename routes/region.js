var express = require('express');
var router = express.Router();
var models = require('../models');
var User = require('../models').User;
var Questionnaire = models.Questionnaire;
var Region = models.Region;
var apartmentsApi = require('./apartmentsApi');

router.post('/regions', async (req, res) => {
  console.log('in post regions');
  console.log(req.body.regions);
  await Region.destroy({where: {user_id: req.user.id}});
  Promise.all(req.body.regions.map( async (region) => {
    console.log('in mapping');
    var newRegion = await Region.create(Object.assign({}, region, {user_id: req.user.id}));
    console.log('Created region:', newRegion);
    return newRegion.dataValues
  }))
  .then((regions) => {
    console.log('returning', regions);
    res.json({
      success: true,
      message: 'Successfully saved regions',
      regions: regions
    })
  })
  .catch((e) => {
    console.log(e);
  })
})

router.get('/regions', (req, res) => {
  Region.findAll({where: {user_id: req.query.userid ? req.query.userid : req.user.id}})
  .then((regions) => {
    res.json({
      regions: regions.map((region) => (region.dataValues))
    })
  })
})

module.exports = router;
