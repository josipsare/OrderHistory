var express = require('express');
var router = express.Router();
const products = require('../data/index')

router.get('/', function (req, res, next) {
   res.redirect('/home');
})

router.get('/home', async function (req, res, next) {
   const mail_list = await products()
   res.render('home', {
      mail_list: mail_list
   })
})

module.exports = router;