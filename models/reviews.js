const db = require('../helpers/database');

//get a single review by its id  
exports.getById = async function getById (id) {
  let query = "SELECT * FROM Reviews WHERE ReviewID = ?";
  let values = [id];
  let data = await db.run_query(query, values);
  return data;
}

//list all the review in the database
exports.getAll = async function getAll (page, limit, order) {
  // TODO: use page, limit, order to give pagination
  let query = "SELECT * FROM Reviews;";
  let data = await db.run_query(query);
  return data;
}

//create a new review in the database
exports.add = async function add (book) {
  let query = "INSERT INTO Reviews SET ?";
  let data = await db.run_query(query, book);
  return data;
}

exports.update = async function updateBook(id,book){
  let query = "UPDATE Reviews SET ? WHERE ReviewID = ?";
  let data = await db.run_query(query, [book,id]);
  return data;
}

exports.delete = async function deleteBook(id) {
  let query = "DELETE FROM Reviews WHERE ReviewID = ?";
  let values = [id];
  let data = await db.run_query(query,values);
  return data;
}

exports.getByBookId = async function getByBookId(bookId) {
  let query = `
    SELECT Reviews.ReviewID, Reviews.Rating, Reviews.ReviewText, Reviews.CreatedAt, Reviews.UserID ,users.username
    FROM Reviews
    JOIN users ON Reviews.UserID = users.ID
    WHERE Reviews.BookID = ?;`;
  let values = [bookId];
  let data = await db.run_query(query, values);
  return data;
}

