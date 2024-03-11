// My blog API

// Set up the application and its router

const Koa = require('koa');
const Router = require('koa-router');


const app = new Koa();
const router = new Router();


/*
 * Define route handler(s):
 * 
 * This means we connect HTTP methods: GET, POST, ...
 * and URI paths: /some/uri/path
 * to JavaScript functions that handle the request.
 * 
 * Once defined we then add them to the app object.
*/
router.get('/api/v1', welcomeAPI);
app.use(router.routes());




// Define the actual handler functions

function welcomeAPI(ctx, next) {
  ctx.body = {
    message: "Welcome to the blog API!"
  }
}

const articles = require('./routes/articles.js');
app.use(articles.routes());

// Finally, run the app as a process on a given port

app.listen(3000);