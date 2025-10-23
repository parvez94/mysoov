# Stripe Payment Setup Guide

## Overview

Full Stripe payment integration has been added to the admin dashboard settings. Admins can now configure Stripe to accept payments for films and premium content.

## Features Implemented

### Backend (Server)

1. **Settings Model** (`/server/models/Settings.js`)

   - Added `stripeConfig` field with:
     - `enabled`: Boolean to enable/disable Stripe
     - `mode`: 'test' or 'live' payment mode
     - `testPublishableKey`: Stripe test publishable key
     - `testSecretKey`: Stripe test secret key (encrypted storage recommended)
     - `livePublishableKey`: Stripe live publishable key
     - `liveSecretKey`: Stripe live secret key (encrypted storage recommended)
     - `webhookSecret`: Webhook signing secret
     - `currency`: Default currency (USD, EUR, GBP, etc.)

2. **Admin Controllers** (`/server/controllers/adminCtrl.js`)

   - `getStripeSettings`: Fetch current Stripe configuration
     - Securely returns keys without exposing secret keys
     - Only indicates if secret keys are set
   - `updateStripeSettings`: Update Stripe configuration
     - Preserves existing secret keys if not provided
     - Validates configuration

3. **Admin Routes** (`/server/routes/adminRoutes.js`)
   - `GET /api/v1/admin/stripe-settings`: Get Stripe config
   - `PUT /api/v1/admin/stripe-settings`: Update Stripe config

### Frontend (Client)

1. **Dashboard Settings** (`/client/src/pages/dashboard/DashboardSettings.jsx`)
   - Complete Stripe settings UI section
   - Features:
     - **Enable/Disable Toggle**: Turn Stripe payments on/off
     - **Payment Mode Selector**: Switch between Test and Live modes
     - **Currency Selector**: Support for 7 major currencies
     - **Test Mode API Keys**: Separate fields for test credentials
     - **Live Mode API Keys**: Separate fields for production credentials
     - **Webhook Secret**: Optional webhook signing secret
     - **Show/Hide Toggles**: For secret keys (password fields)
     - **Setup Instructions**: Step-by-step guide with links
     - **Visual Indicators**: Color-coded sections (yellow for test, red for live)

## Admin Usage

### Accessing Stripe Settings

1. Log in as an admin
2. Navigate to **Dashboard** → **Settings**
3. Scroll to the **💳 Stripe Payment Settings** section

### Configuration Steps

#### 1. Get Stripe API Keys

