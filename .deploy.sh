#!/bin/bash

# =================================================================
# Unified Cookscape - Automation Deployment Script (.deploy.sh)
# =================================================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Deployment Process...${NC}"

# 1. Pull Latest Changes
echo -e "${BLUE}📦 Pulling latest code from Git...${NC}"
git pull origin main

# 2. Build Frontend
echo -e "${BLUE}🛠️  Building Frontend Dist...${NC}"
npm install
npm run build

# 3. Deploy Frontend Assets
echo -e "${BLUE}🚚 Copying files to /var/www/cook-frontend...${NC}"
sudo rm -rf /var/www/cook-frontend/*
sudo cp -r dist/* /var/www/cook-frontend/

# 4. Sync Backend & Database
echo -e "${BLUE}⚙️  Syncing Backend & Database...${NC}"
cd server
npm install

# Run safe database update script
echo -e "${BLUE}🛢️  Updating database schema safely...${NC}"
node scripts/safe_update.js

# Regenerate Prisma Client
echo -e "${BLUE}⚙️  Regenerating Prisma Client...${NC}"
npx prisma generate

# 5. Restart Server
echo -e "${BLUE}🔄 Restarting PM2 processes...${NC}"
pm2 restart all

echo -e "${GREEN}✅ Deployment Complete! Visit your site to verify.${NC}"
