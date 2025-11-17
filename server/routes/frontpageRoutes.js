import express from 'express';
import {
  getFrontpageSettings,
  updateFrontpageSettings,
  addSliderItem,
  removeSliderItem,
  updateSliderItem,
  submitCode,
} from '../controllers/frontpageCtrl.js';
import { verifyToken } from '../utils/verifyToken.js';
import { verifyAdmin } from '../middlewares/adminAuth.js';

const router = express.Router();

// Public routes
router.get('/settings', getFrontpageSettings);
router.post('/submit-code', submitCode);

// Admin routes (require authentication and admin role)
router.put('/settings', verifyToken, verifyAdmin, updateFrontpageSettings);
router.post('/slider/items', verifyToken, verifyAdmin, addSliderItem);
router.put('/slider/items/:itemId', verifyToken, verifyAdmin, updateSliderItem);
router.delete(
  '/slider/items/:itemId',
  verifyToken,
  verifyAdmin,
  removeSliderItem
);

export default router;
