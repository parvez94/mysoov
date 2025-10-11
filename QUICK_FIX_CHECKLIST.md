# Quick Fix Checklist - Vercel Database Error

## The Problem

❌ "Database service temporarily unavailable" on Vercel
❌ Can't login, register, or see posts

## Root Cause

Your environment variables (especially `MONGO_URL`) are not configured in Vercel.

---

## Quick Fix (5 minutes)

### Step 1: Add Environment Variables to Vercel Backend

1. Go to https://vercel.com → Your backend project
2. **Settings** → **Environment Variables**
3. Add these (copy from your local `/server/.env` file):

```
MONGO_URL=mongodb+srv://...
SECRET_KEY=...
CLOUD_NAME=...
CLOUD_API=...
CLOUD_SECRET=...
NODE_ENV=production
```

4. Set environment to **Production**
5. Click **Save**

### Step 2: Configure MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. **Network Access** → **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

### Step 3: Redeploy

**Option A:** Push a new commit

```bash
git add .
git commit -m "Fix environment variables"
git push
```

**Option B:** Manual redeploy in Vercel

- Go to **Deployments** → Click (...) → **Redeploy**

### Step 4: Verify

Visit: `https://your-backend-domain.vercel.app/api/test-db`

Should see:

```json
{
  "success": true,
  "message": "Database connection successful"
}
```

---

## If Still Not Working

Check Vercel logs:

1. Go to your backend project
2. **Deployments** → Latest deployment
3. **Functions** tab → Click any function
4. Look for error messages

Common errors:

- "MONGO_URL environment variable is not set" → Add it in Vercel
- "Authentication failed" → Check MongoDB username/password
- "Connection timeout" → Check MongoDB Network Access

---

## Need More Details?

See `VERCEL_DEPLOYMENT_GUIDE.md` for complete instructions.
