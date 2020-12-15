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
app.post('/searches/new', callBookApi);

function getSearches(req, res){
  res.render('pages/searches/new.ejs');
}

function getHomepage(req, res){
  res.render('pages/index.ejs');
}

function callBookApi(req, res){
  let bookArr = [];
  const bookURL = `https://www.googleapis.com/books/v1/volumes`;
  if(req.body.searchBy === 'author'){
    superagent.get(bookURL)
      .query({
        q: `inauthor:${req.body.search}`,
        key: BOOK_API,
      })
      .then(data =>{
        const temp1 = data.body.items;
        bookArr.push(temp1.map(arrayObject => {
          return new BookObject (arrayObject);
        }));
        console.log(bookArr);
        res.render('pages/searches/show.ejs', req.body);
      })
      .catch(error => {res.status(500).send(error);});
  } else{
  //   superagent.get(bookURL)
  //     .query({
  //       q: `intitle:${req.body.search}`,
  //       key: BOOK_API
  //     })
  //     .then(data =>{
  //       res.render('pages/searches/show.ejs', req.body);
  //     })
  //     .catch(error => {res.status(500).send(error);});
  }
  //intitle
  //inauthor
  // console.log(req.body);
  console.log(bookArr);
}

//TODO: HTTP convert to HTTPS
//TODO: 

function BookObject(jsonBookObject){
  this.img_url = jsonBookObject.volumeInfo.imageLinks.thumbnail || "https://i.imgur.com/J5LVHEL.jpg";
  this.title = jsonBookObject.volumeInfo.title || "Title";
  this.authors = jsonBookObject.volumeInfo.authors || "Authors";
  this.description = jsonBookObject.volumeInfo.description || "Description";
}


app.listen(PORT, () => console.log(`Server is listening to ${PORT}`));
