# 🚀 Mysoov VPS Migration - Complete Guide

## 📌 START HERE

Your Mysoov app has been **fully migrated** from Vercel serverless to VPS hosting!

All Vercel-specific code has been removed, and your app is now ready to run on your OVH Linux VPS.

---

## ✅ What Has Been Fixed

### 1. **All Vercel URLs Removed**

- ❌ `https://mysoov-frontend.vercel.app`
- ❌ `https://mysoov-backend.vercel.app`
- ✅ Replaced with `https://mysoov.tv` and dynamic origin detection

### 2. **Files Modified**

- `server/routes/uploadRoutes.js` - Fixed CORS headers
- `server/routes/videoRoutes.js` - Fixed CORS headers
- `client/api/video-meta.js` - Updated backend URL
- `server/.env` - Added production variables
- `ecosystem.config.js` - Updated VPS path

### 3. **New Files Created**

- `nginx-vps.conf` - Complete nginx configuration
- `deploy.sh` - Automated deployment script
- `server/.env.production` - Production environment template
- Multiple documentation files (see below)

---

## 📚 Documentation Guide

Your project now has comprehensive documentation. **Read them in this order:**

### 1. **Quick Deploy Checklist** ⭐ START HERE

📄 `QUICK_DEPLOY_CHECKLIST.md`

**Purpose:** Step-by-step deployment checklist with checkbox format

**Read this if:** You want a straightforward checklist to follow during deployment

**Time:** 30-60 minutes to complete

---

### 2. **VPS Complete Setup Guide**

📄 `VPS_COMPLETE_SETUP.md`

**Purpose:** Detailed installation and setup instructions

**Read this if:** You need detailed explanations for each step

**Covers:**

- Prerequisites
- 8-step installation process
- Verification procedures
- Troubleshooting guide
- Deployment workflow
- Monitoring & security

**Time:** 1-2 hours for first-time setup

---

### 3. **VPS Fixes Summary**

📄 `VPS_FIXES_SUMMARY.md`

**Purpose:** Overview of all changes made to your code

**Read this if:** You want to understand what was changed and why

**Covers:**

- List of modified files
- New files created
- Quick start commands
- Common issues and fixes
- Monitoring commands

**Time:** 10-15 minutes

---

### 4. **Client API Migration Guide**

📄 `CLIENT_API_MIGRATION.md`

**Purpose:** Explains the Vercel serverless function issue and solution

**Read this if:** You want to understand how social media sharing works on VPS

**Covers:**

- Why `client/api/video-meta.js` won't work on VPS
- How nginx handles crawler detection instead
- Testing procedures for social sharing
- Troubleshooting social media previews

**Time:** 15-20 minutes

---

### 5. **Configuration Files**

#### Nginx Configuration

📄 `nginx-vps.conf`

- Complete nginx setup for frontend and backend
- SSL configuration
- Crawler detection for social media
- Security headers and gzip compression

#### PM2 Configuration

📄 `ecosystem.config.js`

- Process manager configuration
- Cluster mode setup (2 instances)
- Auto-restart and logging config

#### Environment Template

📄 `server/.env.production`

- Complete environment variables template
- Replace with your actual credentials

#### Deployment Script

📄 `deploy.sh`

- Automated deployment script
- Handles git pull, build, and restart
- Make executable: `chmod +x deploy.sh`

---

### 6. **Existing Documentation** (Already in your project)

📄 `VPS_MIGRATION_GUIDE.md` - Original migration guide

📄 `VPS_CHANGES_SUMMARY.md` - Technical details of changes

📄 `DEPLOYMENT_CHECKLIST.md` - Original deployment checklist

---

## 🎯 Quick Start (TL;DR)

If you're experienced with Linux and want to deploy quickly:

