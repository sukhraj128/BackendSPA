const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const model = require('../models/books');
const auth = require('../controllers/auth');
const {validateArticle} = require('../controllers/validation');
const can = require('../permissions/books');
const likes = require('../models/likes');
const jwtStrat = require('../strategies/jwt')

//const router = Router({prefix: '/api/v1/books'});
const prefix = '/api/v1/books';
const router = Router({prefix: prefix});

router.get('/', getAll);
router.post('/', bodyParser(), jwtStrat.verifyToken, validateArticle ,createBook);
router.get('/:id([0-9]{1,})', getById);
router.put('/:id([0-9]{1,})', bodyParser(), jwtStrat.verifyToken ,validateArticle ,updateBook);
router.del('/:id([0-9]{1,})', jwtStrat.verifyToken, deleteBook);
router.get('/:id([0-9]{1,})/likes', likesCount);
router.post('/:id([0-9]{1,})/likes', jwtStrat.verifyToken,likePost);
router.del('/:id([0-9]{1,})/likes', jwtStrat.verifyToken ,dislikePost);
router.get('/by-author/:authorId([0-9]{1,})', getBooksByAuthorId);

async function getAll(ctx) {
  const {page=1, limit=100, order="dateCreated", direction='ASC'} = ctx.request.query;
  const result = await model.getAll(page, limit, order, direction);
  if (result.length) {
    const body = result.map(post => {
      const {BookID, Title, PublicationYear , Genre, AuthorID, imageURL} = post;
      const links = {
        likes: `https://${ctx.host}${prefix}/${BookID}/likes`,
        self: `https://${ctx.host}${prefix}/${BookID}`,
        author: `https://${ctx.host}/api/v1/authors/by-book/${BookID}`,
        byAuthor: `https://${ctx.host}${prefix}/by-author/${AuthorID}`,
      }
      return {BookID, Title, PublicationYear, Genre, AuthorID, imageURL,links};
    });
    ctx.body = body;
  }
}


async function getById(ctx) {
  let id = ctx.params.id;
  let book = await model.getById(id);
  if (book.length) {
    const {BookID, Title, PublicationYear , Genre, AuthorID, imageURL} = book[0];
    const links = {
      likes: `https://${ctx.host}${prefix}/${BookID}/likes`,
      self: `https://${ctx.host}${prefix}/${BookID}`,
      author: `https://${ctx.host}/api/v1/authors/by-book/${BookID}`,
      byAuthor: `https://${ctx.host}${prefix}/by-author/${AuthorID}`,
    };
    ctx.body = {BookID, Title, PublicationYear, Genre, AuthorID, imageURL, _links: links}; // Modified to include _links key
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
  const permission = can.delete(ctx.state.user, book[0]); 
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

async function likesCount(ctx) {
  const id = ctx.params.id;
  const result = await likes.count(id);
  ctx.body = result ? result : 0;
}

async function likePost(ctx) {
 const bookID = parseInt(ctx.params.id);
 const userID = ctx.state.user.id; 

  if (!userID) {
    ctx.status = 400; 
    ctx.body = { error: "User ID is undefined" };
    return;
  }
  const result = await likes.like(bookID, userID);
  console.log(result);
  ctx.body = result.affectedRows ? {message: "liked"} : {message: "error"};
}

async function dislikePost(ctx) {
  const bookID = parseInt(ctx.params.id);
  const userID = ctx.state.user.id;

  if (!userID) {
    ctx.status = 400; 
    ctx.body = { error: "User ID is undefined" };
    return;
  }

  const result = await likes.dislike(bookID, userID);
  ctx.body = result.affectedRows ? {message: "disliked"} : {message: "error"};
}
async function getBooksByAuthorId(ctx) {
  let authorId = ctx.params.authorId;
  let books = await model.getByAuthorId(authorId);
  if (books.length) {
    const body = books.map(book => {
      const { BookID, Title, PublicationYear, Genre, AuthorID, imageURL } = book;
      const links = {
        likes: `https://${ctx.host}${prefix}/${BookID}/likes`,
        self: `https://${ctx.host}${prefix}/${BookID}`,
      };
      return { BookID, Title, PublicationYear, Genre, AuthorID, imageURL, links };
    });
    ctx.body = body;
  } else {
    ctx.status = 404;
    ctx.body = { error: "No books found for the given author ID" };
  }
}



module.exports = router;
