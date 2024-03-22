const db = require('../helpers/database');

//add a new like record
exports.like = async function like (id, uid) {
  let query = "INSERT INTO bookLikes SET bookID=?, userID=? ON DUPLICATE KEY UPDATE bookID=bookID; ";  // fail silently if the like is already there
  const result = await db.run_query(query, [id, uid]);
  return result;
}
  
//remove a like record
exports.dislike = async function dislike (id, uid) {
  let query = "DELETE FROM bookLikes WHERE bookID=? AND userID=?; ";
  const result = await db.run_query(query, [id, uid]);
  return result;
}
  
//count the likes for an article
exports.count = async function count (id) {
  let query = "SELECT count(1) as likes FROM bookLikes WHERE bookID=?;";
  const result = await db.run_query(query, [id]);
  return result[0].likes;
}
