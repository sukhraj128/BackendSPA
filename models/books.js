const db = require('../helpers/database');

//get a single book by its id  
exports.getById = async function getById (id) {
  let query = "SELECT * FROM Books WHERE BookID = ?";
  let values = [id];
  let data = await db.run_query(query, values);
  return data;
}

//list all the book in the database
exports.getAll = async function getAll (page, limit, order) {
  // TODO: use page, limit, order to give pagination
  let query = "SELECT * FROM Books;";
  let data = await db.run_query(query);
  return data;
}

//create a new book in the database
exports.add = async function add (book) {
  let query = "INSERT INTO Books SET ?";
  let data = await db.run_query(query, book);
  return data;
}

exports.update = async function updateBook(id,book){
  let query = "UPDATE Books SET ? WHERE BookID = ?";
  let data = await db.run_query(query, [book,id]);
  return data;
}

exports.delete = async function deleteBook(id) {
  let query = "DELETE FROM Books WHERE BookID = ?";
  let values = [id];
  let data = await db.run_query(query,values);
  return data;
}

