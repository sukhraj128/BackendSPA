const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key';


exports.generateToken = (user) => {
  const payload = {
    id: user.ID,
    username: user.username,
    role: user.role
  };
  return jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Token expires in 1 hour
};

// Middleware to verify token and attach user to context
exports.verifyToken = async (ctx, next) => {
  const token = ctx.headers['authorization']?.split(' ')[1]; // Authorization: Bearer <token>
  if (token) {
    try {
      const decoded = jwt.verify(token, secretKey);
      console.log("Decoded Token:", decoded);
      ctx.state.user = decoded; // Attach the decoded user to the context
      await next(); // Proceed to the next middleware
    } catch (error) {
      console.error("JWT verification error",error)
      ctx.status = 401; // Unauthorized
      ctx.body = { error: 'Invalid token' };
    }
  } else {
    ctx.status = 401; // Unauthorized
    ctx.body = { error: 'No token provided' };
  }
};