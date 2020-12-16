'use strict';

const express = require ('express');
const superagent = require('superagent');
const cors = require('cors');
const BOOK_API = process.env.BOOK_API;
const pg = require('pg');
const { response } = require('express');
require ('dotenv').config();

const PORT = process.env.PORT || 9999;

const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.error(error));

app.use(cors());
app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');



app.get('/', getHomepage);
app.get('/books/:details', getBookDetails);
app.get('/searches/new', getSearches);
app.post('/searches', callBookApi);

function getSearches(req, res){
  res.render('pages/searches/new.ejs');
}

function getHomepage(req, res){
  let sqlBookQuery = 'SELECT * FROM books';
  client.query(sqlBookQuery)
    .then(results => {
      let indexData = results.rows
      res.render('pages/index.ejs', {indexData: indexData});
    })
    .catch(error => {
      console.error(`SQL Data retrieve Error: ${error}`);
    });
}

function getBookDetails(req, res){
  // TODO: Add an if Statement for SQL Insert
  let sqlBookDetails = 'SELECT * FROM books WHERE id=$1';
  client.query(sqlBookDetails, [req.params.details])
    .then(result => {
      const resultData = result.rows[0];
      res.render('pages/books/show.ejs', {indexObj: resultData});
    })
    .catch(error => {
      console.error(`Failure to Retrieve Book from Database.  Error: ${error}`);
    });
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
      res.status(500).send('Your search returned no results.')
    });
}

function BookObject(jsonBookObject){
  this.img_url = jsonBookObject.volumeInfo.imageLinks && jsonBookObject.volumeInfo.imageLinks.thumbnail.replace('http', 'https') || "https://i.imgur.com/J5LVHEL.jpg";
  this.title = jsonBookObject.volumeInfo.title || "No Title";
  this.authors = jsonBookObject.volumeInfo.authors || "Unknown Authors";
  this.book_description = jsonBookObject.volumeInfo.description || "No Description";
  this.isbn = jsonBookObject.volumeInfo.industryIdentifiers && jsonBookObject.volumeInfo.industryIdentifiers[1] && `${jsonBookObject.volumeInfo.industryIdentifiers[1].type} ${jsonBookObject.volumeInfo.industryIdentifiers[1].identifier}` || 'No ISBN 13';
}

app.use('*', (req, res) => {
  response.status(404).send('Page does not exist.');
});
client.connect();
app.listen(PORT, () => console.log(`Server is listening to ${PORT}`));
