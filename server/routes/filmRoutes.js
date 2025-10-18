import express from 'express';
import {
  getAllFilmDirectories,
  getFilmDirectory,
  createFilmDirectory,
  uploadFilmToDirectory,
  removeFilmFromDirectory,
  deleteFilmDirectory,
  searchFilmDirectory,
  getFilmDirectoryDetails,
  verifyAndGetFilms,
  redeemFilmDirectory,
  addFilmToProfile,
  purchaseFilm,
  getFilmDirectoryStats,
  syncOrphanedFilms,
} from '../controllers/filmCtrl.js';
import { verifyToken } from '../utils/verifyToken.js';
import { verifyAdmin } from '../middlewares/adminAuth.js';

const router = express.Router();

// Admin routes (require authentication and admin role)
router.get(
  '/admin/directories',
  verifyToken,
  verifyAdmin,
  getAllFilmDirectories
);
router.get(
  '/admin/directories/stats',
  verifyToken,
  verifyAdmin,
  getFilmDirectoryStats
);
router.post(
  '/admin/sync-orphaned',
  verifyToken,
  verifyAdmin,
  syncOrphanedFilms
);
router.get(
  '/admin/directories/:directoryId',
  verifyToken,
  verifyAdmin,
  getFilmDirectory
);
router.post(
  '/admin/directories',
  verifyToken,
  verifyAdmin,
  createFilmDirectory
);
router.post(
  '/admin/directories/:directoryId/films',
  verifyToken,
  verifyAdmin,
  uploadFilmToDirectory
);
router.delete(
  '/admin/directories/:directoryId/films/:filmId',
  verifyToken,
  verifyAdmin,
  removeFilmFromDirectory
);
router.delete(
  '/admin/directories/:directoryId',
  verifyToken,
  verifyAdmin,
  deleteFilmDirectory
);

// User routes (require authentication only)
router.get('/search/:code', verifyToken, searchFilmDirectory);
router.get('/details/:directoryId', verifyToken, getFilmDirectoryDetails);
router.post('/add-to-profile', verifyToken, addFilmToProfile);
router.post('/purchase', verifyToken, purchaseFilm);
router.post('/verify', verifyToken, verifyAndGetFilms);
router.post('/redeem', verifyToken, redeemFilmDirectory);

export default router;
