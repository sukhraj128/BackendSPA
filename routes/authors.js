const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const authorModel = require('../models/authors');
const auth = require('../controllers/auth');
const {validateAuthor} = require('../controllers/validation');
const can = require('../permissions/authors');
const jwtStrat = require('../strategies/jwt');

const prefix = '/api/v1/authors';
const router = Router({ prefix });

router.get('/', getAllAuthors);
router.post('/', bodyParser(), jwtStrat.verifyToken, validateAuthor, createAuthor);
router.get('/:id([0-9]{1,})', getAuthorById);
router.put('/:id([0-9]{1,})', bodyParser(), jwtStrat.verifyToken, validateAuthor, updateAuthor);
router.del('/:id([0-9]{1,})', jwtStrat.verifyToken, deleteAuthor);
router.get('/by-book/:BookID([0-9]{1,})', getAuthorByBookId);

async function getAllAuthors(ctx) {
  const { page = 1, limit = 100, order = "dateadded", direction = 'ASC' } = ctx.request.query;
  const result = await authorModel.getAll(page, limit, order, direction);
  if (result.length) {
    const body = result.map(author => {
      const { ID, firstName, lastName, bio, profilePicURL, dateadded } = author;
      const links = {
      self: `https://${ctx.host}${prefix}/${ID}`,
      update: `https://${ctx.host}${prefix}/${ID}`,
      delete: `https://${ctx.host}${prefix}/${ID}`
      }
      return { ID, firstName, lastName, bio, profilePicURL, dateadded, links };
    });
    ctx.body = body;
  }
}

async function getAuthorById(ctx) {
  let id = ctx.params.id;
  let author = await authorModel.getById(id);
  if (author.length) {
    const { ID, firstName, lastName, bio, profilePicURL, dateadded } = author[0];
    const links = {
      self: `https://${ctx.host}${prefix}/${ID}`,
      update: `https://${ctx.host}${prefix}/${ID}`,
      delete: `https://${ctx.host}${prefix}/${ID}`
    };
    ctx.body = { ID, firstName, lastName, bio, profilePicURL, dateadded, _links: links };
  }
}

async function createAuthor(ctx) {
  const permission = can.create(ctx.state.user);

  if (!permission.granted) {
    ctx.status = 403;
    ctx.body = { error: "Not allowed to create authors" };
    return;
  }

  const body = ctx.request.body;
  let result = await authorModel.add(body);
  if (result) {
    ctx.status = 201;
    ctx.body = { ID: result.insertId };
  } else {
    ctx.status = 400;
    ctx.body = { error: "Failed to create author" };
  }
}

async function updateAuthor(ctx) {
  const id = ctx.params.id;
  const author = await authorModel.getById(id);
  if (!author.length) {
    ctx.status = 404;
    ctx.body = { error: "Author not found" };
    return;
  }

  const permission = can.update(ctx.state.user, author[0]);
  if (!permission.granted) {
    ctx.status = 403;
    ctx.body = { error: "Not allowed to edit this author" };
    return;
  }

  const updateData = ctx.request.body;
  const result = await authorModel.update(id, updateData);
  if (result.affectedRows) {
    ctx.status = 200;
    ctx.body = { ID: id, updated: true, link: ctx.request.path };
  } else {
    ctx.status = 400;
    ctx.body = { error: "Failed to update author" };
  }
}

async function deleteAuthor(ctx) {
  const id = ctx.params.id;
  const author = await authorModel.getById(id);
  if (!author.length) {
    ctx.status = 404;
    ctx.body = { error: "Author not found" };
    return;
  }

  const permission = can.delete(ctx.state.user, author[0]);
  if (!permission.granted) {
    ctx.status = 403;
    ctx.body = { error: "Not allowed to delete this author" };
    return;
  }

  const result = await authorModel.delete(id);
  if (result.affectedRows) {
    ctx.status = 200;
    ctx.body = { ID: id, deleted: true };
  } else {
    ctx.status = 400;
    ctx.body = { error: "Failed to delete author" };
  }
}

async function getAuthorByBookId(ctx) {
  let bookId = ctx.params.BookID;
  let author = await authorModel.getAuthorByBookId(bookId);
  if (author.length) {
    const { ID, firstName, lastName, bio, profilePicURL, dateadded } = author[0];
    const links = {
      self: `https://${ctx.host}${prefix}/${ID}`,
    };
    ctx.body = { ID, firstName, lastName, bio, profilePicURL, dateadded, _links: links };
  } else {
    ctx.status = 404;
    ctx.body = { error: "Author not found for the given book ID" };
  }
}


module.exports = router;
