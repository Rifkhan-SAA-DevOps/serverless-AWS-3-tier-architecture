const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/env');
const { findUserById, sanitizeUser } = require('../services/user.dynamo.service');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());
    const userId = decoded.userId || decoded.id;

    const user = await findUserById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    // Keep both id and userId because your existing controllers/routes use req.user.id.
    req.user = sanitizeUser(user);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({ success: false, message: 'Admin access required' });
};

// Backward-compatible alias in case some files import { admin }.
const admin = adminOnly;

module.exports = { protect, adminOnly, admin };
