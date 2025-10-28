import express from 'express';
import {
  createFilmPaymentIntent,
  createSubscriptionPaymentIntent,
  activateSubscription,
  verifyPayment,
} from '../controllers/paymentCtrl.js';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

// Create payment intent for film purchase
router.post('/create-payment-intent', verifyToken, createFilmPaymentIntent);

// Create payment intent for subscription
router.post(
  '/create-subscription-payment-intent',
  verifyToken,
  createSubscriptionPaymentIntent
);

// Activate subscription after successful payment
router.post('/activate-subscription', verifyToken, activateSubscription);

// Verify payment (optional - for additional security)
router.post('/verify-payment', verifyToken, verifyPayment);

export default router;
