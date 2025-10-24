# 🚀 Quick Deploy Checklist for VPS

Use this checklist to ensure you don't miss any steps during deployment.

---

## ⚙️ Pre-Deployment (On Local Machine)

- [ ] Commit all changes

  ```bash
  git add .
  git commit -m "VPS migration complete"
  git push origin main
  ```

- [ ] Verify `.env.production` template has all required variables
- [ ] Verify `ecosystem.config.js` has correct path (`/var/www/mysoov`)
- [ ] Verify `nginx-vps.conf` exists
- [ ] Verify `deploy.sh` is executable

---

## 🖥️ VPS Initial Setup (One-Time)

### Step 1: Connect to VPS

- [ ] SSH into VPS
  ```bash
  ssh root@your-vps-ip
  # or
  ssh your-username@your-vps-ip
  ```

### Step 2: Install Software

- [ ] Update system

  ```bash
  sudo apt update && sudo apt upgrade -y
  ```

- [ ] Install Node.js 18

  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
  node --version  # Should be v18.x or higher
  ```

- [ ] Install PM2

  ```bash
  sudo npm install -g pm2
  pm2 --version
  ```

- [ ] Install Nginx

  ```bash
  sudo apt install -y nginx
  nginx -v
  ```

- [ ] Install Certbot
  ```bash
  sudo apt install -y certbot python3-certbot-nginx
  certbot --version
  ```

### Step 3: Clone Repository

- [ ] Create project directory

  ```bash
  cd /var/www
  sudo mkdir -p mysoov
  sudo chown -R $USER:$USER mysoov
  ```

- [ ] Clone repository

  ```bash
  cd /var/www
  git clone [YOUR_REPO_URL] mysoov
  cd mysoov
  ```

  **OR** upload files via SCP:

  ```bash
  # On local machine
  scp -r /path/to/mysoov root@your-vps-ip:/var/www/
  ```

### Step 4: Configure Backend

- [ ] Navigate to server directory

  ```bash
  cd /var/www/mysoov/server
  ```

- [ ] Install dependencies

  ```bash
  npm install
  ```

- [ ] Create production .env file

  ```bash
  cp .env.production .env
  nano .env
  ```

- [ ] Update .env with actual values:

  - [ ] `MONGO_URL` - Your MongoDB connection string
  - [ ] `SECRET_KEY` - Generate secure random string
  - [ ] `CLOUD_NAME` - Your Cloudinary cloud name
  - [ ] `CLOUD_API` - Your Cloudinary API key
  - [ ] `CLOUD_SECRET` - Your Cloudinary API secret
  - [ ] `FRONTEND_URL=https://mysoov.tv`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5100`
  - [ ] (Optional) YouTube API credentials
  - [ ] (Optional) Stripe credentials

- [ ] Secure .env file

  ```bash
  chmod 600 .env
  ```

- [ ] Create required directories

  ```bash
  mkdir -p ../logs
  mkdir -p tmp
  chmod 755 tmp
  ```

- [ ] Test server starts
  ```bash
  npm start
  # Press Ctrl+C after seeing "Server running on port 5100"
  ```

### Step 5: Configure Frontend

- [ ] Navigate to client directory

  ```bash
  cd /var/www/mysoov/client
  ```

- [ ] Install dependencies

  ```bash
  npm install
  ```

- [ ] Verify .env.production has correct values

  ```bash
  cat .env.production
  # Should show:
  # VITE_API_URL=https://mysoov.tv
  # VITE_DISABLE_SOCKET_IO=false
  # VITE_FACEBOOK_APP_ID=324758342758749
  ```

- [ ] Build production bundle

  ```bash
  npm run build
  ```

- [ ] Verify build succeeded
  ```bash
  ls -la dist/
  # Should contain index.html and assets folder
  ```

### Step 6: Configure Nginx

- [ ] Copy nginx configuration

  ```bash
  sudo cp /var/www/mysoov/nginx-vps.conf /etc/nginx/sites-available/mysoov.tv
  ```

- [ ] Edit configuration (verify paths)

  ```bash
  sudo nano /etc/nginx/sites-available/mysoov.tv
  ```

  Verify these lines:

  - [ ] `server_name mysoov.tv www.mysoov.tv;`
  - [ ] `root /var/www/mysoov/client/dist;`
  - [ ] `proxy_pass http://localhost:5100;`

- [ ] Enable site

  ```bash
  sudo ln -s /etc/nginx/sites-available/mysoov.tv /etc/nginx/sites-enabled/
  ```

- [ ] Remove default site

  ```bash
  sudo rm -f /etc/nginx/sites-enabled/default
  ```

