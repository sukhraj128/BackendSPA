const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const model = require('../models/users')
const auth = require('../controllers/auth')
const bcrypt = require('bcrypt');
const {validateUser} = require('../controllers/validation');
const can = require('../permissions/users');
const jwtStrat = require('../strategies/jwt')
//const router = Router({prefix: '/api/v1/users'});
const prefix ='/api/v1/users'
const router = Router({prefix: prefix})

router.get('/',bodyParser() ,jwtStrat.verifyToken,getAll);
router.post('/login', bodyParser(),login);
router.post('/', bodyParser(), validateUser ,createUser);
router.get('/:id([0-9]{1,})', jwtStrat.verifyToken,getById);
router.put('/:id([0-9]{1,})/update', jwtStrat.verifyToken, bodyParser(), updateUser);
router.del('/:id([0-9]{1,})/delete', jwtStrat.verifyToken ,deleteUser);

async function getAll(ctx) {
  const permission = can.readAll(ctx.state.user);
  if (!permission.granted) {
    ctx.status = 403;
  } else {
    const result = await model.getAll();
    if (result.length) {
      ctx.body = result.map(user => ({
        ...user,
        links: {
          self: `https://scubapromo-quartermagnet-3000.codio-box.uk${prefix}/${user.ID}`,
          getAll: `https://scubapromo-quartermagnet-3000.codio-box.uk${prefix}`,
          update: `https://scubapromo-quartermagnet-3000.codio-box.uk${prefix}/${user.ID}/update`,
          delete: `https://scubapromo-quartermagnet-3000.codio-box.uk${prefix}/${user.ID}/delete`,
          reviews: `https://scubapromo-quartermagnet-3000.codio-box.uk/reviews/user/${user.ID}`
        }
      }));
    }    
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
  const hash = bcrypt.hashSync(body.password, 10)
  body.password = hash;
  const result = await model.add(body);
  if (result.affectedRows) {
    const id = result.insertId;
    ctx.status = 201;
    ctx.body = {ID: id, created:true, link: `${ctx.request.path}${id}`};
  }
}

async function updateUser(ctx) {
  const id = ctx.params.id;
  let result = await model.getById(id);
  if(result.length){
    let user = result[0];
    const {dateRegistered, ...body} = ctx.request.body; 
    Object.assign(user, body);
    result = await model.update(user);
    if (result.affectedRows) {
      ctx.body = {
        ID: id, 
        updated: true,
        links: {
          self: `https://scubapromo-quartermagnet-3000.codio-box.uk${prefix}/${user.ID}`,
          getAll: `https://scubapromo-quartermagnet-3000.codio-box.uk${prefix}`,
          update: `https://scubapromo-quartermagnet-3000.codio-box.uk${prefix}/${user.ID}/update`,
          delete: `https://scubapromo-quartermagnet-3000.codio-box.uk${prefix}/${user.ID}/delete`
        }
      };
    }
  }
}

async function deleteUser(ctx) {
  const id = ctx.params.id;
  const result = await model.delById(id); 
  if (result.affectedRows) {
    ctx.status = 200; 
    ctx.body = {ID: id, deleted: true};
  } else {
    ctx.status = 404; 
    ctx.body = {error: "User not found"};
  }
}
//async function login(ctx) {
  // return any details needed by the client
 // const {ID, username, email, avatarURL} = ctx.state.user
 // const links = {
 //   self: `https://${ctx.host}${prefix}/${ID}`
 // }
 // ctx.body = {ID, username, email, avatarURL, links};
//}

async function login(ctx) {
  const { username, password } = ctx.request.body;

  // Attempt to find the user by their username
  const users = await model.findByUsername(username);
  if (users.length) {
    const user = users[0];

    // Verify the password
    if (bcrypt.compareSync(password, user.password)) {
      // Password is correct, generate a JWT token
      const token = jwtStrat.generateToken(user);

      // Prepare links and user details for the response
      const links ={
          self: `https://scubapromo-quartermagnet-3000.codio-box.uk${prefix}/${user.ID}`,
          getAll: `https://scubapromo-quartermagnet-3000.codio-box.uk${prefix}`,
          update: `https://scubapromo-quartermagnet-3000.codio-box.uk${prefix}/${user.ID}/update`,
          delete: `https://scubapromo-quartermagnet-3000.codio-box.uk${prefix}/${user.ID}/delete`,
          reviews: `https://scubapromo-quartermagnet-3000.codio-box.uk/api/v1/reviews/users/${user.ID}`
        }

      // Return the token and user details
      ctx.status = 200;
      ctx.body = {
        message: "Login successful",
        token,
        user: {
          ID: user.ID,
          role: user.role,
          username: user.username,
          email: user.email,
          avatarURL: user.avatarURL,
          links
        }
      };
    } else {
      // Password is incorrect
      ctx.status = 401; // Unauthorized
      ctx.body = { message: 'Authentication failed' };
    }
  } else {
    // No user found with the provided username
    ctx.status = 404; // Not Found
    ctx.body = { message: 'User not found' };
  }
}

module.exports = router;