// server/utils/auth.js
const jwt = require('jsonwebtoken');
const secret = '$3cr3tk3y';
const expiration = '2h';

module.exports = {
  signToken: function({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
  authMiddleware: function(req, res, next) {
    console.log('authMiddleware called. Request:', req);

    let token = req.body?.token || req.query?.token || req.headers?.authorization;

    if (req.headers?.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (token) {
      try {
        const { data } = jwt.verify(token, secret, { maxAge: expiration });
        req.user = data;
      } catch (error) {
        console.log('Invalid token: ', error.message);
      }
    }

    next(); // Proceed to next middleware
  }
};

