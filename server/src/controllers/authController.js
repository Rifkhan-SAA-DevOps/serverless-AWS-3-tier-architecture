const bcrypt = require('bcryptjs');
const { success, error } = require('../utils/apiResponse');
const generateToken = require('../utils/generateToken');
const {
  createUser,
  findUserByEmail,
  sanitizeUser,
} = require('../services/user.dynamo.service');

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return error(res, 'Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      return error(res, 'Password must be at least 6 characters', 400);
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return error(res, 'User already exists with this email', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email: normalizedEmail,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'customer',
    });

    const token = generateToken(user);

    return success(res, 'User registered successfully', {
      token,
      user: sanitizeUser(user),
    }, 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 'Email and password are required', 400);
    }

    const normalizedEmail = email.toLowerCase();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return error(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user);

    return success(res, 'Login successful', {
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

const getMe = async (req, res) => {
  return success(res, 'User profile', req.user);
};

module.exports = { register, login, getMe };
