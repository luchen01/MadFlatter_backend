var express = require('express');
var router = express.Router();
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const axios = require("axios");
var models = require('../models');
var { User, Apartment, AptPicture } = models;


const scraper = async () => {
  await AptPicture.destroy({
    where:{},
    truncate: true
  });
  console.log('AptPicture table destroyed');
  Apartment.destroy({
    where: { },
    // truncate: true
  }).then( async ()=>{
    console.log('Apartment table destroyed');
    var offset = 0;
    var apartments = [];

    const uploadData = async (listing) => {
      var { window } = (new JSDOM(`${listing.data}`));
      let $ = require("jquery")(window);
      let bedsAndBath = $('.attrgroup').children('.shared-line-bubble').first().text().split(' / ');
      let beds = bedsAndBath[0][0] ? parseInt(bedsAndBath[0][0]) : null;
      let baths = bedsAndBath[1] ? parseInt(bedsAndBath[1][0]) : null;
      let second = $('.attrgroup').children('.shared-line-bubble').first().next().text();
      let third = $('.attrgroup').children('.shared-line-bubble').first().next().next().text()
      var area = !isNaN(second[0]) ? second.split('ft')[0] : null;
      var dateAvailable = (third ?
        $('.attrgroup').children('.shared-line-bubble').first().next().next().attr('data-date') :
        $('.attrgroup').children('.shared-line-bubble').first().next().attr('data-date'));
      dateAvailable = dateAvailable ? (new Date(dateAvailable)).getTime() : null;
      var address = $('.mapaddress').toArray().length < 2 ? null : $('.mapaddress').first().text();
      let latitude = parseFloat($('#map').attr('data-latitude'));
      let longitude = parseFloat($('#map').attr('data-longitude'));
      let price = parseFloat($('.price').text().slice(1));
      let title = $('.postingtitle').children('.postingtitletext').find('#titletextonly').text();
      let timePosted = $('.date.timeago').attr('datetime');
      let idPost = $('.postinginfos').children('p.postinginfo').first().text();
      let id = parseInt(idPost.slice(idPost.length - 10, idPost.length));
      return await Apartment.create(
        {
            id: id,
            title: title ? title : null,
            lat: !isNaN(latitude) ? latitude : null,
            lng: !isNaN(longitude) ? longitude : null,
            postBody: $('#postingbody').text(),
            address: address ? address : null,
            timePosted: timePosted ? timePosted : null,
            beds: !isNaN(beds) ? beds : null,
            baths: !isNaN(baths) ? baths : null,
            area: (!isNaN(area) && area )? parseInt(area) : null,
            dateAvailable: dateAvailable,
            price: !isNaN(price) ? price : null
        })
      .then(async (apartment) => {
        // console.log('here', apartment);
        var pics = $('.iw.multiimage').children('#thumbs').children('a').toArray();
        if(pics.length > 0) {
          pics = pics.map((picture) => {
            return ({
              url: picture.getAttribute('href'),
              apartment_id: apartment.id
            })
          })
          try {
            await AptPicture.bulkCreate(pics);
          }
          catch (e) {
            console.log('Error bulk creating', e);
          }
        }
        return apartment;
      })
      .catch((err) => {
        console.log(id, title);
        return 'error';
      })
    }

    const getPage = async (offset) => {
      var endpoint = `https://sfbay.craigslist.org/search/sfc/apa?query=apartment%20in%20san%20francisco&s=${offset}`
      try{
        return await axios(endpoint)
        .then((response)=>{
          const { window } = (new JSDOM(`${response.data}`));
          let $ = require("jquery")(window);
          var rowRefs = $('.rows').find('.result-row').find('.result-title').toArray();
          return Promise.all(rowRefs.map((row) => {
            try{
              return axios(row.getAttribute('href'))
              .then( async (listing)=> (await uploadData(listing)));
            } catch (e) {
              console.log('failed call', e);
              return e;
            }
          }))
          .then((apartments) => {
            offset = apartments.length < 120 ? 'finished' : offset + 120;
            return offset;
          })
        })
      } catch (e) {
        console.log('failed call', e);
        return e;
      }
    }

    const awaitPage = async (fn, offset) => {
      while(!isNaN(offset) && offset < 500){
        offset = await fn(offset);
        console.log(offset);
      }
    }
    try{
      await awaitPage(getPage, offset);
    } catch (e) {
      console.log('problem:', e);
      scraper();
    }
  })
}

scraper();
setInterval(scraper, 86400000);

router.get('/craigslist', async (req, res) => {
    await scraper();
    res.json({success: true, message: 'successfully uploaded to postgres'});
})

module.exports = router;
