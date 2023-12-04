const express = require('express')
const app = express()
var path = require('path')


app.use(express.static(path.join(__dirname, 'public')));

const homeRouter = require('./routes/home.routes');


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

app.use('/', homeRouter);

app.listen(3000)