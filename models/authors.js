const db = require('../helpers/database');

// Get a single author by their ID
exports.getById = async function getById(id) {
  let query = "SELECT * FROM authors WHERE ID = ?";
  let values = [id];
  let data = await db.run_query(query, values);
  return data;
}

// List all authors in the database
exports.getAll = async function getAll(page, limit, order) {
  let query = "SELECT * FROM authors;";
  let data = await db.run_query(query);
  return data;
}

// Create a new author in the database
exports.add = async function add(author) {
  let query = "INSERT INTO authors SET ?";
  let data = await db.run_query(query, author);
  return data;
}

// Update an existing author in the database
exports.update = async function updateAuthor(id, author) {
  let query = "UPDATE authors SET ? WHERE ID = ?";
  let data = await db.run_query(query, [author, id]);
  return data;
}

// Delete an author from the database
exports.delete = async function deleteAuthor(id) {
  let query = "DELETE FROM authors WHERE ID = ?";
  let values = [id];
  let data = await db.run_query(query, values);
  return data;
}

// get author by bookID
exports.getAuthorByBookId = async function getAuthorByBookId(bookId) {
  let query = `
    SELECT authors.* FROM authors
    JOIN Books ON authors.ID = Books.AuthorID
    WHERE Books.BookID = ?;
  `;
  let values = [bookId]; 
  let data = await db.run_query(query, values);
  return data;
}