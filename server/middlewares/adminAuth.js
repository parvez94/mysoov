import { createError } from '../utils/error.js';

// Middleware to check if user is admin (role === 1)
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return next(createError(401, 'You are not authenticated'));
  }

  if (req.user.role !== 1) {
    return next(
      createError(403, 'You are not authorized to access this resource')
    );
  }

  next();
};
