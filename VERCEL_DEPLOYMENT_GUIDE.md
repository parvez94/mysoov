# Vercel Deployment Guide - Fix "Database service temporarily unavailable"

## Problem

Your Vercel deployment shows "Database service temporarily unavailable" because environment variables are not configured in Vercel.

---

## Solution Steps

### 1. Configure Environment Variables in Vercel

#### For Backend Project:

1. Go to [vercel.com](https://vercel.com) and log in
2. Select your **backend project** (e.g., mysoov-backend)
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

**Required Variables:**

```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
SECRET_KEY=your_secret_key_here
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API=your_cloudinary_api_key
CLOUD_SECRET=your_cloudinary_api_secret
NODE_ENV=production
```

**Optional (for YouTube integration):**

```
YOUTUBE_CLIENT_ID=your_youtube_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-your_youtube_client_secret
YOUTUBE_REDIRECT_URI=https://your-backend-domain.vercel.app/api/v1/youtube/oauth2callback
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token
```

**Important Notes:**

- Get these values from your local `/server/.env` file
- Set environment to **Production** (and optionally Preview/Development)
- Never commit `.env` files to Git

---

### 2. Configure MongoDB Atlas for Vercel

Vercel uses dynamic IP addresses, so you need to allow all IPs in MongoDB Atlas:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster
3. Click **Network Access** (left sidebar)
4. Click **Add IP Address**
5. Click **Allow Access from Anywhere** (or add `0.0.0.0/0`)
6. Click **Confirm**

**Security Note:** This is safe because:

- Your database still requires username/password authentication
- The connection string in Vercel is encrypted
- Only your Vercel app has access to the environment variables

---

### 3. Update Frontend Environment Variables

#### For Frontend Project:

1. Go to your **frontend project** in Vercel
2. Go to **Settings** → **Environment Variables**
3. Add:

```
VITE_API_URL=https://your-backend-domain.vercel.app
```

Make sure this matches your actual backend URL.

---

### 4. Redeploy Both Projects

After adding environment variables:

**Option A: Trigger Redeploy via Git**

```bash
git add .
git commit -m "Update environment configuration"
git push
```

**Option B: Manual Redeploy in Vercel**

1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Check "Use existing Build Cache" (optional)
5. Click **Redeploy**

---

### 5. Verify Deployment

#### Check Backend Logs:

1. Go to your backend project in Vercel
2. Click on the latest deployment
3. Click **Functions** tab
4. Click on any function to see logs
5. Look for:
   - ✅ "MongoDB connected successfully (production)"
   - ✅ "Environment check: { hasMongoUrl: true, ... }"

#### Test Database Connection:

Visit: `https://your-backend-domain.vercel.app/api/test-db`

Should return:

```json
{
  "success": true,
  "message": "Database connection successful",
  "videoCount": 0,
  "timestamp": "2024-..."
}
```

#### Test Frontend:

1. Visit your frontend URL
2. Try to register/login
3. Check if posts are loading

---

## Common Issues & Solutions

### Issue 1: Still showing "Database service temporarily unavailable"

**Solution:**

- Check Vercel logs for the actual error
- Verify `MONGO_URL` is correctly set in Vercel
- Ensure MongoDB Atlas allows connections from `0.0.0.0/0`
- Check if your MongoDB cluster is active (not paused)

### Issue 2: "MONGO_URL environment variable is not set"

**Solution:**

- Environment variables were not added to Vercel
- Follow Step 1 above
- Make sure to redeploy after adding variables

### Issue 3: "Authentication failed"

**Solution:**

- Check username/password in `MONGO_URL`
- Verify database user exists in MongoDB Atlas
- Ensure user has read/write permissions

### Issue 4: "Connection timeout"

**Solution:**

- Check MongoDB Atlas Network Access settings
- Ensure `0.0.0.0/0` is whitelisted
- Verify your cluster is not paused

### Issue 5: CORS errors

**Solution:**

- Verify frontend URL is correct in backend CORS settings
- Check `vercel.json` has correct frontend URL
- Ensure both projects are deployed

---

## Debugging Commands

### Check Environment Variables in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Verify all required variables are present
3. Check they're set for "Production" environment

### View Deployment Logs:

1. Go to **Deployments** tab
2. Click on latest deployment
3. Click **Functions** tab
4. Click on any function to see real-time logs

### Test API Endpoints:

```bash
# Test database connection
curl https://your-backend-domain.vercel.app/api/test-db

# Test health check
curl https://your-backend-domain.vercel.app/api/health

# Test auth endpoint
curl https://your-backend-domain.vercel.app/api/test-auth
```

---

## Environment Variables Checklist

### Backend (Required):

- [ ] `MONGO_URL` - MongoDB connection string
- [ ] `SECRET_KEY` - JWT secret key
- [ ] `CLOUD_NAME` - Cloudinary cloud name
- [ ] `CLOUD_API` - Cloudinary API key
- [ ] `CLOUD_SECRET` - Cloudinary API secret
- [ ] `NODE_ENV` - Set to "production"

### Backend (Optional):

- [ ] `YOUTUBE_CLIENT_ID`
- [ ] `YOUTUBE_CLIENT_SECRET`
- [ ] `YOUTUBE_REDIRECT_URI` (update to production URL)
- [ ] `YOUTUBE_REFRESH_TOKEN`

### Frontend (Required):

- [ ] `VITE_API_URL` - Backend URL

### MongoDB Atlas:

- [ ] Network Access allows `0.0.0.0/0`
- [ ] Database user exists with correct password
- [ ] Cluster is active (not paused)

---

## After Deployment

Once everything is working:

1. ✅ Test login/register functionality
2. ✅ Test creating posts
3. ✅ Test uploading images
4. ✅ Test uploading videos
5. ✅ Test YouTube integration (if enabled)
6. ✅ Check all pages load correctly
7. ✅ Verify no console errors

---

## Need Help?

If you're still experiencing issues:

1. Check Vercel function logs for specific errors
2. Test the `/api/test-db` endpoint
3. Verify MongoDB Atlas connection settings
4. Ensure all environment variables are correctly set
5. Try redeploying after making changes

---

**Last Updated:** 2024
**Status:** Deployment Guide
