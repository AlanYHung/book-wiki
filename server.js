'use strict';

const express = require ('express');
const superagent = require('superagent');
const cors = require('cors');
const BOOK_API = process.env.BOOK_API;

const app = express();

require ('dotenv').config();

const PORT = process.env.PORT || 9999;
app.use(cors());

app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');



app.get('/', getHomepage);
app.get('/searches/new', getSearches);
app.post('/searches', callBookApi);

function getSearches(req, res){
  res.render('pages/searches/new.ejs');
}

function getHomepage(req, res){
  res.render('pages/index.ejs');
}

function callBookApi(req, res){
  let bookArr = [];
  const bookURL = `https://www.googleapis.com/books/v1/volumes`;
  superagent.get(bookURL)
    .query({
      q: `in${req.body.searchBy}:${req.body.search}`,
      key: BOOK_API,
    })
    .then(data =>{
      const temp1 = data.body.items;
      bookArr.push(temp1.map(arrayObject => {
        return new BookObject (arrayObject);
      }));
      res.render('pages/searches/show.ejs',{books : bookArr[0]});
    }).catch(error =>{
      console.error(error);
      res.status(500).send('Something went wrong on our page.')
    });
}

function BookObject(jsonBookObject){
  this.img_url = jsonBookObject.volumeInfo.imageLinks.thumbnail.replace('http', 'https') || "https://i.imgur.com/J5LVHEL.jpg";
  this.title = jsonBookObject.volumeInfo.title || "Title";
  this.authors = jsonBookObject.volumeInfo.authors || "Authors";
  this.description = jsonBookObject.volumeInfo.description || "Description";
}


app.listen(PORT, () => console.log(`Server is listening to ${PORT}`));
