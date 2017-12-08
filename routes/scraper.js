var express = require('express');
var router = express.Router();
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const axios = require("axios");
var models = require('../models');
var { User, Apartment, AptPicture } = models;


router.get('/craigslist', async (req, res) => {

    var offset = 0;
    var apartments = [];

    const uploadData = async (listing) => {
      var { window } = (new JSDOM(`${listing.data}`));
      let $ = require("jquery")(window);
      let bedsAndBath = $('.attrgroup').children('.shared-line-bubble').first().text().split(' / ');
      let beds = bedsAndBath[0][0];
      let baths = bedsAndBath[1] ? bedsAndBath[1][0] : null;
      let second = $('.attrgroup').children('.shared-line-bubble').first().next().text();
      let third = $('.attrgroup').children('.shared-line-bubble').first().next().next().text()
      var area = !isNaN(second[0]) ? second.split('ft')[0] : null;
      var dateAvailable = (third ?
        $('.attrgroup').children('.shared-line-bubble').first().next().next().attr('data-date') :
        $('.attrgroup').children('.shared-line-bubble').first().next().attr('data-date'));
      var address = $('.mapaddress').toArray().length < 2 ? null : $('.mapaddress').first().text();
      // $('.attrgroup').children('.shared-line-bubble').first().next().text();
      // console.log(beds, baths, area, dateAvailable);
      Apartment.create({
        title: $('.postingtitle').children('.postingtitletext').find('#titletextonly').text(),
        // pictures: $('.iw.multiimage').children('#thumbs').children('a').toArray().map((picture)=>{
        //   return picture.getAttribute('href')
        // }),
        lat: parseFloat($('#map').attr('data-latitude')),
        lng: parseFloat($('#map').attr('data-longitude')),
        //POSTBODY RESULTS IN TIMEOUT
        // postBody: $('#postingbody').text(),
        address: address ? address : null,
        timePosted: $('.date.timeago').attr('datetime'),
        beds: beds ? parseInt(beds) : 0,
        baths: baths ? parseInt(baths) : 0,
        area: area ? parseInt(area) : 0,
        dateAvailable: dateAvailable ? dateAvailable : '',
        price: parseInt($('.price').text().slice(1))
      })
      .then((apartment) => {
        var pics = $('.iw.multiimage').children('#thumbs').children('a').toArray();
        if(pics.length > 0) {
          pics.map(async (picture) => {
            await AptPicture.create({
              url: picture.getAttribute('href'),
              apartment_id: apartment.id
            })
          })
          console.log('successfully saved pictures');
        }
      })
    }

    const getPage = async (offset) => {
      var endpoint = `https://sfbay.craigslist.org/search/sfc/apa?query=apartment%20in%20san%20francisco&s=${offset}`
      return await axios(endpoint)
      .then((response)=>{
        const { window } = (new JSDOM(`${response.data}`));
        let $ = require("jquery")(window);
        var rowRefs = $('.rows').find('.result-row').find('.result-title').toArray();
        rowRefs.map((row) => {
          axios(row.getAttribute('href'))
          .then(async (listing)=>{
            await uploadData(listing);
          })
        })
      })
      .then(() => {
        offset += 120;
        return offset;
      })
    }



    const awaitPage = async (fn, offset) => {
      while(offset < 500){
        offset = await fn(offset);
        console.log(offset);
      }
    }

    await awaitPage(getPage, offset);

    //******************************************************************************************
    //      TEST CODE!!! READS ONE CRAIGSLIST LISTING
    //
    // var endpoint = `https://sfbay.craigslist.org/sfc/apa/d/where-luxury-city-living/6407011177.html`;
    // await axios(endpoint)
    // .then((response) => {
    //   const { window } = (new JSDOM(`${response.data}`));
    //   var $ = require("jquery")(window);
    //
    //   let bedsAndBath = $('.attrgroup').children('.shared-line-bubble').first().text().split(' / ');
    //   let beds = bedsAndBath[0][0];
    //   let baths = bedsAndBath[1][0];
    //   let second = $('.attrgroup').children('.shared-line-bubble').first().next().text();
    //   console.log(second);
    //   let third = $('.attrgroup').children('.shared-line-bubble').first().next().next().text()
    //   var area = !isNaN(second[0]) ? second.split('ft')[0] : 'unavailable';
    //   var dateAvailable = (third ?
    //     $('.attrgroup').children('.shared-line-bubble').first().next().next().attr('data-date') :
    //     $('.attrgroup').children('.shared-line-bubble').first().next().attr('data-date'));
    //   $('.attrgroup').children('.shared-line-bubble').first().next().text();
    //   console.log(beds, baths, area, dateAvailable);
    //   apartments.push({
    //     title: $('.postingtitle').children('.postingtitletext').find('#titletextonly').text(),
    //     pictures: $('.iw.multiimage').children('#thumbs').children('a').toArray().map((picture)=>{
    //       return picture.getAttribute('href')
    //     }),
    //     lat: $('#map').attr('data-latitude'),
    //     lng: $('#map').attr('data-longitude'),
    //     postBody: $('#postingbody').text(),
    //     address: $('.mapaddress').first().text(),
    //     timePosted: $('.date.timeago').attr('datetime'),
    //     beds: beds ? beds : 'unavailable',
    //     baths: baths ? baths : 'unavailable',
    //     area: area ? area : 'unavailable',
    //     dateAvailable: dateAvailable ? dateAvailable : 'unavailable',
    //     price: parseInt($('.price').text().slice(1))
    //   })
    // })

    res.json({success: true, message: 'successfully uploaded to postgres'});
})

module.exports = router;
