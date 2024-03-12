const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const model = require('../models/reviews');
const auth = require('../controllers/auth');
const {validateReview} = require('../controllers/validation');
const can = require('../permissions/reviews');

const router = Router({prefix: '/api/v1/reviews'});

router.get('/', getAll);
router.post('/', bodyParser(), validateReview ,auth, createReview);
router.get('/:id([0-9]{1,})', getById);
router.put('/:id([0-9]{1,})', bodyParser(), auth  ,updateReview);
router.del('/:id([0-9]{1,})', auth,deleteReview);

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

async function createReview(ctx) {
  const userID = ctx.state.user.ID;
  const permission = can.create(ctx.state.user);

  if (!permission.granted) {
    ctx.status = 403;
    ctx.body = { error: "Not allowed to create Review" };
    return;
  }

  const { BookID, Rating, ReviewText } = ctx.request.body;
  const reviewData = {
    UserID: userID, 
    BookID,
    Rating,
    ReviewText,
  };

  let result = await model.add(reviewData);
  if (result) {
    ctx.status = 201;
    ctx.body = { ID: result.insertId };
  } else {
    ctx.status = 400;
    ctx.body = { error: "Failed to create Review" };
  }
}

async function updateReview(ctx) {
  const id = ctx.params.id;
  const book = await model.getById(id);
  if (!book.length) {
    ctx.status = 404;
    ctx.body = {error: "Review not found"};
    return;
  }

  console.log(ctx.state.user);
  const permission = can.update(ctx.state.user, book[0]); // This needs to be implemented based on your permissions logic
  if (!permission.granted) {
    ctx.status = 403;
    ctx.body = {error: "Not allowed to edit this Review"};
    return;
  }

  const updateData = ctx.request.body;
  const result = await model.update(id, updateData);
  if (result.affectedRows) {
    ctx.status = 200;
    ctx.body = {ID: id, updated: true, link: ctx.request.path};
  } else {
    ctx.status = 400;
    ctx.body = {error: "Failed to update Review"};
  }
}
async function deleteReview(ctx) {
  const id = ctx.params.id;
  const book = await model.getById(id);
  if (!book.length) {
    ctx.status = 404;
    ctx.body = {error: "Review not found"};
    return;
  }

  // Permission check should be based on book ownership or role
  const permission = can.delete(ctx.state.user, book[0]); // This needs to be implemented based on your permissions logic
  if (!permission.granted) {
    ctx.status = 403;
    ctx.body = {error: "Not allowed to delete this review"};
    return;
  }

  const result = await model.delete(id);
  if (result.affectedRows) {
    ctx.status = 200;
    ctx.body = {ID: id, deleted: true};
  } else {
    ctx.status = 400;
    ctx.body = {error: "Failed to delete review"};
  }
}


module.exports = router;
