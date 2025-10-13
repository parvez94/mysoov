# Complete OVH Deployment Guide for Mysoov MERN App

This guide will walk you through deploying your MERN stack application on OVH hosting step by step.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [OVH Service Selection](#ovh-service-selection)
3. [Server Setup](#server-setup)
4. [Domain Configuration](#domain-configuration)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [Environment Variables](#environment-variables)
9. [Process Management](#process-management)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ OVH account created
- ✅ Domain name (can be purchased from OVH or external)
- ✅ MongoDB Atlas account (or MongoDB hosted elsewhere)
- ✅ Cloudinary account for media storage
- ✅ SSH client installed on your computer
- ✅ Git installed locally
- ✅ Your app code ready

---

## OVH Service Selection

### Recommended OVH Services for MERN Stack:

#### Option 1: VPS (Virtual Private Server) - **RECOMMENDED**

**Best for:** Full control, scalability, production apps

**Minimum Requirements:**

- **VPS Starter**: 2GB RAM, 1 vCore, 20GB SSD
- **VPS Value**: 4GB RAM, 2 vCore, 40GB SSD (Better for production)
- **VPS Essential**: 8GB RAM, 4 vCore, 80GB SSD (Recommended for high traffic)

**Pricing:** Starting from ~$3.50/month

**Steps to Order:**

1. Go to https://www.ovhcloud.com/en/vps/
2. Choose your VPS plan (VPS Value recommended)
3. Select your datacenter location (closest to your users)
4. Choose OS: **Ubuntu 22.04 LTS** (recommended)
5. Complete payment

#### Option 2: Dedicated Server

**Best for:** High traffic, enterprise applications

- More expensive but more powerful
- Starting from ~$50/month

#### Option 3: Web Hosting (NOT RECOMMENDED for Node.js)

- OVH shared hosting doesn't support Node.js well
- Limited control and configuration

---

## Server Setup

### Step 1: Access Your VPS

After OVH provisions your VPS, you'll receive:

- IP Address (e.g., 51.38.123.456)
- Root password (via email)

**Connect via SSH:**

```bash
# On Mac/Linux Terminal or Windows PowerShell
ssh root@YOUR_VPS_IP

# Example:
ssh root@51.38.123.456
```

Enter the password when prompted.

### Step 2: Initial Server Security

```bash
# Update system packages
apt update && apt upgrade -y

# Create a new sudo user (replace 'mysoov' with your preferred username)
adduser mysoov

# Add user to sudo group
usermod -aG sudo mysoov

# Switch to new user
su - mysoov
```

### Step 3: Install Required Software

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Install Git
sudo apt install -y git

# Install Nginx (web server)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Install build essentials (for native modules)
sudo apt install -y build-essential
```

### Step 4: Configure Firewall

```bash
# Install UFW (Uncomplicated Firewall)
sudo apt install -y ufw

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Domain Configuration

### Step 1: Configure DNS in OVH

1. Log in to OVH Control Panel
2. Go to **Web Cloud** → **Domain names**
3. Select your domain
4. Click **DNS Zone** tab
5. Add/Edit these records:

```
Type    Subdomain    Target              TTL
A       @            YOUR_VPS_IP         3600
A       www          YOUR_VPS_IP         3600
A       api          YOUR_VPS_IP         3600
```

**Example:**

```
A       @            51.38.123.456       3600
A       www          51.38.123.456       3600
A       api          51.38.123.456       3600
```

**Note:** DNS propagation can take 1-24 hours

### Step 2: Verify DNS

```bash
# On your local machine, check if DNS is working
ping yourdomain.com
ping api.yourdomain.com
```

---

## Backend Deployment

### Step 1: Clone Your Repository

```bash
# On your VPS, create app directory
cd /home/mysoov
mkdir apps
cd apps

# Clone your repository (if using Git)
git clone https://github.com/yourusername/mysoov.git
cd mysoov/server

# OR upload files via SCP from your local machine:
# scp -r /path/to/local/mysoov mysoov@YOUR_VPS_IP:/home/mysoov/apps/
```

### Step 2: Install Dependencies

```bash
cd /home/mysoov/apps/mysoov/server
npm install --production
```

### Step 3: Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add your production environment variables:

```env
# MongoDB Connection (use MongoDB Atlas)
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/mysoov_production?retryWrites=true&w=majority

# JWT Secret Key (generate a strong random string)
SECRET_KEY=your_super_secret_production_key_here_make_it_long_and_random

# Cloudinary Configuration
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API=your_cloudinary_api_key
CLOUD_SECRET=your_cloudinary_api_secret

# YouTube API Configuration (if using)
YOUTUBE_CLIENT_ID=your_youtube_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-your_youtube_client_secret
YOUTUBE_REDIRECT_URI=https://api.yourdomain.com/api/v1/youtube/oauth2callback
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token

# Node Environment
NODE_ENV=production

# Port
PORT=5100
```

**Save:** Press `Ctrl + X`, then `Y`, then `Enter`

### Step 4: Test Backend Locally

```bash
# Test if backend starts
npm start

# You should see:
# ✅ MongoDB connected successfully
# ✅ Server running on http://localhost:5100
```

Press `Ctrl + C` to stop.

### Step 5: Start Backend with PM2

```bash
# Start the backend with PM2
pm2 start index.js --name mysoov-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Copy and run the command that PM2 outputs
```

### Step 6: Verify Backend is Running

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs mysoov-backend

# Test API locally
curl http://localhost:5100/api
```

---

## Frontend Deployment

### Step 1: Build Frontend Locally

**On your local machine:**

```bash
cd /path/to/mysoov/client

# Update .env.production with your API URL
nano .env.production
```

Add:

```env
VITE_API_URL=https://api.yourdomain.com
```

```bash
# Build the frontend
npm install
npm run build

# This creates a 'dist' folder with optimized files
```

### Step 2: Upload Frontend to VPS

**Option A: Using SCP (from your local machine):**

```bash
# Upload the dist folder to VPS
scp -r dist mysoov@YOUR_VPS_IP:/home/mysoov/apps/mysoov/client/
```

**Option B: Build on VPS:**

```bash
# On VPS
cd /home/mysoov/apps/mysoov/client

# Create .env.production
nano .env.production
# Add: VITE_API_URL=https://api.yourdomain.com

# Install and build
npm install
npm run build
```

---

## Nginx Configuration

### Step 1: Configure Nginx for Frontend

```bash
# Create Nginx configuration for frontend
sudo nano /etc/nginx/sites-available/mysoov-frontend
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /home/mysoov/apps/mysoov/client/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Replace `yourdomain.com` with your actual domain**

### Step 2: Configure Nginx for Backend API

```bash
# Create Nginx configuration for backend
sudo nano /etc/nginx/sites-available/mysoov-backend
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeouts for file uploads
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;

        # Increase max body size for file uploads (100MB)
        client_max_body_size 100M;
    }
}
```

**Replace `api.yourdomain.com` with your actual domain**

### Step 3: Enable Sites and Restart Nginx

```bash
# Enable frontend site
sudo ln -s /etc/nginx/sites-available/mysoov-frontend /etc/nginx/sites-enabled/

# Enable backend site
sudo ln -s /etc/nginx/sites-available/mysoov-backend /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test is successful, restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

---

## SSL Certificate Setup

### Install Certbot and Get Free SSL

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificates for both domains
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)
```

Certbot will automatically:

- Generate SSL certificates
- Update Nginx configuration
- Set up auto-renewal

### Verify SSL Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer
```

---

## Environment Variables

### Backend Environment Variables (.env)

Located at: `/home/mysoov/apps/mysoov/server/.env`

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/mysoov_production
SECRET_KEY=your_production_secret_key_min_32_characters_long
CLOUD_NAME=your_cloudinary_name
CLOUD_API=your_cloudinary_api_key
CLOUD_SECRET=your_cloudinary_secret
YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-your_secret
YOUTUBE_REDIRECT_URI=https://api.yourdomain.com/api/v1/youtube/oauth2callback
YOUTUBE_REFRESH_TOKEN=your_refresh_token
NODE_ENV=production
PORT=5100
```

### Frontend Environment Variables (.env.production)

Located at: `/home/mysoov/apps/mysoov/client/.env.production`

```env
VITE_API_URL=https://api.yourdomain.com
```

---

## Process Management with PM2

### Useful PM2 Commands

```bash
# View all processes
pm2 list

# View logs
pm2 logs mysoov-backend

# View specific logs
pm2 logs mysoov-backend --lines 100

# Restart backend
pm2 restart mysoov-backend

# Stop backend
pm2 stop mysoov-backend

# Start backend
pm2 start mysoov-backend

# Delete process
pm2 delete mysoov-backend

# Monitor resources
pm2 monit

# View detailed info
pm2 info mysoov-backend
```

### PM2 Ecosystem File (Advanced)

Create a PM2 configuration file for easier management:

```bash
cd /home/mysoov/apps/mysoov/server
nano ecosystem.config.js
```

Add:

```javascript
module.exports = {
  apps: [
    {
      name: 'mysoov-backend',
      script: './index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5100,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '500M',
      watch: false,
      autorestart: true,
    },
  ],
};
```

Start with ecosystem file:

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## Deployment Workflow

### Initial Deployment

```bash
# 1. SSH into VPS
ssh mysoov@YOUR_VPS_IP

# 2. Navigate to app
cd /home/mysoov/apps/mysoov

# 3. Pull latest code
git pull origin main

# 4. Update backend
cd server
npm install --production
pm2 restart mysoov-backend

# 5. Update frontend
cd ../client
npm install
npm run build

# 6. Restart Nginx (if needed)
sudo systemctl restart nginx
```

### Automated Deployment Script

Create a deployment script:

```bash
nano /home/mysoov/deploy.sh
```

Add:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to app directory
cd /home/mysoov/apps/mysoov

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Update backend
echo "🔧 Updating backend..."
cd server
npm install --production
pm2 restart mysoov-backend

# Update frontend
echo "🎨 Building frontend..."
cd ../client
npm install
npm run build

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ Deployment complete!"
pm2 status
```

Make it executable:

```bash
chmod +x /home/mysoov/deploy.sh
```

Run deployment:

```bash
/home/mysoov/deploy.sh
```

---

## MongoDB Setup

### Using MongoDB Atlas (Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (Free tier available)
4. Create a database user
5. Whitelist VPS IP address:
   - Go to Network Access
   - Click "Add IP Address"
   - Add your VPS IP: `51.38.123.456`
   - Or allow from anywhere: `0.0.0.0/0` (less secure)
6. Get connection string:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

---

## Monitoring and Maintenance

### Setup Monitoring

```bash
# Install monitoring tools
sudo npm install -g pm2-logrotate

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Regular Maintenance Tasks

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
pm2 status

# View system logs
sudo journalctl -xe

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Update system packages (monthly)
sudo apt update && sudo apt upgrade -y
```

### Backup Strategy

```bash
# Create backup script
nano /home/mysoov/backup.sh
```

Add:

```bash
#!/bin/bash

BACKUP_DIR="/home/mysoov/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/mysoov_$DATE.tar.gz /home/mysoov/apps/mysoov

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t | tail -n +8 | xargs rm -f

echo "✅ Backup completed: mysoov_$DATE.tar.gz"
```

Make executable and run:

```bash
chmod +x /home/mysoov/backup.sh
/home/mysoov/backup.sh
```

Setup automatic backups (cron):

```bash
# Edit crontab
crontab -e

# Add this line (backup daily at 2 AM)
0 2 * * * /home/mysoov/backup.sh
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs mysoov-backend

# Check if port is in use
sudo lsof -i :5100

# Check environment variables
cd /home/mysoov/apps/mysoov/server
cat .env

# Try starting manually
npm start
```

### Frontend Not Loading

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx configuration
sudo nginx -t

# Verify dist folder exists
ls -la /home/mysoov/apps/mysoov/client/dist
```

### Database Connection Issues

```bash
# Test MongoDB connection
cd /home/mysoov/apps/mysoov/server
node test-mongo.js

# Check if VPS IP is whitelisted in MongoDB Atlas
# Verify MONGO_URL in .env file
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Check Nginx SSL configuration
sudo nano /etc/nginx/sites-available/mysoov-frontend
```

### File Upload Issues

```bash
# Check /tmp directory permissions
ls -la /tmp

# Check Nginx client_max_body_size
sudo nano /etc/nginx/sites-available/mysoov-backend

# Verify it has: client_max_body_size 100M;
```

### High Memory Usage

```bash
# Check memory usage
free -h
pm2 monit

# Restart backend if needed
pm2 restart mysoov-backend

# Check for memory leaks in logs
pm2 logs mysoov-backend --lines 200
```

---

## Security Best Practices

### 1. SSH Key Authentication

```bash
# On your local machine, generate SSH key
ssh-keygen -t rsa -b 4096

# Copy public key to VPS
ssh-copy-id mysoov@YOUR_VPS_IP

# On VPS, disable password authentication
sudo nano /etc/ssh/sshd_config

# Change these lines:
# PasswordAuthentication no
# PermitRootLogin no

# Restart SSH
sudo systemctl restart sshd
```

### 2. Fail2Ban (Prevent Brute Force)

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 3. Regular Updates

```bash
# Setup automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 4. Environment Variables Security

```bash
# Ensure .env files are not readable by others
chmod 600 /home/mysoov/apps/mysoov/server/.env
```

---

## Performance Optimization

### 1. Enable Nginx Caching

```bash
sudo nano /etc/nginx/nginx.conf
```

Add inside `http` block:

```nginx
# Cache settings
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;
```

### 2. PM2 Cluster Mode

```bash
# Run multiple instances (use CPU cores)
pm2 start index.js -i max --name mysoov-backend
```

### 3. Enable HTTP/2

Already enabled with Certbot SSL setup.

---

## Cost Estimation

### Monthly Costs:

- **VPS Value (4GB RAM)**: ~$7-10/month
- **Domain Name**: ~$10-15/year
- **MongoDB Atlas (Free Tier)**: $0 (512MB storage)
- **Cloudinary (Free Tier)**: $0 (25GB storage, 25GB bandwidth)
- **SSL Certificate**: $0 (Let's Encrypt)

**Total**: ~$7-10/month + domain cost

---

## Quick Reference Commands

```bash
# SSH into VPS
ssh mysoov@YOUR_VPS_IP

# Check backend status
pm2 status

# View backend logs
pm2 logs mysoov-backend

# Restart backend
pm2 restart mysoov-backend

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Deploy updates
cd /home/mysoov/apps/mysoov && git pull && cd server && npm install && pm2 restart mysoov-backend && cd ../client && npm run build

# Check disk space
df -h

# Check memory
free -h

# Renew SSL
sudo certbot renew
```

---

## Support and Resources

- **OVH Documentation**: https://docs.ovh.com/
- **PM2 Documentation**: https://pm2.keymetrics.io/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Let's Encrypt**: https://letsencrypt.org/docs/

---

## Checklist

Before going live, ensure:

- [ ] VPS is set up and accessible
- [ ] Domain DNS is configured and propagated
- [ ] Backend is running with PM2
- [ ] Frontend is built and served by Nginx
- [ ] SSL certificates are installed
- [ ] Environment variables are set correctly
- [ ] MongoDB connection is working
- [ ] Cloudinary is configured
- [ ] Firewall is enabled
- [ ] PM2 startup is configured
- [ ] Backups are scheduled
- [ ] Monitoring is set up
- [ ] Test all features on production

---

## Next Steps After Deployment

1. **Test thoroughly**: Check all features work correctly
2. **Monitor logs**: Watch for errors in the first few days
3. **Setup monitoring**: Consider tools like UptimeRobot for uptime monitoring
4. **Create documentation**: Document your specific configuration
5. **Plan for scaling**: Monitor resource usage and upgrade if needed

---

**Congratulations! Your Mysoov app is now deployed on OVH! 🎉**

For questions or issues, refer to the troubleshooting section or check the logs.
