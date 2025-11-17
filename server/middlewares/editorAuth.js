import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.js';

export const verifyEditor = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return next(createError(401, 'You are not authenticated!'));
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        return next(createError(403, 'Token is not valid!'));
      }

      if (user.role !== 'editor' && user.role !== 'admin') {
        return next(
          createError(403, 'You do not have permission to access this!')
        );
      }

      req.user = user;
      next();
    });
  } catch (err) {
    next(err);
  }
};
