# Mysoov - Social Media Platform

A modern MERN stack social media platform for sharing videos, images, and connecting with creators.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for media storage)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/parvez94/mysoov.git
cd mysoov

# Install server dependencies
cd server
npm install

# Configure server environment
cp .env.example .env
# Edit .env with your credentials

# Start backend server (runs on port 5100)
npm start

# In a new terminal, install and start frontend
cd ../client
npm install
npm run dev  # Frontend runs on port 5173
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
└── client/               # Frontend React app
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── redux/       # State management
    │   ├── contexts/    # React contexts
    │   └── utils/       # Helper functions
    └── dist/            # Production build
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
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

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

## 🏗 Build for Production

### Backend

```bash
cd server
npm start
```

### Frontend

```bash
cd client
npm run build
# Production files will be in client/dist/
```

## 📝 License

This project is proprietary software for Mysoov.

---

**Development Server**: `http://localhost:5100/api`  
**Frontend**: `http://localhost:5173`
