import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) return next(createError(401, 'Not authenticated.'));

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return next(createError(403, 'Token not valid.'));

    req.user = user;

    next();
  });
};

// Optional authentication - sets req.user if token exists, but doesn't reject if missing
export const optionalAuth = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    // No token, but that's okay - continue without setting req.user
    return next();
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (!err) {
      // Token is valid, set req.user
      req.user = user;
    }
    // Continue regardless of token validity
    next();
  });
};
