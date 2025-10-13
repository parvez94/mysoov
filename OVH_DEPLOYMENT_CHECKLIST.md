# OVH Deployment Quick Checklist

Use this checklist to ensure you complete all steps in order.

## Pre-Deployment

- [ ] OVH account created
- [ ] VPS ordered (recommended: VPS Value - 4GB RAM)
- [ ] Domain name ready
- [ ] MongoDB Atlas account created
- [ ] Cloudinary account created
- [ ] All API keys and credentials collected

---

## Phase 1: Server Setup (Day 1)

### Initial Access

- [ ] Received VPS IP address from OVH
- [ ] Received root password via email
- [ ] Successfully connected via SSH: `ssh root@YOUR_VPS_IP`

### User Setup

- [ ] Created new sudo user
- [ ] Added user to sudo group
- [ ] Tested sudo access

### Software Installation

- [ ] Updated system: `apt update && apt upgrade -y`
- [ ] Installed Node.js 20.x
- [ ] Verified Node.js: `node --version`
- [ ] Installed Git
- [ ] Installed Nginx
- [ ] Installed PM2 globally
- [ ] Installed build-essential

### Security

- [ ] Configured UFW firewall
- [ ] Allowed SSH, HTTP, HTTPS
- [ ] Enabled firewall
- [ ] Verified firewall status

---

## Phase 2: Domain Configuration (Day 1-2)

### DNS Setup

- [ ] Logged into OVH Control Panel
- [ ] Added A record for @ pointing to VPS IP
- [ ] Added A record for www pointing to VPS IP
- [ ] Added A record for api pointing to VPS IP
- [ ] Waited for DNS propagation (can take up to 24 hours)
- [ ] Verified DNS with: `ping yourdomain.com`

---

## Phase 3: Backend Deployment (Day 2)

### Code Setup

- [ ] Cloned repository to `/home/mysoov/apps/mysoov`
- [ ] Navigated to server directory
- [ ] Ran `npm install --production`

### Environment Configuration

- [ ] Created `.env` file in server directory
- [ ] Added MONGO_URL (MongoDB Atlas connection string)
- [ ] Added SECRET_KEY (strong random string)
- [ ] Added Cloudinary credentials (CLOUD_NAME, CLOUD_API, CLOUD_SECRET)
- [ ] Added YouTube credentials (if using)
- [ ] Set NODE_ENV=production
- [ ] Set PORT=5100
- [ ] Verified .env file permissions: `chmod 600 .env`

### MongoDB Setup

- [ ] Created MongoDB Atlas cluster
- [ ] Created database user
- [ ] Whitelisted VPS IP address in MongoDB Atlas
- [ ] Tested connection: `node test-mongo.js`

### PM2 Setup

- [ ] Started backend with PM2: `pm2 start index.js --name mysoov-backend`
- [ ] Saved PM2 configuration: `pm2 save`
- [ ] Setup PM2 startup: `pm2 startup`
- [ ] Ran the command PM2 provided
- [ ] Verified backend is running: `pm2 status`
- [ ] Checked logs: `pm2 logs mysoov-backend`
- [ ] Tested API locally: `curl http://localhost:5100/api`

---

## Phase 4: Frontend Deployment (Day 2)

### Build Configuration

- [ ] Updated `.env.production` with: `VITE_API_URL=https://api.yourdomain.com`
- [ ] Built frontend locally: `npm run build`
- [ ] Uploaded dist folder to VPS (or built on VPS)
- [ ] Verified dist folder exists: `ls -la /home/mysoov/apps/mysoov/client/dist`

---

## Phase 5: Nginx Configuration (Day 2)

### Frontend Nginx

- [ ] Created `/etc/nginx/sites-available/mysoov-frontend`
- [ ] Added frontend configuration
- [ ] Updated server_name with your domain
- [ ] Updated root path to dist folder
- [ ] Enabled site: `ln -s /etc/nginx/sites-available/mysoov-frontend /etc/nginx/sites-enabled/`

### Backend Nginx

- [ ] Created `/etc/nginx/sites-available/mysoov-backend`
- [ ] Added backend proxy configuration
- [ ] Updated server_name with api.yourdomain.com
- [ ] Set client_max_body_size to 100M
- [ ] Enabled site: `ln -s /etc/nginx/sites-available/mysoov-backend /etc/nginx/sites-enabled/`

