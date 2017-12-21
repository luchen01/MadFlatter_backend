var express = require('express');
var router = express.Router();
var models = require('../models');
var User = require('../models').User;
var Questionnaire = models.Questionnaire;
var Filter = models.AptFilter;
var apartmentsApi = require('./apartmentsApi');

router.post('/filters', (req, res) => {
  console.log(req.body.filters);
    Filter.findOne({where: {user_id: req.user.id}})
    .then(async (filter) => {
      filter ? await filter.update(req.body.filters) : await Filter.create(Object.assign({}, req.body.filters, {user_id: req.user.id}))
      res.send({
        success: 'true',
        message: 'Successfully loaded apartment filters'
      })
    })
})

module.exports = router;
