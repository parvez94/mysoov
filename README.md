# Mysoov - Social Media Platform

A modern social media platform for sharing videos, images, and connecting with creators.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- MongoDB Atlas account
- Cloudinary account (for media storage)
- Domain pointed to your VPS IP

### Development Setup

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your credentials

# Start development servers
cd server && npm start  # Backend on port 5100
cd client && npm run dev  # Frontend on port 5173
```

## 📦 VPS Deployment

For detailed VPS deployment instructions, see:

1. **[QUICK_DEPLOY_CHECKLIST.md](./QUICK_DEPLOY_CHECKLIST.md)** - Step-by-step deployment checklist
2. **[VPS_COMPLETE_SETUP.md](./VPS_COMPLETE_SETUP.md)** - Detailed setup guide with troubleshooting
3. **[README_VPS_MIGRATION.md](./README_VPS_MIGRATION.md)** - Complete VPS migration overview

### Quick Deploy

```bash
# On your VPS
cd /var/www/mysoov
./deploy.sh
```

## 🛠 Technology Stack

### Backend

- Node.js + Express
- MongoDB (Mongoose)
- Socket.io (real-time features)
- Cloudinary (media storage)
- Stripe (payments)
- YouTube API (video uploads)

### Frontend

- React + Vite
- Redux Toolkit (state management)
- Styled Components
- Axios

### Infrastructure

- Nginx (reverse proxy)
- PM2 (process manager)
- Let's Encrypt (SSL)
- OVH VPS hosting

## 📁 Project Structure

```
mysoov/
├── server/                 # Backend API
│   ├── controllers/       # Route handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middlewares/      # Auth & validation
│   ├── utils/            # Helper functions
│   └── index.js          # Server entry point
│
├── client/               # Frontend React app
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── redux/       # State management
│   │   ├── contexts/    # React contexts
│   │   └── utils/       # Helper functions
│   └── dist/            # Production build
│
├── nginx-vps.conf        # Nginx configuration
├── ecosystem.config.js   # PM2 configuration
└── deploy.sh            # Deployment script
```

## 🔑 Key Features

- **Video & Image Sharing** - Upload and share media content
- **Film Directory** - Organize videos into collections
- **Blog System** - Create and publish articles
- **Real-time Notifications** - Socket.io powered notifications
- **User Roles** - Admin, Creator, Regular user permissions
- **Payment Integration** - Stripe subscription plans
- **YouTube Integration** - Direct YouTube uploads
- **Social Sharing** - Open Graph meta tags for social media

## 🌐 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh token

### Videos

- `GET /api/v1/videos` - Get all videos
- `POST /api/v1/videos` - Upload video
- `GET /api/v1/videos/:id` - Get video by ID
- `PATCH /api/v1/videos/:id` - Update video
- `DELETE /api/v1/videos/:id` - Delete video

### Users

- `GET /api/v1/users/:id` - Get user profile
- `PATCH /api/v1/users/:id` - Update profile
- `POST /api/v1/users/follow/:id` - Follow user
- `POST /api/v1/users/unfollow/:id` - Unfollow user

### Films

- `GET /api/v1/films` - Get film directories
- `POST /api/v1/films` - Create film directory
- `GET /api/v1/films/:id` - Get film details
- `POST /api/v1/films/:id/videos` - Add video to film

### Blog

- `GET /api/v1/blog` - Get all articles
- `POST /api/v1/blog` - Create article
- `GET /api/v1/blog/:id` - Get article
- `PATCH /api/v1/blog/:id` - Update article

### Payments

- `POST /api/v1/payment/create-checkout-session` - Create Stripe session
- `GET /api/v1/payment/plans` - Get pricing plans
- `POST /api/v1/payment/webhook` - Stripe webhooks

## 🔧 Environment Variables

Required environment variables (see `server/.env.example`):

```env
# Database
MONGO_URL=your_mongodb_connection_string

# Security
SECRET_KEY=your_jwt_secret_key

# Server
PORT=5100
NODE_ENV=production
FRONTEND_URL=https://mysoov.tv

# Cloudinary
CLOUD_NAME=your_cloudinary_name
CLOUD_API=your_cloudinary_api_key
CLOUD_SECRET=your_cloudinary_api_secret

# YouTube API (optional)
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=your_redirect_uri

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## 🚨 Important Notes

### MongoDB Atlas

Add your VPS IP address to MongoDB Atlas Network Access, otherwise connection will fail.

### SSL Certificate

Modern browsers require HTTPS. Use Let's Encrypt for free SSL:

```bash
sudo certbot --nginx -d mysoov.tv -d www.mysoov.tv
```

### PM2 Process Manager

Manage your Node.js application:

```bash
pm2 status              # Check status
pm2 logs mysoov-api     # View logs
pm2 restart mysoov-api  # Restart app
pm2 monit              # Monitor resources
```

### Nginx

Restart nginx after configuration changes:

```bash
sudo nginx -t           # Test configuration
sudo systemctl reload nginx
```

## 📊 Monitoring

```bash
# PM2 Monitoring
pm2 monit                    # Real-time monitoring
pm2 logs --lines 100         # View recent logs

# System Resources
df -h                        # Check disk space
free -h                      # Check memory
top                          # Process monitor
```

## 🐛 Troubleshooting

### 502 Bad Gateway

```bash
pm2 restart mysoov-api
pm2 logs mysoov-api --err
```

### Database Connection Failed

1. Check MongoDB Atlas IP whitelist
2. Verify MONGO_URL in `.env`
3. Test: `curl https://mysoov.tv/api`

### Upload Fails

```bash
mkdir -p /var/www/mysoov/server/tmp
chmod 755 /var/www/mysoov/server/tmp
pm2 restart mysoov-api
```

### CORS Errors

Check allowed origins in:

- `server/index.js`
- `server/routes/uploadRoutes.js`
- `server/routes/videoRoutes.js`

## 📝 License

This project is proprietary software for Mysoov.

## 🤝 Support

For deployment issues, refer to the VPS documentation:

- `QUICK_DEPLOY_CHECKLIST.md` - Deployment steps
- `VPS_COMPLETE_SETUP.md` - Detailed setup guide
- `README_VPS_MIGRATION.md` - Migration overview

---

**Server Status**: Check at `https://mysoov.tv/api`

**Last Updated**: $(date)
