# Complete VPS Setup Guide for Mysoov.TV

## 🎯 Overview

This guide will help you deploy your Mysoov app from Vercel to a Linux VPS (OVH). All Vercel-specific code has been removed and replaced with VPS-compatible alternatives.

---

## 📋 Prerequisites

- Linux VPS (Ubuntu 20.04+ or Debian 11+ recommended)
- Domain pointing to your VPS IP (mysoov.tv)
- Root or sudo access
- Node.js 18+ installed
- MongoDB connection string
- Cloudinary account (for media storage)

---

## 🔧 Changes Made to Your App

### 1. **Removed Vercel-Specific URLs**

- ❌ Removed: `https://mysoov-frontend.vercel.app`
- ❌ Removed: `https://mysoov-backend.vercel.app`
- ✅ Replaced with: `https://mysoov.tv` and dynamic origin handling

**Files Updated:**

- `server/routes/uploadRoutes.js`
- `server/routes/videoRoutes.js`
- `client/api/video-meta.js`

### 2. **Updated Environment Variables**

- Created `.env.production` template for server
- Updated `.env.production` for client with correct API URL

### 3. **Client-Side Serverless Function**

The `client/api/video-meta.js` file is a Vercel serverless function that **won't work on VPS**. However, the backend already handles this with the `/video/:id` and `/post/:id` routes, so we'll use nginx to route social media crawlers correctly.

---

## 🚀 Installation Steps

### Step 1: Install Required Software on VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x or higher
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Clone Your Repository

```bash
# Navigate to web root
cd /var/www

# Clone your repository
sudo git clone https://github.com/your-username/mysoov.git
# Or upload files via SCP/SFTP

# Set permissions
sudo chown -R $USER:$USER /var/www/mysoov
cd /var/www/mysoov
```

### Step 3: Configure Backend

```bash
# Navigate to server directory
cd /var/www/mysoov/server

# Install dependencies
npm install

# Create production .env file
nano .env

# Copy and paste from .env.production template, then update:
# - MONGO_URL (your MongoDB connection string)
# - SECRET_KEY (generate a secure random string)
# - CLOUD_NAME, CLOUD_API, CLOUD_SECRET (Cloudinary credentials)
# - FRONTEND_URL=https://mysoov.tv
# - NODE_ENV=production
# - PORT=5100

# Create required directories
mkdir -p /var/www/mysoov/logs
mkdir -p /var/www/mysoov/server/tmp

# Test the server
npm start
# Press Ctrl+C after verifying it starts without errors
```

### Step 4: Configure Frontend

```bash
# Navigate to client directory
cd /var/www/mysoov/client

# Install dependencies
npm install

# Verify .env.production exists and has correct values
cat .env.production
# Should contain:
# VITE_API_URL=https://mysoov.tv
# VITE_DISABLE_SOCKET_IO=false
# VITE_FACEBOOK_APP_ID=324758342758749

# Build the frontend
npm run build

# The dist folder should now contain your production build
ls -la dist/
```

### Step 5: Configure Nginx

```bash
# Copy the nginx configuration
sudo cp /var/www/mysoov/nginx-vps.conf /etc/nginx/sites-available/mysoov.tv

# Edit the configuration if needed
sudo nano /etc/nginx/sites-available/mysoov.tv

# Update the root path in the config to:
# root /var/www/mysoov/client/dist;

# Create symlink to enable site
sudo ln -s /etc/nginx/sites-available/mysoov.tv /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

### Step 6: Get SSL Certificate

```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Get SSL certificate for your domain
sudo certbot certonly --standalone -d mysoov.tv -d www.mysoov.tv

# Follow the prompts and enter your email

# Start nginx again
sudo systemctl start nginx

# Set up auto-renewal
sudo certbot renew --dry-run

# Add cron job for auto-renewal (optional)
sudo crontab -e
# Add this line:
# 0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

### Step 7: Start Backend with PM2

```bash
# Navigate to project root
cd /var/www/mysoov

# Update ecosystem.config.js with correct path
nano ecosystem.config.js
# Update line 6: cwd: '/var/www/mysoov',

# Start the app with PM2
pm2 start ecosystem.config.js --env production

# Check status
pm2 list
pm2 logs mysoov-api

# Save PM2 process list
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the command it outputs (usually a sudo command)
```

### Step 8: Configure Firewall

```bash
# If using UFW (Ubuntu Firewall)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Check status
sudo ufw status
```

---

## ✅ Verification

### 1. Test Backend API

```bash
# Test from VPS
curl http://localhost:5100/

# Test from outside
curl https://mysoov.tv/api

# Test database connection
curl https://mysoov.tv/api/test-db

# Test authentication
curl https://mysoov.tv/api/test-auth
```

### 2. Test Frontend

Open your browser and navigate to:

- `https://mysoov.tv` - Should load your app
- `https://www.mysoov.tv` - Should also work

### 3. Test Social Sharing

Share a post URL on Facebook, WhatsApp, or Twitter:

- `https://mysoov.tv/post/[video_id]`

The preview should show the correct title, description, and thumbnail.

### 4. Check PM2 Status

```bash
pm2 list              # View running processes
pm2 monit             # Monitor CPU/Memory in real-time
pm2 logs mysoov-api   # View logs
```

---

## 🔍 Troubleshooting

### Issue: "502 Bad Gateway" Error

**Cause:** Backend is not running or not listening on port 5100

**Fix:**