- [ ] Test nginx configuration

  ```bash
  sudo nginx -t
  # Should say "test is successful"
  ```

- [ ] Start nginx (temporarily without SSL)
  ```bash
  sudo systemctl start nginx
  sudo systemctl enable nginx
  ```

### Step 7: Get SSL Certificate

- [ ] Stop nginx temporarily

  ```bash
  sudo systemctl stop nginx
  ```

- [ ] Run Certbot

  ```bash
  sudo certbot certonly --standalone -d mysoov.tv -d www.mysoov.tv
  ```

  - [ ] Enter email address
  - [ ] Agree to Terms of Service
  - [ ] Choose whether to share email with EFF

- [ ] Verify certificate was created

  ```bash
  sudo ls -la /etc/letsencrypt/live/mysoov.tv/
  # Should show fullchain.pem and privkey.pem
  ```

- [ ] Update nginx config with SSL paths

  ```bash
  sudo nano /etc/nginx/sites-available/mysoov.tv
  ```

  Verify these lines point to correct certificate:

  ```nginx
  ssl_certificate /etc/letsencrypt/live/mysoov.tv/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/mysoov.tv/privkey.pem;
  ```

- [ ] Start nginx again

  ```bash
  sudo systemctl start nginx
  ```

- [ ] Test SSL configuration

  ```bash
  sudo nginx -t
  ```

- [ ] Setup auto-renewal

  ```bash
  sudo certbot renew --dry-run
  ```

- [ ] Add auto-renewal cron job
  ```bash
  sudo crontab -e
  # Add this line:
  # 0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
  ```

### Step 8: Configure MongoDB Access

- [ ] Whitelist VPS IP in MongoDB Atlas

  - [ ] Log in to MongoDB Atlas
  - [ ] Go to Network Access
  - [ ] Click "Add IP Address"
  - [ ] Enter your VPS public IP (or 0.0.0.0/0 for any IP - not recommended)
  - [ ] Click "Confirm"

- [ ] Test database connection from VPS
  ```bash
  cd /var/www/mysoov/server
  node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URL || 'YOUR_MONGO_URL').then(() => console.log('Connected')).catch(e => console.log('Error:', e.message))"
  ```

### Step 9: Start Application with PM2

- [ ] Navigate to project root

  ```bash
  cd /var/www/mysoov
  ```

- [ ] Verify ecosystem.config.js path

  ```bash
  nano ecosystem.config.js
  # Line 6 should be: cwd: '/var/www/mysoov',
  ```

- [ ] Start app with PM2

  ```bash
  pm2 start ecosystem.config.js --env production
  ```

- [ ] Check PM2 status

  ```bash
  pm2 list
  # Should show "mysoov-api" with status "online"
  ```

- [ ] Check logs for errors

  ```bash
  pm2 logs mysoov-api --lines 50
  # Should see "Server running on port 5100"
  # Should see "MongoDB connected successfully"
  ```

- [ ] Save PM2 configuration

  ```bash
  pm2 save
  ```

- [ ] Setup PM2 to start on boot
  ```bash
  pm2 startup
  # Follow the command it outputs (usually starts with sudo)
  ```

### Step 10: Configure Firewall

- [ ] Allow SSH (important - do this first!)

  ```bash
  sudo ufw allow 22/tcp
  ```

- [ ] Allow HTTP

  ```bash
  sudo ufw allow 80/tcp
  ```

- [ ] Allow HTTPS

  ```bash
  sudo ufw allow 443/tcp
  ```

- [ ] Enable firewall

  ```bash
  sudo ufw enable
  ```

- [ ] Check firewall status
  ```bash
  sudo ufw status
  # Should show ports 22, 80, 443 as ALLOW
  ```

---

## ✅ Verification

### Backend Verification

- [ ] Test backend locally on VPS

  ```bash
  curl http://localhost:5100/
  # Should return JSON with success: true
  ```

- [ ] Test backend via domain

  ```bash
  curl https://mysoov.tv/api
  # Should return JSON with success: true
  ```

- [ ] Test database connection

  ```bash
  curl https://mysoov.tv/api/test-db
  # Should return video count
  ```

- [ ] Test auth endpoint
  ```bash
  curl https://mysoov.tv/api/test-auth
  # Should return JSON with hasToken: false
  ```

### Frontend Verification

- [ ] Test frontend loads

  ```bash
  curl https://mysoov.tv
  # Should return HTML with "Mysoov" in title
  ```

- [ ] Open in browser

  - [ ] Visit https://mysoov.tv
  - [ ] Should load React app
  - [ ] Check browser console for errors

