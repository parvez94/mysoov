import express from 'express';
import {
  getFrontpageSettings,
  updateFrontpageSettings,
  addSliderItem,
  removeSliderItem,
  updateSliderItem,
  addBannerItem,
  removeBannerItem,
  updateBannerItem,
  submitCode,
  submitHireForm,
} from '../controllers/frontpageCtrl.js';
import { verifyToken } from '../utils/verifyToken.js';
import { verifyAdmin } from '../middlewares/adminAuth.js';

const router = express.Router();

// Public routes
router.get('/settings', getFrontpageSettings);
router.post('/submit-code', submitCode);
router.post('/hire-form', submitHireForm);

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
router.post('/banner/items', verifyToken, verifyAdmin, addBannerItem);
router.put('/banner/items/:itemId', verifyToken, verifyAdmin, updateBannerItem);
router.delete(
  '/banner/items/:itemId',
  verifyToken,
  verifyAdmin,
  removeBannerItem
);

export default router;
