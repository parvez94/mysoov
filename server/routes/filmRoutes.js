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
  addFilmToProfile,
  purchaseFilm,
  getFilmDirectoryStats,
  syncOrphanedFilms,
  // New simplified film system
  getAllFilms,
  createFilm,
  deleteFilm,
  searchFilmByCode,
  // Film image gallery system
  uploadImagesToDirectory,
  getDirectoryImages,
  deleteImageFromDirectory,
  getImagesByAccessCode,
} from '../controllers/filmCtrl.js';
import { verifyToken } from '../utils/verifyToken.js';
import { verifyAdmin } from '../middlewares/adminAuth.js';

const router = express.Router();

// ========================================
// NEW SIMPLIFIED FILM SYSTEM (NO FOLDERS)
// ========================================

// Admin routes for new film system
router.get('/admin/films', verifyToken, verifyAdmin, getAllFilms);
router.post('/admin/films', verifyToken, verifyAdmin, createFilm);
router.delete('/admin/films/:filmId', verifyToken, verifyAdmin, deleteFilm);

// User routes for new film system
router.post('/redeem/:code', verifyToken, searchFilmByCode);

// ========================================
// OLD FOLDER-BASED SYSTEM (KEEP FOR NOW)
// ========================================

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

// ========================================
// FILM IMAGE GALLERY SYSTEM
// ========================================

// Admin routes for image galleries
router.post(
  '/admin/directories/:directoryId/images',
  verifyToken,
  verifyAdmin,
  uploadImagesToDirectory
);
router.get(
  '/admin/directories/:directoryId/images',
  verifyToken,
  verifyAdmin,
  getDirectoryImages
);
router.delete(
  '/admin/images/:imageId',
  verifyToken,
  verifyAdmin,
  deleteImageFromDirectory
);

// User routes for image galleries
router.get('/gallery/:code', verifyToken, getImagesByAccessCode);

export default router;
