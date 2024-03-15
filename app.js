const Koa = require('koa');

const app = new Koa();
const cors = require('@koa/cors');
const special = require('./routes/special.js');
const books = require('./routes/books.js');
const users = require('./routes/users.js');
const reviews = require('./routes/reviews.js');

app.use(cors());
app.use(special.routes());
app.use(books.routes());
app.use(users.routes());
app.use(reviews.routes());


let port = process.env.PORT || 3000;


module.exports = app;

