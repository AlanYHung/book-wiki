'use strict';

const express = require ('express');
const superagent = require('superagent');
const cors = require('cors');

const app = express();

require ('dotenv').config();

const PORT = process.env.PORT || 9999;
app.use(cors());

app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');



app.get('/', getHomepage);
app.get('/searches/new', getSearches);

function getSearches(req, res){
  res.render('pages/searches/new.ejs');
}

function getHomepage(req, res){
  res.render('pages/index.ejs');
}





app.listen(PORT, () => console.log(`Server is listening to ${PORT}`));