```bash
# On VPS
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2

cd /var/www
git clone [your-repo] mysoov
cd mysoov

# Backend
cd server
npm install
cp .env.production .env
nano .env  # Update with credentials
mkdir -p ../logs tmp

# Frontend
cd ../client
npm install
npm run build

# Nginx
sudo cp ../nginx-vps.conf /etc/nginx/sites-available/mysoov.tv
sudo ln -s /etc/nginx/sites-available/mysoov.tv /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t

# SSL
sudo systemctl stop nginx
sudo certbot certonly --standalone -d mysoov.tv -d www.mysoov.tv
sudo systemctl start nginx

# Start app
cd ..
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # Run the command it outputs

# Firewall
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw enable

# Verify
pm2 logs mysoov-api
curl https://mysoov.tv/api
```

**For detailed explanations, use the checklist!**

---

## 🔍 Choose Your Path

### Path A: First-Time VPS User

1. Read `VPS_COMPLETE_SETUP.md` for detailed explanations
2. Use `QUICK_DEPLOY_CHECKLIST.md` as you deploy
3. Refer to `VPS_FIXES_SUMMARY.md` for troubleshooting

### Path B: Experienced VPS User

1. Use `QUICK_DEPLOY_CHECKLIST.md` directly
2. Skim `VPS_FIXES_SUMMARY.md` for quick reference
3. Review `CLIENT_API_MIGRATION.md` for social sharing setup

### Path C: Just Want to Understand Changes

1. Read `VPS_FIXES_SUMMARY.md` first
2. Review modified files in your code editor
3. Check `CLIENT_API_MIGRATION.md` for serverless function migration

---

## ⚠️ Important Notes

### 1. Vercel Serverless Function Won't Work

The file `client/api/video-meta.js` is Vercel-specific and won't run on VPS. Don't worry - nginx handles this instead! See `CLIENT_API_MIGRATION.md` for details.

### 2. Environment Variables Are Critical

You MUST update these in `server/.env` on your VPS:

- `MONGO_URL` - Your MongoDB connection string
- `SECRET_KEY` - Generate a secure random string
- `CLOUD_NAME`, `CLOUD_API`, `CLOUD_SECRET` - Cloudinary credentials
- `FRONTEND_URL=https://mysoov.tv`
- `NODE_ENV=production`

### 3. MongoDB Atlas IP Whitelist

Add your VPS IP address to MongoDB Atlas Network Access, or your database connection will fail!

### 4. SSL Certificate Required

Modern browsers require HTTPS. The guide includes Let's Encrypt SSL setup (free).

### 5. PM2 is Your Friend

PM2 manages your Node.js app, handles crashes, and provides logging. Learn the basic commands!

---

## 🆘 Troubleshooting Quick Reference

### "502 Bad Gateway"

```bash
pm2 restart mysoov-api
pm2 logs mysoov-api --err
```

### "CORS Error"

Check `allowedOrigins` includes your domain in:

- `server/index.js`
- `server/routes/uploadRoutes.js`
- `server/routes/videoRoutes.js`

### "Database Connection Failed"

1. Check MongoDB Atlas IP whitelist
2. Verify `MONGO_URL` in `.env`
3. Test: `curl https://mysoov.tv/api/test-db`

### Upload Fails

```bash
mkdir -p /var/www/mysoov/server/tmp
chmod 755 /var/www/mysoov/server/tmp
pm2 restart mysoov-api
```

### Social Sharing Doesn't Work

1. Check nginx has crawler detection
2. Test with Facebook Debugger: https://developers.facebook.com/tools/debug/
3. See `CLIENT_API_MIGRATION.md` for detailed guide

**For more troubleshooting, see `VPS_COMPLETE_SETUP.md`**

---

## 📊 Architecture Overview

### Before (Vercel)

```
User → Vercel Serverless Functions
     → Vercel Edge Network
     → MongoDB Atlas
     → Cloudinary
```

### After (VPS)

```
User → Nginx (reverse proxy)
     → React SPA (for regular users)
     → Node.js + PM2 (for API requests)
     → MongoDB Atlas
     → Cloudinary

Social Media Crawler → Nginx (detects user agent)
                     → Node.js (returns HTML with meta tags)
```

