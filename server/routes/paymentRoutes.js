import express from 'express';
import {
  createFilmPaymentIntent,
  verifyPayment,
} from '../controllers/paymentCtrl.js';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

// Create payment intent for film purchase
router.post('/create-payment-intent', verifyToken, createFilmPaymentIntent);

// Verify payment (optional - for additional security)
router.post('/verify-payment', verifyToken, verifyPayment);

export default router;
