const db = require('../helpers/database');
//get a single user by its id
exports.getById = async function getById (id) {
  const query = "SELECT * FROM users WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query,values);
  return data;
}

//get a single user by the (unique) username
exports.findByUsername = async function getByUsername(username) {
  const query = "SELECT * FROM users WHERE username = ?;";
  const user = await db.run_query(query, username);
  return user;
}
// list all the users in the database
exports.getAll = async function getAll (page, limit, order) {
  const query = "SELECT * FROM users;";
  const data = await db.run_query(query);
  return data;
}

//create a new user in the database
exports.add = async function add (user) {
  const query = "INSERT INTO users SET ?";
  const data = await db.run_query(query,user);
  return data;
}

//delete by id
exports.delById = async function delById (id) {
  const query = "DELETE FROM users WHERE ID =?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
}

//update existing

exports.update = async function update (user) {
  const query = "UPDATE users SET ? WHERE ID = ?;";
  const values = [user, user.ID];
  const data = await db.run_query(query,values);
  return data;
}