### Nginx Activation

- [ ] Removed default site: `rm /etc/nginx/sites-enabled/default`
- [ ] Tested configuration: `nginx -t`
- [ ] Restarted Nginx: `systemctl restart nginx`
- [ ] Enabled Nginx on boot: `systemctl enable nginx`
- [ ] Verified Nginx is running: `systemctl status nginx`

---

## Phase 6: SSL Certificate (Day 2-3)

### Certbot Installation

- [ ] Installed Certbot: `apt install certbot python3-certbot-nginx`
- [ ] Ran Certbot: `certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com`
- [ ] Entered email address
- [ ] Agreed to terms
- [ ] Selected redirect HTTP to HTTPS
- [ ] Verified SSL certificates installed
- [ ] Tested auto-renewal: `certbot renew --dry-run`

### SSL Verification

- [ ] Visited https://yourdomain.com (should load with SSL)
- [ ] Visited https://api.yourdomain.com/api (should return JSON with SSL)
- [ ] Checked for SSL warnings in browser
- [ ] Verified auto-renewal timer: `systemctl status certbot.timer`

---

## Phase 7: Testing (Day 3)

### Backend Testing

- [ ] Tested health endpoint: `curl https://api.yourdomain.com/api`
- [ ] Tested database connection: `curl https://api.yourdomain.com/api/test-db`
- [ ] Checked PM2 logs for errors: `pm2 logs mysoov-backend`
- [ ] Verified no error logs in Nginx: `tail /var/log/nginx/error.log`

### Frontend Testing

- [ ] Opened https://yourdomain.com in browser
- [ ] Verified homepage loads correctly
- [ ] Tested user registration
- [ ] Tested user login
- [ ] Tested video upload
- [ ] Tested video playback
- [ ] Tested search functionality
- [ ] Tested all major features
- [ ] Checked browser console for errors
- [ ] Tested on mobile device

### Cross-Feature Testing

- [ ] Tested authentication flow
- [ ] Tested file uploads (images and videos)
- [ ] Tested comments
- [ ] Tested notifications
- [ ] Tested user profiles
- [ ] Tested admin panel (if applicable)

---

## Phase 8: Monitoring & Maintenance Setup (Day 3)

### Monitoring

- [ ] Installed pm2-logrotate: `npm install -g pm2-logrotate`
- [ ] Configured log rotation
- [ ] Setup monitoring dashboard: `pm2 monit`
- [ ] Verified logs are being written

### Backups

- [ ] Created backup script at `/home/mysoov/backup.sh`
- [ ] Made script executable: `chmod +x backup.sh`
- [ ] Tested backup script: `./backup.sh`
- [ ] Setup cron job for daily backups: `crontab -e`
- [ ] Verified cron job is scheduled

### Deployment Script

- [ ] Created deployment script at `/home/mysoov/deploy.sh`
- [ ] Made script executable: `chmod +x deploy.sh`
- [ ] Tested deployment script
- [ ] Documented deployment process

---

## Phase 9: Security Hardening (Day 4)

### SSH Security

- [ ] Generated SSH key pair locally
- [ ] Copied public key to VPS: `ssh-copy-id mysoov@YOUR_VPS_IP`
- [ ] Tested SSH key login
- [ ] Disabled password authentication in `/etc/ssh/sshd_config`
- [ ] Disabled root login in `/etc/ssh/sshd_config`
- [ ] Restarted SSH: `systemctl restart sshd`
- [ ] Verified can still login with SSH key

### Additional Security

- [ ] Installed Fail2Ban: `apt install fail2ban`
- [ ] Started and enabled Fail2Ban
- [ ] Setup automatic security updates
- [ ] Verified .env file permissions (600)
- [ ] Reviewed firewall rules: `ufw status`

---

## Phase 10: Performance Optimization (Optional)

### Backend Optimization

- [ ] Configured PM2 cluster mode (if needed)
- [ ] Setup PM2 max memory restart
- [ ] Enabled PM2 monitoring

### Frontend Optimization

- [ ] Verified Gzip compression in Nginx
- [ ] Configured static asset caching
- [ ] Tested page load speed

### Database Optimization

