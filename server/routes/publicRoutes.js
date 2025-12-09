import express from 'express';
import {
  getPricingPlans,
  getStripeSettings,
} from '../controllers/adminCtrl.js';
import { globalSearch } from '../controllers/searchCtrl.js';

const router = express.Router();

// Public endpoint - no authentication required
// This allows anyone to view pricing plans
router.get('/pricing-plans', getPricingPlans);

// Public endpoint - no authentication required
// This allows anyone to view Stripe publishable keys for payments
router.get('/stripe-settings', getStripeSettings);

// Public endpoint - search users and posts
router.get('/search', globalSearch);

export default router;
