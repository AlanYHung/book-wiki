'use strict';

const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const BOOK_API = process.env.BOOK_API;
const pg = require('pg');
const { response } = require('express');
require('dotenv').config();
const methodOverride = require('method-override');

const PORT = process.env.PORT || 9999;

const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.error(error));

app.use(cors());
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');


app.get('/', getHomepage);
app.get('/books/:details', getBookDetails);
app.get('/searches/new', getSearches);
app.post('/searches', callBookApi);
app.post('/books', savedBook);
app.put('/books/:details', updateBookData);
app.delete('/', deleteBookData);

function sqlGet(req) {
  const sqlArray = [req.body.title, req.body.img_url, req.body.isbn, req.body.authors, req.body.book_description];
  const sql = 'INSERT INTO books (title, img_url, isbn, authors, book_description) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  return client.query(sql, sqlArray);
}

function sqlReturn() {
  let sqlBookQuery = 'SELECT * FROM books';
  return client.query(sqlBookQuery);
}

function sqlDetails(req) {
  let sqlBookDetails = 'SELECT * FROM books WHERE id=$1';
  return client.query(sqlBookDetails, [req.params.details]);
}

function sqlUpdate(req){
  const updateSQL = 'UPDATE books SET title=$2, authors=$3, isbn=$4, book_description=$5, img_url=$6 WHERE id=$1 RETURNING *';
  const sqlValues = [req.body.id, req.body.title, req.body.authors, req.body.isbn, req.body.book_description, req.body.img_url];
  return client.query(updateSQL, sqlValues);
}

function sqlDelete(req){
  const deleteSQL = 'DELETE FROM books WHERE id=$1';
  const sqlValues = [req.body.id];
  return client.query(deleteSQL, sqlValues);
}

function catchError(error, res){
  console.error(error);
  res.status(500).send('We have encountered an internal service error');
}

function savedBook(req, res) {
  sqlGet(req).then(results => {
    console.log(results.rows[0]);
    res.redirect(`/books/${results.rows[0].id}`);
  }).catch(error => catchError(error, res));
}


function getSearches(req, res) {
  res.render('pages/searches/new.ejs');
}

function getHomepage(req, res) {
  sqlReturn().then(results => {
    let indexData = results.rows;
    res.render('pages/index.ejs', { indexData: indexData });
  })
    .catch(error => catchError(error, res));
}

function getBookDetails(req, res) {
  sqlDetails(req).then(result => {
    const resultData = result.rows[0];
    res.render('pages/books/show.ejs', { indexObj: resultData });
  })
    .catch(error => catchError(error, res));
}

function callBookApi(req, res) {
  let bookArr = [];
  const bookURL = `https://www.googleapis.com/books/v1/volumes`;
  superagent.get(bookURL)
    .query({
      q: `in${req.body.searchBy}:${req.body.search}`,
      key: BOOK_API,
    })
    .then(data => {
      const temp1 = data.body.items;
      bookArr.push(temp1.map(arrayObject => {
        return new BookObject(arrayObject);
      }));
      res.render('pages/searches/show.ejs', { books: bookArr[0] });
    }).catch(error => catchError(error, res));
}

function updateBookData(req, res){
  sqlUpdate(req).then(results => {
    res.render('pages/books/show.ejs', { indexObj: results.rows[0] });
  })
}

function deleteBookData(req, res){
  sqlDelete(req)
    .then(() => {
      res.redirect('/');
    })
    .catch(error => catchError(error));
}

function BookObject(jsonBookObject) {
  this.img_url = jsonBookObject.volumeInfo.imageLinks && jsonBookObject.volumeInfo.imageLinks.thumbnail.replace('http', 'https') || "https://i.imgur.com/J5LVHEL.jpg";
  this.title = jsonBookObject.volumeInfo.title || "No Title";
  this.authors = jsonBookObject.volumeInfo.authors || "Unknown Authors";
  this.book_description = jsonBookObject.volumeInfo.description || "No Description";
  const ident = jsonBookObject.volumeInfo.industryIdentifiers;
  this.isbn = 'N/A';
  if (ident) {
    for (let i = 0; i < ident.length; i++) {
      this.isbn = `${ident[i].type} ${ident[i].identifier}`
      if (ident[i].type === 'ISBN 13') {
        this.isbn = `${ident[i].type} ${ident[i].identifier}`;
        break;
      }
    }
  }
}

app.use('*', (req, res) => {
  res.status(404).send('Page does not exist.');
});
client.connect();
app.listen(PORT, () => console.log(`Server is listening to ${PORT}`));
