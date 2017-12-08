var express = require('express');
var router = express.Router();
var models = require('../models');
var { User, Apartment, AptPicture } = models;
const Op = models.sequelize.Op;

//////////////////////////////// PUBLIC ROUTES ////////////////////////////////
// Users who are not logged in can see these routes

router.get('/', function(req, res, next) {
  res.render('home');
});

///////////////////////////// END OF PUBLIC ROUTES /////////////////////////////

// router.use(function(req, res, next){
//   if (!req.user) {
//     res.redirect('/login');
//   } else {
//     return next();
//   }
// });

//////////////////////////////// PRIVATE ROUTES ////////////////////////////////
// Only logged in users can see these routes

router.get('/protected', function(req, res, next) {
  res.render('protectedRoute', {
    username: req.user.username,
  });
});

router.post('/apartmentsByLocation', (req, res) => {
  console.log('in apartmentsByLocation', req.body.maxLat, req.body.minLat, req.body.maxLng, req.body.minLng);
  Apartment.findAll(
    {where: {
      [Op.and]:{
        lat: {
            [Op.lte]: req.body.maxLat,
            [Op.gte]: req.body.minLat
        },
        lng: {
            [Op.lte]: req.body.maxLng,
            [Op.gte]: req.body.minLng
        }
      }
    }}
  )
  .then((apartments) => {
    res.json({
      apartments
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


///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
