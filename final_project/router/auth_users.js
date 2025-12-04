const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { 
  return users.some(user => user.username === username);
}


const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
   const { username, password } = req.body;

  // 1. Check if username & password are provided
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required."
    });
  }

  // 2. Check if username/password match an existing user
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Invalid username or password."
    });
  }

  // 3. Create JWT token
  let accessToken = jwt.sign(
    { data: username },   // payload
    "fingerprint_customer",             // secret key
    { expiresIn: "1h" }   // token expiry
  );

  // 4. Save user's JWT in session
  req.session.authorization = {
    accessToken, 
    username
  };

  return res.status(200).json({
    message: "Customer successfully logged in",
    token: accessToken
  });
  
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here

  const isbn = req.params.isbn;
  const review = req.query.review;

  // Username stored in session after login
  const username = req.session.authorization?.username;

  // Validate login
  if (!username) {
    return res.status(401).json({ message: "You must be logged in to post a review." });
  }

  // Validate review content
  if (!review) {
    return res.status(400).json({ message: "Review cannot be empty." });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Ensure reviews object exists
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update review from this username
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review successfully added or updated.",
    reviews: books[isbn].reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Username from session (set during login)
  const username = req.session.authorization?.username;

  // User must be logged in
  if (!username) {
    return res.status(401).json({ message: "You must be logged in to delete a review." });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // If the book has no reviews at all
  if (!books[isbn].reviews) {
    return res.status(404).json({ message: "No reviews found for this book." });
  }

  // Check if THIS user has a review for this book
  if (!books[isbn].reviews[username]) {
    return res.status(403).json({ message: "You cannot delete this review because you did not post it." });
  }

  // Delete only THIS user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Your review has been deleted successfully.",
    reviews: books[isbn].reviews
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
