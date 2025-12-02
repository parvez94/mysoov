# Facebook Data Deletion Setup Guide

This guide explains how to configure Facebook's data deletion requirement for your Mysoov app.

## What Facebook Requires

Facebook requires all apps that access user data to provide a way for users to request deletion of their data. You must provide **either**:

1. A **Data Deletion Callback URL** - An endpoint Facebook calls when users request deletion
2. **Data Deletion Instructions URL** - A page explaining how users can delete their data

## What We've Implemented

✅ **Data Deletion Instructions Page**: `https://mysoov.tv/data-deletion`
✅ **Data Deletion Callback Endpoint**: `https://api.mysoov.tv/api/v1/data/facebook-data-deletion`

## Setup Steps

### 1. Add Facebook App Secret to Environment Variables

Add this to your `.env` file:

```env
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
CLIENT_URL=https://mysoov.tv
```

**How to get your Facebook App Secret:**
- Go to [Facebook Developers](https://developers.facebook.com)
- Select your app
- Go to Settings > Basic
- Copy the "App Secret" value

### 2. Configure Facebook App Settings

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Select your Mysoov app
3. Go to **Settings** > **Basic**
4. Scroll down to **Data Deletion Instructions URL**
5. Choose one option:

#### Option A: Use the Data Deletion Callback (Recommended)
Enter this URL:
```
https://api.mysoov.tv/api/v1/data/facebook-data-deletion
```

#### Option B: Use the Instructions Page
Enter this URL:
```
https://mysoov.tv/data-deletion
```

6. Click **Save Changes**

## How It Works

### For Users:
1. Users can visit `/data-deletion` to see instructions
2. They can delete their account through account settings
3. Or they can email privacy@mysoov.com

### For Facebook Callback:
1. When a user requests data deletion through Facebook
2. Facebook sends a signed request to your callback endpoint
3. Your endpoint verifies the request and returns a confirmation code
4. The deletion is processed according to your privacy policy

## Testing the Endpoints

### Test the Instructions Page:
```bash
# Production
curl https://mysoov.tv/data-deletion

# Local
curl http://localhost:5173/data-deletion
```

### Test the Callback Endpoint:
```bash
# Production
curl -X POST https://api.mysoov.tv/api/v1/data/facebook-data-deletion \
  -H "Content-Type: application/json" \
  -d '{"signed_request": "test_request"}'

# Local
curl -X POST http://localhost:5100/api/v1/data/facebook-data-deletion \
  -H "Content-Type: application/json" \
  -d '{"signed_request": "test_request"}'
```

## Important Notes

- ⚠️ **Security**: Never expose your Facebook App Secret in client-side code
- 📝 **Compliance**: Process deletion requests within 30 days as stated in your privacy policy
- 🔒 **Verification**: The callback endpoint verifies Facebook's signature before processing
- 📧 **Confirmation**: Users receive a confirmation code and status URL

## Privacy Policy

A privacy policy page has also been created at `/privacy-policy` that includes:
- Data collection practices
- How data is used
- User rights including deletion
- Contact information

## Support

If users have questions about data deletion, direct them to:
- **Email**: privacy@mysoov.com
- **Page**: https://mysoov.tv/data-deletion
- **Privacy Policy**: https://mysoov.tv/privacy-policy