1. Create a Stripe account at [stripe.com](https://dashboard.stripe.com/register)
2. Get your API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
3. You'll need:
   - Publishable Key (starts with `pk_test_` or `pk_live_`)
   - Secret Key (starts with `sk_test_` or `sk_live_`)

#### 2. Configure Test Mode (Recommended First)

1. Toggle **Enable Stripe Payments** ON
2. Select **Test Mode** from Payment Mode dropdown
3. Enter your **Test Publishable Key** (`pk_test_...`)
4. Enter your **Test Secret Key** (`sk_test_...`)
5. Select your preferred **Currency**
6. Click **Save Stripe Settings**

#### 3. Test Payments

Use these test cards:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- Use any future expiry date and any 3-digit CVC

#### 4. Configure Live Mode (Production)

⚠️ **Warning**: Live mode processes real payments!

1. Select **Live Mode** from Payment Mode dropdown
2. Enter your **Live Publishable Key** (`pk_live_...`)
3. Enter your **Live Secret Key** (`sk_live_...`)
4. Click **Save Stripe Settings**

#### 5. Set Up Webhooks (Optional but Recommended)

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Create a new webhook endpoint pointing to your server
3. Copy the **Webhook Signing Secret** (`whsec_...`)
4. Paste it in the **Webhook Signing Secret** field
5. Save settings

## Security Features

### Backend Security

- ✅ Secret keys are never returned to frontend
- ✅ Only `hasTestSecretKey` and `hasLiveSecretKey` flags are returned
- ✅ Empty secret key fields preserve existing keys
- ✅ All routes protected by admin authentication

### Frontend Security

- ✅ Secret keys displayed as password fields
- ✅ Show/Hide toggles for controlled viewing
- ✅ Placeholder text shows if key is already set
- ✅ Clear warnings for live mode keys

## API Reference

### Get Stripe Settings

```http
GET /api/v1/admin/stripe-settings
Authorization: Required (Admin only)
```

**Response:**

```json
{
  "success": true,
  "stripeConfig": {
    "enabled": false,
    "mode": "test",
    "currency": "usd",
    "testPublishableKey": "pk_test_...",
    "livePublishableKey": "pk_live_...",
    "webhookSecret": "whsec_...",
    "hasTestSecretKey": true,
    "hasLiveSecretKey": false
  }
}
```

### Update Stripe Settings

```http
PUT /api/v1/admin/stripe-settings
Authorization: Required (Admin only)
Content-Type: application/json
```

**Request Body:**

```json
{
  "stripeConfig": {
    "enabled": true,
    "mode": "test",
    "currency": "usd",
    "testPublishableKey": "pk_test_...",
    "testSecretKey": "sk_test_...",
    "livePublishableKey": "pk_live_...",
    "liveSecretKey": "sk_live_...",
    "webhookSecret": "whsec_..."
  }
}
```

**Notes:**

- Secret keys are optional in updates
- Empty/missing secret keys preserve existing values
- All fields except secret keys can be updated independently

## Next Steps for Payment Integration

### 1. Install Stripe SDK

```bash
npm install stripe @stripe/stripe-js
```

### 2. Create Payment API Endpoint

Create `/server/routes/paymentRoutes.js`:

```javascript
import Stripe from 'stripe';
import Settings from '../models/Settings.js';

// Create payment intent
export const createPaymentIntent = async (req, res) => {
  const settings = await Settings.findOne();
  const config = settings.stripeConfig;

  // Use appropriate key based on mode
  const secretKey =
    config.mode === 'test' ? config.testSecretKey : config.liveSecretKey;

  const stripe = new Stripe(secretKey);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: config.currency,
    metadata: { filmId: req.body.filmId },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
};
```

### 3. Update Payment Page

The existing `/client/src/pages/Payment.jsx` can now fetch Stripe config and initialize Stripe:

```javascript
import { loadStripe } from '@stripe/stripe-js';

// Fetch Stripe config from settings
const { data } = await axios.get('/api/v1/admin/stripe-settings');
const config = data.stripeConfig;

// Initialize Stripe with appropriate key
const publishableKey =
  config.mode === 'test'
    ? config.testPublishableKey
    : config.livePublishableKey;

const stripe = await loadStripe(publishableKey);
```

## Supported Currencies

- 🇺🇸 USD - US Dollar
- 🇪🇺 EUR - Euro
- 🇬🇧 GBP - British Pound
- 🇨🇦 CAD - Canadian Dollar
- 🇦🇺 AUD - Australian Dollar
- 🇮🇳 INR - Indian Rupee
- 🇯🇵 JPY - Japanese Yen

## Troubleshooting

### Keys Not Saving

- Ensure you're logged in as admin
- Check browser console for errors
- Verify API keys format (pk_test/pk_live, sk_test/sk_live)

### Test Payments Not Working

- Confirm you're in Test Mode
- Use official test cards: 4242 4242 4242 4242
- Check Stripe Dashboard for any API errors

### Webhooks Failing

- Verify webhook endpoint is publicly accessible
- Ensure webhook secret matches Stripe dashboard
- Check webhook logs in Stripe Dashboard

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Test Cards](https://stripe.com/docs/testing)
- [Webhook Guide](https://stripe.com/docs/webhooks)
- [API Reference](https://stripe.com/docs/api)

---

**Status**: ✅ Stripe settings UI and backend complete
**Next**: Integrate Stripe Elements in payment flow
