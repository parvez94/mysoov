# Stripe Payment Testing Guide

## ✅ What Was Implemented

Full Stripe payment integration for film purchases with secure card processing.

### Backend (Server)

- **Payment Controller** (`/server/controllers/paymentCtrl.js`)
  - `createFilmPaymentIntent`: Creates Stripe payment intent with film metadata
  - `verifyPayment`: Optional payment verification endpoint
- **Payment Routes** (`/server/routes/paymentRoutes.js`)
  - `POST /api/v1/payment/create-payment-intent`
  - `POST /api/v1/payment/verify-payment`
- **Updated Purchase Flow** (`/server/controllers/filmCtrl.js`)
  - Auto-adds film to profile on purchase (no pre-add required)
  - Returns download URL for automatic download

### Frontend (Client)

- **Stripe Integration** (`/client/src/pages/Payment.jsx`)
  - Stripe Elements with card input
  - Secure payment form with real-time validation
  - Three-step payment flow:
    1. Create payment intent
    2. Process card payment
    3. Complete purchase and download

## 🔧 Setup Instructions

### 1. Configure Stripe Settings (Admin Dashboard)

1. Login as admin
2. Go to **Dashboard** → **Settings** → **Stripe Payment Settings**
3. **Enable Stripe Payments** (toggle ON)
4. Select **Test Mode**
5. Enter your Stripe API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys):
   - **Test Publishable Key** (starts with `pk_test_...`)
   - **Test Secret Key** (starts with `sk_test_...`)
6. Select **Currency** (USD, EUR, etc.)
7. Click **Save Stripe Settings**

### 2. Get Stripe API Keys

If you don't have Stripe keys yet:

1. Sign up at [stripe.com](https://dashboard.stripe.com/register)
2. Go to [API Keys](https://dashboard.stripe.com/apikeys)
3. Copy both **Publishable key** and **Secret key** (use test mode keys first)

## 🧪 Testing the Payment Flow

### Test Card Numbers (Stripe Test Mode)

| Card Number         | Description                |
| ------------------- | -------------------------- |
| 4242 4242 4242 4242 | ✅ Payment succeeds        |
| 4000 0000 0000 0002 | ❌ Card declined           |
| 4000 0025 0000 3155 | ❌ Requires authentication |
| 4000 0000 0000 9995 | ❌ Insufficient funds      |

**Card Details:**

- **Expiry Date**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP Code**: Any 5 digits (e.g., 12345)

### Step-by-Step Test

1. **Find a Film**

   - Browse film directories
   - Click on a film with "Buy Complete Ownership" button

2. **Go to Payment Page**

   - Click "Buy Complete Ownership - $9.99"
   - You'll be redirected to payment page

3. **See Payment Form**

   - If Stripe is configured: You'll see a card input form
   - If not configured: You'll see "Contact Support" message

4. **Enter Test Card**

   - Card Number: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - ZIP: `12345`

5. **Complete Payment**
   - Click "Pay $9.99"
   - Wait for processing (payment intent → card processing → purchase)
   - Success message appears
   - Film downloads automatically
   - Redirects to your profile
   - Film now visible in your videos (without buy button)

## 🎯 Payment Flow Diagram

```
User clicks "Buy Complete Ownership"
           ↓
Payment Page loads
           ↓
Fetch Stripe config from backend
           ↓
Initialize Stripe with publishable key
           ↓
Show card input form
           ↓
User enters card details
           ↓
Click "Pay" button
           ↓
[1] Create Payment Intent (backend)
           ↓
[2] Stripe processes card payment
           ↓
[3] Complete purchase (backend)
    - Add film to user's profile
    - Mark as purchased
    - Return download URL
           ↓
[4] Auto-download starts
           ↓
[5] Redirect to profile
           ↓
✅ Film now owned by user!
```

## 🔒 Security Features

### Backend Security

- ✅ Secret keys never exposed to frontend
- ✅ Payment intent created server-side
- ✅ All endpoints require authentication
- ✅ Film metadata attached to payment
- ✅ Automatic reconciliation after payment

### Frontend Security

- ✅ Stripe Elements (PCI-compliant)
- ✅ No card details stored locally
- ✅ Secure HTTPS communication
- ✅ Real-time card validation
- ✅ Error handling for failed payments

## 🎨 UI Features

- **Secure Payment Badge**: Shows "Secure payment powered by Stripe" with lock icon
- **Real-time Validation**: Card errors shown instantly
- **Loading States**: Shows "Processing..." during payment
- **Success/Error Messages**: Clear feedback for users
- **Auto-download**: Starts immediately after payment
- **Graceful Fallbacks**: Contact support if Stripe not configured

## 🐛 Troubleshooting

### "Payment System Not Configured"

**Solution**: Admin must configure Stripe settings in dashboard

### "Failed to create payment intent"

**Possible causes:**

- Stripe keys not set or incorrect
- Wrong mode (test vs live) without matching keys
- Server can't reach Stripe API

**Solution**:

- Check Stripe settings in admin dashboard
- Verify API keys are correct
- Check server logs for detailed error

### "Card declined"

**Possible causes:**

- Using decline test card (4000 0000 0000 0002)
- Actual card issue in live mode

**Solution**:

- Use success test card in test mode
- Try different card in live mode

### Payment succeeds but no download

**Possible causes:**

- Download URL not returned from backend
- Popup blocker preventing download

**Solution**:

- Check browser popup blocker settings
- Film should still be in profile (navigate manually)

### Film already purchased but can still buy

**Possible causes:**

- `filmDirectoryId` not cleared after purchase

**Solution**:

- Check backend purchase endpoint
- Verify `filmDirectoryId` set to `null` after purchase

## 📊 Monitoring Payments

### Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Payments** to see all transactions
3. View payment details including:
   - Amount
   - Status
   - Customer info
   - Metadata (filmId, directoryId, userId)

### Test Mode vs Live Mode

- **Test Mode** (orange): Shows test transactions only
- **Live Mode** (green): Shows real transactions (💰 real money!)

Toggle between modes in Stripe Dashboard (top right).

## 🚀 Going Live

When ready for production:

1. **Get Live API Keys**

   - Go to Stripe Dashboard
   - Switch to **Live Mode** (toggle in top right)
   - Copy live keys from [API Keys](https://dashboard.stripe.com/apikeys)

2. **Update Settings**

   - Admin Dashboard → Settings → Stripe
   - Switch mode to **Live Mode**
   - Enter **Live Publishable Key** and **Live Secret Key**
   - Save settings

3. **Test with Real Card**

   - ⚠️ **WARNING**: This will charge your actual card!
   - Use a small amount film to test first
   - Verify payment appears in live Stripe dashboard

4. **Set Up Webhooks** (Recommended)
   - Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint: `https://yourdomain.com/api/v1/payment/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook signing secret to admin settings

## 💡 Tips

- Always test in test mode first
- Use Stripe Dashboard to view payment details
- Set up email notifications in Stripe for payment events
- Monitor for failed payments and refunds
- Keep test and live keys separate
- Never commit API keys to version control

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [Payment Intents API](https://stripe.com/docs/api/payment_intents)
