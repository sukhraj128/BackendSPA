const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const model = require('../models/books');
const auth = require('../controllers/auth');
const {validateArticle} = require('../controllers/validation');

const router = Router({prefix: '/api/v1/books'});

router.get('/', getAll);
router.post('/', bodyParser(), validateArticle ,createBook);
router.get('/:id([0-9]{1,})', getById);
router.put('/:id([0-9]{1,})', bodyParser(), validateArticle ,updateBook);
router.del('/:id([0-9]{1,})', auth,deleteBook);

async function getAll(ctx) {
  let books = await model.getAll();
  if (books.length) {
    ctx.body = books;
  }
}

async function getById(ctx) {
  let id = ctx.params.id;
  let book = await model.getById(id);
  if (book.length) {
    ctx.body = book[0];
  }
}

async function createBook(ctx) {
  const body = ctx.request.body;
  let result = await model.add(body);
  if (result) {
    ctx.status = 201;
    ctx.body = {ID: result.insertId}
  }
}

async function updateBook(ctx) {
  // TODO edit an existing Book
  const id = ctx.params.id; //Gets Book ID 
  const body = ctx.request.body;
  let result = await model.update(id,body); // update Book
  if (result.affectedRows){
    ctx.status = 200;
  } else {
    ctx.status = 404;
  }

}
async function deleteBook(ctx) {
  const id = ctx.params.id; // Get the book ID from the URL parameter

  let result = await model.delete(id); // Delete the book from the database
  if (result.affectedRows) {
    ctx.status = 200; // Set the HTTP status code to 200 OK
  } else {
    ctx.status = 404; // Set the HTTP status code to 404 Not Found if no article was found to delete
  }
}

module.exports = router;
