import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  // Debug logging
  console.log('VerifyToken - Cookies:', req.cookies);
  console.log('VerifyToken - Token:', token ? 'Present' : 'Missing');

  if (!token) return next(createError(401, 'Not authenticated.'));

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      console.log('VerifyToken - JWT Error:', err.message);
      return next(createError(403, 'Token not valid.'));
    }

    console.log('VerifyToken - User verified:', user.id);
    req.user = user;

    next();
  });
};
