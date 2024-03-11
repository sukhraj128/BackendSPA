const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const model = require('../models/users')
const auth = require('../controllers/auth')
const bcrypt = require('bcrypt');

const router = Router({prefix: '/api/v1/users'});

router.get('/',auth ,getAll);
router.post('/', bodyParser(), createUser);
router.get('/:id([0-9]{1,})', getById);
router.put('/:id([0-9]{1,})', bodyParser(), updateUser);
router.del('/:id([0-9]{1,})', deleteUser);

async function getAll(ctx) {
  const result = await model.getAll();
  if (result.length) {
    ctx.body = result;
  }
}
async function getById(ctx) {
  const id = ctx.params.id;
  const result = await model.getById(id);
  if (result.length) {
    const user = result[0]
    ctx.body = user;
  }
}

async function createUser(ctx) {
  const body = ctx.request.body;
  const hash = bcrypt.hashSync(body.password, 10) // 10 is number of rounds
  body.password = hash;
  const result = await model.add(body);
  if (result.affectedRows) {
    const id = result.insertId;
    ctx.status = 201;
    ctx.body = {ID: id, created:true, link: `${ctx.request.path}/${id}`};
  }
}

async function updateUser(ctx) {
  const id = ctx.params.id;
  let resylt = await model.getById(id);
  if(result.length){
    let user = result[0];
    const {ID, dateRegistered, ...body} = ctx.request.body;
    Object.assign(user, body);
    result = await model.update(user);
    if (result.affectedRows) {
      ctx.body = {ID: id, updated: true, link: ctx.request.path};
    }

  }

}

async function deleteUser(ctx) {
  const id = ctx.params.id;
  const result = await model.delete(id); // Assuming a delete method exists in your model
  if (result.affectedRows) {
    ctx.status = 200; // Successfully deleted
    ctx.body = {ID: id, deleted: true};
  } else {
    ctx.status = 404; // No user found to delete
    ctx.body = {error: "User not found"};
  }
}

module.exports = router;