```bash
# Check if backend is running
pm2 list

# Check backend logs
pm2 logs mysoov-api

# Restart backend
pm2 restart mysoov-api

# Check if port 5100 is listening
sudo netstat -tlnp | grep 5100
```

### Issue: "CORS Error" in Browser Console

**Cause:** Origin not allowed in CORS configuration

**Fix:**

```bash
# Edit server/index.js and ensure your domain is in allowedOrigins array
nano /var/www/mysoov/server/index.js
# Lines 23-30 should include 'https://mysoov.tv'

# Restart backend
pm2 restart mysoov-api
```

### Issue: Upload Fails

**Cause:** Temp directory doesn't exist or has wrong permissions

**Fix:**

```bash
# Create temp directory
mkdir -p /var/www/mysoov/server/tmp

# Set permissions
chmod 755 /var/www/mysoov/server/tmp

# Restart backend
pm2 restart mysoov-api
```

### Issue: Database Connection Failed

**Cause:** MongoDB connection string incorrect or VPS IP not whitelisted

**Fix:**

1. Check `.env` file has correct `MONGO_URL`
2. In MongoDB Atlas, add VPS IP to whitelist:
   - Go to Network Access
   - Click "Add IP Address"
   - Add your VPS public IP (or 0.0.0.0/0 for all IPs - not recommended for production)

### Issue: SSL Certificate Error

**Cause:** Certificate not properly installed or expired

**Fix:**

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Reload nginx
sudo systemctl reload nginx
```

### Issue: Social Media Preview Not Working

**Cause:** Nginx not routing crawlers to backend

**Fix:**

1. Check nginx configuration has the crawler detection logic
2. Test with Facebook Debugger: https://developers.facebook.com/tools/debug/
3. Check backend logs: `pm2 logs mysoov-api`
4. Verify the `/post/:id` route returns HTML with meta tags

---

## 🔄 Deployment Workflow

### Update Your App

```bash
# On VPS
cd /var/www/mysoov

# Pull latest changes
git pull origin main

# Update backend
cd server
npm install
pm2 restart mysoov-api

# Update frontend
cd ../client
npm install
npm run build

# Reload nginx (if config changed)
sudo systemctl reload nginx
```

### Automated Deployment (Optional)

Create a deployment script:

```bash
nano /var/www/mysoov/deploy.sh
```

```bash
#!/bin/bash
cd /var/www/mysoov

echo "Pulling latest changes..."
git pull origin main

echo "Updating backend..."
cd server
npm install
pm2 restart mysoov-api

echo "Updating frontend..."
cd ../client
npm install
npm run build

echo "✅ Deployment complete!"
pm2 list
```

Make it executable:

```bash
chmod +x /var/www/mysoov/deploy.sh
```

Run deployment:

```bash
/var/www/mysoov/deploy.sh
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs mysoov-api --lines 100

# Check for errors
pm2 logs mysoov-api --err

# View resource usage
pm2 describe mysoov-api
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### System Resources

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check temp file accumulation
ls -lah /var/www/mysoov/server/tmp/
```

### Cleanup Old Temp Files (Cron Job)

```bash
# Edit crontab
crontab -e

# Add this line to clean files older than 24 hours, daily at 3 AM
0 3 * * * find /var/www/mysoov/server/tmp -type f -mtime +1 -delete
```

---

## 🛡️ Security Best Practices

1. **Keep Software Updated**

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use Strong Passwords**

   - Change default SSH password
   - Use SSH keys instead of passwords

3. **Configure Firewall**

   - Only allow necessary ports (22, 80, 443)

4. **Regular Backups**

   - Backup MongoDB database
   - Backup uploaded media
   - Backup .env files

5. **Monitor Logs**

   - Check PM2 logs daily
   - Check Nginx error logs
   - Set up error alerts (optional)

6. **Secure Environment Variables**

   ```bash
   # Restrict .env file permissions
   chmod 600 /var/www/mysoov/server/.env
   ```

7. **Enable Rate Limiting** (optional)
   - Add nginx rate limiting for API routes
   - Implement application-level rate limiting

---

## 📝 Important Notes

1. **Client-Side Serverless Function**: The `client/api/video-meta.js` file is Vercel-specific and won't work on VPS. Social media sharing is handled by:

   - Backend routes: `/video/:id` and `/post/:id`
   - Nginx routing based on user agent (crawlers vs. regular users)

2. **Environment Variables**: Always use production values on VPS:

   - `NODE_ENV=production`
   - `FRONTEND_URL=https://mysoov.tv`
   - `VITE_API_URL=https://mysoov.tv`

3. **PM2 Cluster Mode**: The app runs in cluster mode with 2 instances for load balancing. Adjust in `ecosystem.config.js` based on your VPS resources.

4. **Memory Usage**: Default max memory restart is 500MB per instance. Monitor and adjust as needed.

5. **Upload Limits**: Default is 100MB. Adjust in:
   - `server/index.js` (fileUpload limits)
   - `nginx-vps.conf` (client_max_body_size)

---

## 🎉 Success!

Your app is now running on VPS hosting! If you followed all steps correctly, you should have:

- ✅ Backend running on PM2 (port 5100)
- ✅ Frontend served by Nginx
- ✅ SSL certificate installed (HTTPS)
- ✅ Social media sharing working
- ✅ No Vercel dependencies
- ✅ Auto-restart on crash
- ✅ Auto-start on system reboot

For questions or issues, refer to the troubleshooting section above or check the logs.
