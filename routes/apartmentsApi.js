var express = require('express');
var router = express.Router();
var models = require('../models');
var { User, Apartment, AptPicture } = models;
const Op = models.sequelize.Op;
console.log('in apartmentsAPI');
router.post('/apartmentsByLocation', (req, res) => {
  console.log('in apartmentsByLocation');
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
  let searchFilters = Object.assign({}, req.body.searchFilters);
  console.log(searchFilters);
  Object.keys(defaultFilters).map((filter) => {
    console.log(filter);
    searchFilters[filter] = (!req.body.searchFilters[filter] || isNaN(req.body.searchFilters[filter]))
     ? defaultFilters[filter]
     : parseInt(searchFilters[filter]);
  })
  console.log(searchFilters);
  var regions = req.body.regions.map((rect) => {
    return {
      lat: {
        [Op.gte]: rect.south,
        [Op.lte]: rect.north,
      },
      lng: {
        [Op.gte]: rect.west,
        [Op.lte]: rect.east
      }
    }
  });
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
    // console.log(searchFilters.dateAvailableStart, searchFilters.dateAvailableEnd, apartments);
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
  .catch((err) => {
    console.log(err);
  })
})

router.get('/apartment/:id', async (req, res) => {
  var apt = await Apartment.find({
    where: {
      id: req.params.id
    }
  });
  console.log(apt.dataValues);
  var pictures = await AptPicture.findAll({
    where: {
      apartment_id: req.params.id
    }
  }).map((pic) => {
    return pic.url
  });
  console.log(apt);
  res.json({
    apartment: Object.assign({}, apt.dataValues, {pictures: pictures})
  })
})

// router.get('/allapartment', async (req, res)=>{
//     var aptAll = await Apartment.findAll({limit: 10})
//     .map(apt=>{
//       return AptPicture.findOne({
//         where: {
//           apartment_id: apt.id
//         }
//       })
//       .then((photo)=>{
//         console.log('all apartment picture', photo);
//         return Object.assign({}, apt, {pictures: photo})
//       })
//
//     })
//     console.log(aptAll);
//     res.send(aptAll);
//
// })

// router.post('/apartmentprofile', function(req, res){
//   console.log('inside find apartment profile req.body', req.body);
//   Apartment.findById(req.body.aptid)
//   .then(apt=>{
//     res.send(apt)
//   })
//   .catch(err=>console.log(err))
// })

module.exports = router;
