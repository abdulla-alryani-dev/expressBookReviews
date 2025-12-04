const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required."
    });
  }

  // Check if username already exists
  let userExists = users.filter(user => user.username === username);

  if (userExists.length > 0) {
    return res.status(400).json({
      message: "Username already exists. Please choose a different username."
    });
  }

  // Register new user
  users.push({ username, password });

  return res.status(200).json({
    message: "User registered successfully."
  });

});

public_users.get('/books', (req, res) => {
  const books = require('./booksdb.js');
  res.json(books);
});


// Get the book list available in the shop

public_users.get('/', function (req, res) {
  axios.get('http://localhost:5000/books')  // Example endpoint
    .then(response => {
      return res.send(response.data); 
    })
    .catch(error => {
      return res.status(500).send("Error fetching books");
    });
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  axios.get('http://localhost:5000/books')
    .then(response => {
      const book = response.data[isbn];

      if (!book) {
        return res.status(404).send("Book not found");
      }

      return res.send(book);
    })
    .catch(error => {
      return res.status(500).send("Error fetching book");
    });
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  axios.get('http://localhost:5000/books')
    .then(response => {
      const booksArray = Object.values(response.data);
      const result = booksArray.filter(book => book.author === author);

      if (result.length === 0) {
        return res
          .status(404)
          .json({ message: "No books found for this author" });
      }

      return res.json(result);
    })
    .catch(error => {
      return res.status(500).send("Error fetching books");
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  
  const title = req.params.title;

  axios.get('http://localhost:5000/books')
    .then(response => {
      const booksArray = Object.values(response.data);
      const result = booksArray.filter(book => book.title === title);

      if (result.length === 0) {
        return res
          .status(404)
          .json({ message: "No books found with this title" });
      }

      return res.json(result);
    })
    .catch(error => {
      return res.status(500).send("Error fetching books");
    });
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }

  return res.json(books[isbn].reviews);

});

module.exports.general = public_users;
