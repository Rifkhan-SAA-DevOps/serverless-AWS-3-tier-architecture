const jwt = require('jsonwebtoken');
const { env, getJwtSecret } = require('../config/env');

const generateToken = (user) => {
  const userId = user.userId || user.id;

  return jwt.sign(
    {
      id: userId,
      userId,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || env.jwtExpiresIn }
  );
};

module.exports = generateToken;