- [ ] Test www redirect
  - [ ] Visit https://www.mysoov.tv
  - [ ] Should work the same as mysoov.tv

### SSL Verification

- [ ] Check SSL certificate in browser

  - [ ] Click lock icon in browser
  - [ ] Should show valid certificate
  - [ ] Should show Let's Encrypt

- [ ] Test SSL rating (optional)
  - [ ] Visit https://www.ssllabs.com/ssltest/
  - [ ] Enter mysoov.tv
  - [ ] Should get A or A+ rating

### Functionality Verification

- [ ] Test user registration
- [ ] Test user login
- [ ] Test video upload
- [ ] Test video playback
- [ ] Test comments
- [ ] Test notifications (if applicable)
- [ ] Test social media sharing
  - [ ] Share a post URL on Facebook
  - [ ] Check preview with Facebook Debugger: https://developers.facebook.com/tools/debug/

### PM2 Verification

- [ ] Check process is running

  ```bash
  pm2 list
  # Should show "online" status
  ```

- [ ] Check logs for errors

  ```bash
  pm2 logs mysoov-api --err --lines 50
  # Should have no recent errors
  ```

- [ ] Check resource usage

  ```bash
  pm2 monit
  # CPU and memory should be reasonable
  ```

- [ ] Test auto-restart
  ```bash
  pm2 stop mysoov-api
  sleep 5
  pm2 list
  # Should automatically restart
  ```

### Nginx Verification

- [ ] Check nginx is running

  ```bash
  sudo systemctl status nginx
  # Should show "active (running)"
  ```

- [ ] Check for errors

  ```bash
  sudo tail -50 /var/log/nginx/error.log
  # Should have no critical errors
  ```

- [ ] Test configuration
  ```bash
  sudo nginx -t
  # Should say "successful"
  ```

---

## 🔄 Post-Deployment

### Setup Monitoring

- [ ] Add temp file cleanup cron job

  ```bash
  crontab -e
  # Add: 0 3 * * * find /var/www/mysoov/server/tmp -type f -mtime +1 -delete
  ```

- [ ] Setup PM2 log rotation
  ```bash
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 10M
  pm2 set pm2-logrotate:retain 7
  ```

### Create Backups

- [ ] Backup .env file

  ```bash
  cp /var/www/mysoov/server/.env ~/mysoov-env-backup
  ```

- [ ] Setup MongoDB backups (in Atlas dashboard)
- [ ] Document any custom configurations

### Update DNS (If Not Done)

- [ ] Point mysoov.tv to VPS IP
  - [ ] A record: mysoov.tv → your-vps-ip
  - [ ] A record: www.mysoov.tv → your-vps-ip
  - [ ] Wait for DNS propagation (can take up to 48 hours)

---

## 📝 Important Commands Reference

### PM2 Commands

```bash
pm2 list                      # List all processes
pm2 logs mysoov-api           # View logs
pm2 logs mysoov-api --err     # View errors only
pm2 restart mysoov-api        # Restart app
pm2 reload mysoov-api         # Zero-downtime restart
pm2 stop mysoov-api           # Stop app
pm2 start mysoov-api          # Start app
pm2 monit                     # Monitor resources
pm2 save                      # Save process list
```

### Nginx Commands

```bash
sudo nginx -t                 # Test configuration
sudo systemctl status nginx   # Check status
sudo systemctl restart nginx  # Restart nginx
sudo systemctl reload nginx   # Reload config
```

### Certificate Commands

```bash
sudo certbot certificates              # List certificates
sudo certbot renew                     # Renew certificates
sudo certbot delete --cert-name mysoov.tv  # Delete certificate
```

### System Commands

```bash
df -h                         # Check disk space
free -h                       # Check memory
top                           # Check processes
htop                          # Better process viewer (if installed)
```

---

## 🎉 Deployment Complete!

If all checkboxes are marked, your app is successfully deployed on VPS!

**Congratulations! 🚀**

### Next Steps:

1. Monitor logs for the first 24 hours
2. Test all functionality thoroughly
3. Share links and verify social media previews
4. Setup regular backups
5. Consider setting up a staging environment

### Get Help:

- Check `VPS_COMPLETE_SETUP.md` for detailed troubleshooting
- Check `CLIENT_API_MIGRATION.md` for social sharing issues
- Check `VPS_FIXES_SUMMARY.md` for overview of changes

### Future Updates:

Use the deployment script for future updates:

```bash
/var/www/mysoov/deploy.sh
```

---

**Keep this checklist for reference!** 📋
