const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const router = Router({prefix: '/api/v1'});

router.get('/', welcomeAPI);

function welcomeAPI(ctx) {
  ctx.body = {
    message: 'Welcome to the Book API'
  }
}

module.exports = router;