---

## 🎯 Deployment Success Criteria

Your deployment is successful when:

- [ ] `https://mysoov.tv` loads your React app
- [ ] `https://mysoov.tv/api` returns JSON with `success: true`
- [ ] Users can register, login, and upload content
- [ ] PM2 shows "online" status: `pm2 list`
- [ ] Sharing a post URL shows correct preview on Facebook/WhatsApp
- [ ] SSL certificate is valid (green lock in browser)
- [ ] App auto-restarts on crash: `pm2 restart mysoov-api`
- [ ] App starts on VPS reboot: `sudo reboot` then check `pm2 list`

---

## 🔄 Future Updates

When you need to deploy code changes:

### Option 1: Manual

```bash
cd /var/www/mysoov
git pull origin main
cd server && npm install
cd ../client && npm install && npm run build
cd ..
pm2 reload mysoov-api
```

### Option 2: Automated Script

```bash
/var/www/mysoov/deploy.sh
```

---

## 📞 Support Resources

### Documentation Files

- `QUICK_DEPLOY_CHECKLIST.md` - Step-by-step deployment
- `VPS_COMPLETE_SETUP.md` - Detailed guide with troubleshooting
- `VPS_FIXES_SUMMARY.md` - Overview of changes
- `CLIENT_API_MIGRATION.md` - Social sharing guide

### External Resources

- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start/
- Nginx Documentation: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/getting-started/
- MongoDB Atlas: https://docs.atlas.mongodb.com/

### Useful Commands

```bash
# PM2
pm2 logs mysoov-api          # View logs
pm2 monit                     # Monitor resources
pm2 restart mysoov-api        # Restart app

# Nginx
sudo nginx -t                 # Test config
sudo systemctl reload nginx   # Reload config
sudo tail -f /var/log/nginx/error.log  # View errors

# System
df -h                         # Disk space
free -h                       # Memory usage
top                           # CPU usage
```

---

## ✅ Final Checklist

Before you start deployment:

- [ ] You have SSH access to your VPS
- [ ] Your domain (mysoov.tv) points to VPS IP
- [ ] You have MongoDB connection string
- [ ] You have Cloudinary credentials
- [ ] You've read `QUICK_DEPLOY_CHECKLIST.md`
- [ ] You've opened `VPS_COMPLETE_SETUP.md` for reference
- [ ] You're ready to spend 1-2 hours on initial setup

---

## 🎉 You're Ready!

Everything is prepared for your VPS deployment. Choose your documentation path above and get started!

**Good luck! 🚀**

---

## 📝 Notes

- **Time Required:** 1-2 hours for first-time deployment
- **Difficulty:** Intermediate (requires basic Linux knowledge)
- **Cost:** VPS hosting fee + domain (no Vercel fees)
- **Benefits:** Full control, no cold starts, better performance
- **Maintenance:** Manual updates, monitoring required

---

## 🔖 Quick Links

| Document                    | Purpose              | When to Read            |
| --------------------------- | -------------------- | ----------------------- |
| `README_VPS_MIGRATION.md`   | This file - overview | Start here              |
| `QUICK_DEPLOY_CHECKLIST.md` | Deployment checklist | During deployment       |
| `VPS_COMPLETE_SETUP.md`     | Detailed setup guide | Need detailed steps     |
| `VPS_FIXES_SUMMARY.md`      | Changes overview     | Understand what changed |
| `CLIENT_API_MIGRATION.md`   | Social sharing guide | Social media issues     |
| `nginx-vps.conf`            | Nginx config         | Copy to VPS             |
| `deploy.sh`                 | Deployment script    | Future updates          |
| `server/.env.production`    | Env template         | Set up environment      |

---

**Last Updated:** $(date)

**Migration Status:** ✅ Complete - Ready for Deployment

**Next Step:** Open `QUICK_DEPLOY_CHECKLIST.md` and start deploying!
