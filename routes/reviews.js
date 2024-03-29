const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const model = require('../models/reviews');
const auth = require('../controllers/auth');
const {validateReview} = require('../controllers/validation');
const can = require('../permissions/reviews');
const jwtStrat = require('../strategies/jwt')


const router = Router({prefix: '/api/v1/reviews'});

router.get('/', getAll);
router.post('/books/:BookID([0-9]{1,})', jwtStrat.verifyToken, bodyParser(), validateReview, createReview);
router.get('/:id([0-9]{1,})', getById);
router.put('/:id([0-9]{1,})', bodyParser(), jwtStrat.verifyToken  ,updateReview);
router.del('/:id([0-9]{1,})', jwtStrat.verifyToken, deleteReview);

router.get('/books/:BookID([0-9]{1,})', getByBookId);

async function getAll(ctx) {
  let reviews = await model.getAll();
  if (reviews.length) {
    ctx.body = reviews.map(review => ({
      ...review,
      links: {
        self: `${ctx.origin}/api/v1/reviews/${review.ID}`,
        create: `${ctx.origin}/api/v1/reviews/books/${review.BookID}`
      }
    }));
  }
}

async function getById(ctx) {
  let id = ctx.params.id;
  let review = await model.getById(id);
  if (review.length) {
    ctx.body = {
      ...review[0],
      links: {
        update: `${ctx.origin}/api/v1/reviews/${id}`,
        delete: `${ctx.origin}/api/v1/reviews/${id}`,
        allReviews: `${ctx.origin}/api/v1/reviews`
      }
    };
  }
}

async function createReview(ctx) {
  const userID = ctx.state.user.id;
  const BookID = ctx.params.BookID;

  const permission = can.create(ctx.state.user);

  if (!permission.granted) {
    ctx.status = 403;
    ctx.body = { error: "Not allowed to create Review" };
    return;
  }

  const { Rating, ReviewText } = ctx.request.body;
  const reviewData = {
    UserID: userID, 
    BookID,
    Rating,
    ReviewText,
  };

  let result = await model.add(reviewData);
  if (result) {
    ctx.status = 201;
    ctx.body = { 
      ID: result.insertId,
      links: {
        self: `${ctx.origin}/api/v1/reviews/${result.insertId}`,
        update: `${ctx.origin}/api/v1/reviews/${result.insertId}`,
        delete: `${ctx.origin}/api/v1/reviews/${result.insertId}`
      }
    };
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
  const permission = can.update(ctx.state.user, book[0]); 
  if (!permission.granted) {
    ctx.status = 403;
    ctx.body = {error: "Not allowed to edit this Review"};
    return;
  }

  const updateData = ctx.request.body;
  const result = await model.update(id, updateData);
  if (result.affectedRows) {
    ctx.status = 200;
    ctx.body = {
      ID: id, updated: true, 
      links: {
        self: `${ctx.origin}/api/v1/reviews/${id}`,
        delete: `${ctx.origin}/api/v1/reviews/${id}`
      }
    };
  } else {
    ctx.status = 400;
    ctx.body = {error: "Failed to update Review"};
  }
}
async function deleteReview(ctx) {
  const id = ctx.params.id;
  const review = await model.getById(id);
  if (!review.length) {
    ctx.status = 404;
    ctx.body = { error: "Review not found" };
    return;
  }
  const permission = can.delete(ctx.state.user, review[0]);
  if (!permission.granted) {
    ctx.status = 403;
    ctx.body = { error: "Not allowed to delete this review" };
    return;
  }

  const result = await model.delete(id);
  if (result.affectedRows) {
    ctx.status = 200;
    ctx.body = {
      ID: id, deleted: true,
      links: {
        allReviews: `${ctx.origin}/api/v1/reviews`
      }
    };
  } else {
    ctx.status = 400;
    ctx.body = { error: "Failed to delete review" };
  }
}

async function getByBookId(ctx) {
  const bookId = ctx.params.BookID;
  console.log(bookId); 
  const reviews = await model.getByBookId(bookId);
  if (reviews && reviews.length) {
    ctx.body = reviews.map(review => ({
      ...review,
      links: {
        self: `${ctx.origin}/api/v1/reviews/${review.ID}`,
        create: `${ctx.origin}/api/v1/reviews/books/${bookId}`
      }
    }));
  } else {
    ctx.status = 404;
    ctx.body = { error: "No reviews found for this book" };
  }
}


module.exports = router;
