import express from 'express';
import { getPricingPlans } from '../controllers/adminCtrl.js';

const router = express.Router();

// Public endpoint - no authentication required
// This allows anyone to view pricing plans
router.get('/pricing-plans', getPricingPlans);

export default router;
