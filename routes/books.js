const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const model = require('../models/books');
const auth = require('../controllers/auth');
const {validateArticle} = require('../controllers/validation');
const can = require('../permissions/books');

const router = Router({prefix: '/api/v1/books'});

router.get('/', getAll);
router.post('/', bodyParser(), validateArticle ,createBook);
router.get('/:id([0-9]{1,})', getById);
router.put('/:id([0-9]{1,})', bodyParser(), auth ,validateArticle ,updateBook);
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
  const permission = can.create(ctx.state.user);

  if (!permission.granted) {
    ctx.status = 403;
    ctx.body = { error: "Not allowed to create books" };
    return;
  }

  const body = ctx.request.body;
  let result = await model.add(body);
  if (result) {
    ctx.status = 201;
    ctx.body = { ID: result.insertId };
  } else {
    ctx.status = 400;
    ctx.body = { error: "Failed to create book" };
  }
}

async function updateBook(ctx) {
  const id = ctx.params.id;
  const book = await model.getById(id);
  if (!book.length) {
    ctx.status = 404;
    ctx.body = {error: "Book not found"};
    return;
  }


  const permission = can.update(ctx.state.user, book[0]); // This needs to be implemented based on your permissions logic
  if (!permission.granted) {
    ctx.status = 403;
    ctx.body = {error: "Not allowed to edit this book"};
    return;
  }

  const updateData = ctx.request.body;
  const result = await model.update(id, updateData);
  if (result.affectedRows) {
    ctx.status = 200;
    ctx.body = {ID: id, updated: true, link: ctx.request.path};
  } else {
    ctx.status = 400;
    ctx.body = {error: "Failed to update book"};
  }
}
async function deleteBook(ctx) {
  const id = ctx.params.id;
  const book = await model.getById(id);
  if (!book.length) {
    ctx.status = 404;
    ctx.body = {error: "Book not found"};
    return;
  }

  // Permission check should be based on book ownership or role
  const permission = can.delete(ctx.state.user, book[0]); // This needs to be implemented based on your permissions logic
  if (!permission.granted) {
    ctx.status = 403;
    ctx.body = {error: "Not allowed to delete this book"};
    return;
  }

  const result = await model.delete(id);
  if (result.affectedRows) {
    ctx.status = 200;
    ctx.body = {ID: id, deleted: true};
  } else {
    ctx.status = 400;
    ctx.body = {error: "Failed to delete book"};
  }
}


module.exports = router;