- [ ] Reviewed MongoDB indexes
- [ ] Checked database performance
- [ ] Setup database monitoring in Atlas

---

## Phase 11: Documentation (Day 4-5)

### Internal Documentation

- [ ] Documented server credentials (store securely)
- [ ] Documented all environment variables
- [ ] Documented deployment process
- [ ] Created runbook for common issues
- [ ] Documented backup/restore process

### User Documentation

- [ ] Updated README with production URL
- [ ] Created user guide (if needed)
- [ ] Documented API endpoints (if public)

---

## Phase 12: Go Live (Day 5)

### Pre-Launch Checklist

- [ ] All features tested and working
- [ ] SSL certificates valid
- [ ] Backups configured
- [ ] Monitoring in place
- [ ] Error logging working
- [ ] Performance acceptable
- [ ] Security measures implemented

### Launch

- [ ] Announced to users
- [ ] Monitored logs for first 24 hours
- [ ] Checked error rates
- [ ] Verified uptime
- [ ] Collected user feedback

### Post-Launch

- [ ] Fixed any critical issues
- [ ] Monitored resource usage
- [ ] Planned for scaling if needed
- [ ] Setup uptime monitoring (UptimeRobot, etc.)

---

## Ongoing Maintenance

### Daily

- [ ] Check PM2 status: `pm2 status`
- [ ] Review error logs: `pm2 logs mysoov-backend --lines 50`
- [ ] Monitor resource usage: `pm2 monit`

### Weekly

- [ ] Review Nginx logs: `tail -100 /var/log/nginx/error.log`
- [ ] Check disk space: `df -h`
- [ ] Check memory usage: `free -h`
- [ ] Review backup logs

### Monthly

- [ ] Update system packages: `apt update && apt upgrade`
- [ ] Review SSL certificate expiry: `certbot certificates`
- [ ] Review security logs
- [ ] Test backup restoration
- [ ] Review performance metrics
- [ ] Check for Node.js updates

### Quarterly

- [ ] Review and update dependencies
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Capacity planning

---

## Emergency Contacts & Resources

### Important Commands

```bash
# Restart everything
pm2 restart mysoov-backend
sudo systemctl restart nginx

# View logs
pm2 logs mysoov-backend
sudo tail -f /var/log/nginx/error.log

# Check status
pm2 status
sudo systemctl status nginx
```

### Important Files

- Backend: `/home/mysoov/apps/mysoov/server/`
- Frontend: `/home/mysoov/apps/mysoov/client/dist/`
- Nginx Config: `/etc/nginx/sites-available/`
- Environment: `/home/mysoov/apps/mysoov/server/.env`
- Logs: `/var/log/nginx/` and PM2 logs

### Support Resources

- OVH Support: https://help.ovhcloud.com/
- MongoDB Atlas Support: https://support.mongodb.com/
- Cloudinary Support: https://support.cloudinary.com/

---

## Troubleshooting Quick Reference

### Backend Not Working

1. Check PM2: `pm2 logs mysoov-backend`
2. Check if running: `pm2 status`
3. Restart: `pm2 restart mysoov-backend`
4. Check port: `sudo lsof -i :5100`

### Frontend Not Loading

1. Check Nginx: `sudo systemctl status nginx`
2. Check logs: `sudo tail -f /var/log/nginx/error.log`
3. Test config: `sudo nginx -t`
4. Restart: `sudo systemctl restart nginx`

### Database Connection Failed

1. Check MongoDB Atlas IP whitelist
2. Verify MONGO_URL in .env
3. Test connection: `node test-mongo.js`
4. Check MongoDB Atlas status

### SSL Issues

1. Check certificates: `sudo certbot certificates`
2. Renew: `sudo certbot renew`
3. Check Nginx SSL config
4. Restart Nginx

---

## Success Criteria

Your deployment is successful when:

- ✅ Frontend loads at https://yourdomain.com
- ✅ API responds at https://api.yourdomain.com/api
- ✅ Users can register and login
- ✅ Videos can be uploaded and played
- ✅ All features work as expected
- ✅ SSL certificates are valid
- ✅ No errors in logs
- ✅ Backups are running
- ✅ Monitoring is active
- ✅ Performance is acceptable

---

**Estimated Total Time: 3-5 days** (including DNS propagation wait time)

**Good luck with your deployment! 🚀**
