const Koa = require('koa');

const app = new Koa();

const special = require('./routes/special.js')
const books = require('./routes/books.js');

app.use(special.routes());
app.use(books.routes());

let port = process.env.PORT || 3000;

app.listen(port);

