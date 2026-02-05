const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const pb = require('../utils/dbBase');
const { safeGetOne } = require('../utils/dbHelpers');

const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authorization token missing', 401));
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return next(new AppError('Server misconfiguration: missing JWT secret', 500));
    }

    const decoded = jwt.verify(token, secret);

    if (!decoded || !decoded.id) {
      return next(new AppError('Invalid token payload', 401));
    }

    const user = await safeGetOne(pb, 'users', decoded.id);

    if (!user) {
      return next(new AppError('User not found for token', 401));
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token signature', 401));
    }
    return next(new AppError('Authentication failed', 500));
  }
};

module.exports = authenticate;
