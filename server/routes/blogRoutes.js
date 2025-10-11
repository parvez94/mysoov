import express from 'express';
import {
  getPublishedArticles,
  getAllArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  togglePublishStatus,
  toggleArticlePause,
  deleteArticle,
  getUserArticles,
} from '../controllers/blogCtrl.js';
import { verifyToken, optionalAuth } from '../middlewares/auth.js';
import { verifyAdmin } from '../middlewares/adminAuth.js';

const router = express.Router();

// Admin-only routes
router.get('/articles/all', verifyToken, verifyAdmin, getAllArticles);
router.patch(
  '/articles/:id/publish',
  verifyToken,
  verifyAdmin,
  togglePublishStatus
);
router.patch(
  '/articles/:id/pause',
  verifyToken,
  verifyAdmin,
  toggleArticlePause
);

// Authenticated user routes (create/edit their own articles)
router.post('/articles', verifyToken, createArticle);
router.get('/articles/:id/edit', verifyToken, getArticleById);
router.put('/articles/:id', verifyToken, updateArticle);
router.delete('/articles/:id', verifyToken, deleteArticle);

// Get articles by user (for profile page) - uses optional auth to detect own profile
router.get('/user/:userId/articles', optionalAuth, getUserArticles);

// Public routes (parameterized routes come last)
router.get('/articles', getPublishedArticles);
router.get('/articles/:slug', getArticleBySlug);

export default router;
