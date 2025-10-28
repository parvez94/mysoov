import Stripe from 'stripe';
import Settings from '../models/Settings.js';
import { createError } from '../utils/error.js';

// Create payment intent for film purchase
export const createFilmPaymentIntent = async (req, res, next) => {
  try {
    const { filmId, directoryId, amount, filmName } = req.body;
    const userId = req.user.id;

    if (!filmId || !directoryId || !amount) {
      return next(
        createError(400, 'Film ID, Directory ID, and amount are required')
      );
    }

    // Get Stripe configuration from settings
    const settings = await Settings.findOne();
    if (!settings || !settings.stripeConfig || !settings.stripeConfig.enabled) {
      return next(
        createError(
          400,
          'Payment system is not configured. Please contact support.'
        )
      );
    }

    const config = settings.stripeConfig;

    // Use appropriate secret key based on mode
    const secretKey =
      config.mode === 'test' ? config.testSecretKey : config.liveSecretKey;

    if (!secretKey) {
      return next(
        createError(
          500,
          'Payment system configuration is incomplete. Please contact support.'
        )
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(secretKey);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: config.currency || 'usd',
      metadata: {
        filmId,
        directoryId,
        userId,
        filmName: filmName || 'Film Purchase',
        type: 'film_purchase',
      },
      description: `Film Purchase: ${filmName || 'Film'}`,
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      publishableKey:
        config.mode === 'test'
          ? config.testPublishableKey
          : config.livePublishableKey,
      currency: config.currency || 'usd',
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    next(createError(500, error.message || 'Failed to create payment intent'));
  }
};

// Create payment intent for subscription
export const createSubscriptionPaymentIntent = async (req, res, next) => {
  try {
    const { planId, amount, planName } = req.body;
    const userId = req.user.id;

    if (!planId || !amount) {
      return next(createError(400, 'Plan ID and amount are required'));
    }

    // Get Stripe configuration from settings
    const settings = await Settings.findOne();
    if (!settings || !settings.stripeConfig || !settings.stripeConfig.enabled) {
      return next(
        createError(
          400,
          'Payment system is not configured. Please contact support.'
        )
      );
    }

    const config = settings.stripeConfig;

    // Use appropriate secret key based on mode
    const secretKey =
      config.mode === 'test' ? config.testSecretKey : config.liveSecretKey;

    if (!secretKey) {
      return next(
        createError(
          500,
          'Payment system configuration is incomplete. Please contact support.'
        )
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(secretKey);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: config.currency || 'usd',
      metadata: {
        planId,
        userId,
        planName: planName || `${planId} Plan`,
        type: 'subscription',
      },
      description: `Subscription: ${planName || planId}`,
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      publishableKey:
        config.mode === 'test'
          ? config.testPublishableKey
          : config.livePublishableKey,
      currency: config.currency || 'usd',
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    next(createError(500, error.message || 'Failed to create payment intent'));
  }
};

// Activate subscription after successful payment
export const activateSubscription = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    if (!planId) {
      return next(createError(400, 'Plan ID is required'));
    }

    // Import User model dynamically to avoid circular dependencies
    const User = (await import('../models/User.js')).default;

    // Update user's subscription
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'subscription.isPaid': true,
          'subscription.plan': planId,
          'subscription.startDate': new Date(),
          'subscription.endDate': new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ), // 30 days
        },
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Subscription activated successfully!',
      user,
    });
  } catch (error) {
    console.error('Subscription activation error:', error);
    next(createError(500, 'Failed to activate subscription'));
  }
};

// Verify payment status (optional - for additional security)
export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return next(createError(400, 'Payment Intent ID is required'));
    }

    // Get Stripe configuration
    const settings = await Settings.findOne();
    if (!settings || !settings.stripeConfig || !settings.stripeConfig.enabled) {
      return next(createError(400, 'Payment system is not configured'));
    }

    const config = settings.stripeConfig;
    const secretKey =
      config.mode === 'test' ? config.testSecretKey : config.liveSecretKey;

    const stripe = new Stripe(secretKey);

    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.status(200).json({
        success: true,
        verified: true,
        metadata: paymentIntent.metadata,
      });
    } else {
      res.status(200).json({
        success: true,
        verified: false,
        status: paymentIntent.status,
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    next(createError(500, 'Failed to verify payment'));
  }
};
