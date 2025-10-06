import { createError } from '../utils/error.js';

// Middleware to check if user is admin (role === 'admin')
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return next(createError(401, 'You are not authenticated'));
  }

  if (req.user.role !== 'admin') {
    return next(
      createError(403, 'You are not authorized to access this resource')
    );
  }

  next();
};
