#!/bin/bash

# Deployment Script for Mysoov.TV on VPS
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/ubuntu/mysoov"
BACKEND_DIR="$PROJECT_DIR/server"
FRONTEND_DIR="$PROJECT_DIR/client"
PM2_APP_NAME="mysoov-api"

# Check if running from correct directory
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Error: Project directory not found at $PROJECT_DIR${NC}"
    echo "Please update PROJECT_DIR in this script to match your installation path"
    exit 1
fi

cd "$PROJECT_DIR"

# Step 1: Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes from Git...${NC}"
git fetch origin
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"
git pull origin "$CURRENT_BRANCH"
echo -e "${GREEN}✓ Git pull complete${NC}"
echo ""

# Step 2: Update backend
echo -e "${YELLOW}🔧 Updating backend...${NC}"
cd "$BACKEND_DIR"

# Install/update dependencies
echo "Installing backend dependencies..."
npm install --production
echo -e "${GREEN}✓ Backend dependencies updated${NC}"

# Run database migrations if any (optional)
# npm run migrate

echo ""

# Step 3: Update frontend
echo -e "${YELLOW}🎨 Building frontend...${NC}"
cd "$FRONTEND_DIR"

# Install/update dependencies
echo "Installing frontend dependencies..."
npm install

# Build production bundle
echo "Building production bundle..."
npm run build

if [ ! -d "$FRONTEND_DIR/dist" ]; then
    echo -e "${RED}❌ Error: Frontend build failed - dist folder not created${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Frontend built successfully${NC}"
echo ""

# Step 4: Restart backend with PM2
echo -e "${YELLOW}♻️  Restarting backend with PM2...${NC}"
cd "$PROJECT_DIR"

# Check if PM2 app exists
if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
    echo "Reloading PM2 app (zero-downtime restart)..."
    pm2 reload "$PM2_APP_NAME"
else
    echo "PM2 app not running, starting it..."
    pm2 start ecosystem.config.js --env production
fi

echo -e "${GREEN}✓ Backend restarted${NC}"
echo ""

# Step 5: Reload Nginx (if config changed)
echo -e "${YELLOW}🌐 Checking Nginx configuration...${NC}"
if sudo nginx -t > /dev/null 2>&1; then
    echo "Nginx configuration is valid"
    sudo systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Nginx configuration test failed${NC}"
    echo "Skipping Nginx reload (app will still work with old config)"
fi
echo ""

# Step 6: Clean up old temp files
echo -e "${YELLOW}🧹 Cleaning up old temp files...${NC}"
TEMP_DIR="$BACKEND_DIR/tmp"
if [ -d "$TEMP_DIR" ]; then
    # Delete files older than 24 hours
    find "$TEMP_DIR" -type f -mtime +1 -delete 2>/dev/null || true
    TEMP_COUNT=$(find "$TEMP_DIR" -type f | wc -l)
    echo "Remaining temp files: $TEMP_COUNT"
else
    echo "Temp directory not found, creating it..."
    mkdir -p "$TEMP_DIR"
    chmod 755 "$TEMP_DIR"
fi
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

# Step 7: Display status
echo -e "${YELLOW}📊 Current Status:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 list | grep "$PM2_APP_NAME" || pm2 list
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 8: Save PM2 process list
echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save
echo -e "${GREEN}✓ PM2 configuration saved${NC}"
echo ""

# Display deployment summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📝 Next Steps:"
echo "  1. Check logs: pm2 logs $PM2_APP_NAME"
echo "  2. Monitor app: pm2 monit"
echo "  3. Test frontend: https://mysoov.tv"
echo "  4. Test API: https://mysoov.tv/api"
echo ""
echo "🔍 Troubleshooting:"
echo "  • View error logs: pm2 logs $PM2_APP_NAME --err"
echo "  • Restart app: pm2 restart $PM2_APP_NAME"
echo "  • Check nginx: sudo nginx -t && sudo systemctl status nginx"
echo ""