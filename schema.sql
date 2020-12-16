DROP TABLE IF EXISTS books;

CREATE TABLE books(
  id SERIAL PRIMARY KEY,
  img_url VARCHAR(255),
  title VARCHAR(255),
  authors VARCHAR(255),
  book_description TEXT,
  isbn VARCHAR(255)
);