const express = require('express')
const router = express.Router()
const axios = require('axios')
const cheerio = require('cheerio')
const db = require('../models')

router.get('/', (req, res) => {
  // hit the database to pull scraped articles
  // if yes, pass data to hbs render to be displayed. 
  // if no, set data to default object for no article display
  db.Article.find({saved: false})
    .then(function(articles) {
      console.log(articles)
      console.log(`inside / route find`)
      if (articles.length > 0) {
        console.log(`articles > 0`)
        let articleObj = {
          articles: articles
        }
        res.render('index', articleObj)
      } else {
        console.log(`no articles`)
        let noArticleObj = {
          articles: [
            {
              title: 'Sorry, Looks like there are no articles here!',
              link: '',
              summary: 'Perhaps these options would appeal to you?',
              image: '',
              saved: false,
              noArticle: true
              
            }
          ]
        }
        res.render('index', noArticleObj)

      }
    })

})

router.get('/saved', (req, res) => {
  // hit database to pull saved articles
  // if yes, pass data to hbs
  // if no set data to default obj and send to hbs
  db.Article.find({saved: true})
    .then(function(articles) {
      console.log(articles)
      console.log(`inside /saved route`)
      if (articles.length > 0) {
        let articleObj = {
          articles: articles
        }
        res.render('saved', articleObj)
      } else {
        // render default mesage here
        res.render('saved')
      }
    })
})

router.get('/scrape', (req, res) => {
  axios.get('https://www.pinkbike.com')
    .then(function(data) {
      // **************************************
      // finish out scrape function and save to db


      const $ = cheerio.load(data.data)
      const resultsArray = []
      $("div.news-box2").each(function(i, element) {

        let title = $(element).find('a').find('img').attr('alt');
        let link = $(element).find("a.f22").attr("href");
        let summary = $(element).find("div.news-mt3").text().trim()
        let image = $(element).find("a").find("img").attr('src')
    
        // Save these results in an object that we'll push into the results array we defined earlier
        resultsArray.push({
          title: title,
          link: link,
          summary: summary,
          image: image,
          note: [],
          saved: false
        });
       
      }); 
      db.Article.insertMany(resultsArray, function(err, data) {
        if (err) throw err
        res.json(data)
      })
    })

})

router.get('/clear', (req, res) =>{
  db.Article.remove({saved: false}, function(err, data) {
    if (err) throw err
    res.json(data) 

  })
})

router.put('/save', (req, res) => {
  console.log(req.body.id)
  db.Article.update({_id: req.body.id}, {$set: {saved: true}}, function(err, data) {
    if (err) throw err
    res.json(data)
  })
})

router.put('/delete', (req, res) => {
  console.log(req.body.id)
  db.Article.remove({_id: req.body.id}, function(err, data) {
    if (err) throw err
    res.json(data)
  })
})

module.exports = router