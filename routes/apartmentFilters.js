var express = require('express');
var router = express.Router();
var models = require('../models');
var User = require('../models').User;
var Questionnaire = models.Questionnaire;
var Filter = models.AptFilter;
var apartmentsApi = require('./apartmentsApi');
var Region = models.Region;
var Apartment = models.Apartment;
var AptPicture = models.AptPicture;
const Op = models.sequelize.Op;

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

router.get('/filters/:userid', (req, res) => {
  Filter.findOne({
    attributes: ['maxBed', 'minBed', 'maxBath', 'minBath', 'maxDate', 'minDate', 'maxPrice', 'minPrice'],
    where: {user_id: req.params.userid}
  })
  .then((response) => {
    res.send({
      success: 'true',
      filters: response.davaValues
    })
  })
})

router.get('/apartmentMatches/:userid', async (req, res) => {
  console.log('in apartment matches');
  const defaultFilters = {
    priceMin: 0,
    priceMax: 999999,
    areaMin: 0,
    areaMax: 999999,
    bedsMin: 0,
    bedsMax: 999999,
    bathsMin: 0,
    bathsMax: 999999,
    dateAvailableStart: new Date(0),
    dateAvailableEnd: new Date(1613225248000),
  }
  var savedFilters = await Filter.findOne({
      attributes: ['bedsMax', 'bedsMin', 'bathsMax', 'bathsMin', 'dateAvailableEnd', 'dateAvailableStart', 'priceMax', 'priceMin'],
      where: {user_id: req.params.userid}
    })
    .then(filters => {
      return filters ? filters.dataValues : {};
    });

    let searchFilters = Object.assign({}, savedFilters);
    Object.keys(defaultFilters).map((filter) => {
      searchFilters[filter] = (!savedFilters[filter] || isNaN(savedFilters[filter]))
       ? defaultFilters[filter]
       : savedFilters[filter];
    })
  Region.findAll({
    where: {user_id: req.params.userid}
    })
    .then((response) => {
      // console.log('in regions response:', response);
      var regions = response.map(region =>{
        return {
          lat: {
            [Op.gte]: region.dataValues.south,
            [Op.lte]: region.dataValues.north,
          },
          lng: {
            [Op.gte]: region.dataValues.west,
            [Op.lte]: region.dataValues.east
          }
        }
      })
      // console.log('Regions:', regions);
      Apartment.findAll({
        where: {
          [Op.or]: regions,
          beds: {
            [Op.between]: [searchFilters.bedsMin, searchFilters.bedsMax]
          },
          baths: {
            [Op.between]: [searchFilters.bathsMin, searchFilters.bathsMax]
          },
          area: {
            [Op.between]: [searchFilters.areaMin, searchFilters.areaMax]
          },
          price: {
            [Op.between]: [searchFilters.priceMin, searchFilters.priceMax]
          },
          dateAvailable: {
            [Op.between]: [searchFilters.dateAvailableStart, searchFilters.dateAvailableEnd]
          }
        }
      })
      .then(async (apartments) => {
        console.log(searchFilters.dateAvailableStart, searchFilters.dateAvailableEnd, apartments);
        var apts = await Promise.all(apartments.map((apt) => {
          try{
            return AptPicture.findAll({
              where: {
                apartment_id: apt.id
              },
              limit: 1
            }).then((pics) => {
              return Object.assign({}, apt.dataValues, {picture: pics[0] ?
                  pics[0].dataValues.url :
                 'https://ssl.cdn-redfin.com/v186.4.0/images/no_photo_available_large.png'})
            })
          }
          catch (e) {
            console.log(e);
          }
        }))
        res.json({
          apartments: apts
        })
      })
    })
  console.log(searchFilters, regions);
})

module.exports = router;
