#!/bin/bash

# Deployment script for backend application
# Save as: scripts/deploy.sh

set -e  # Exit on error

# Configuration
APP_DIR="/path/to/backend"
PM2_APP_NAME="backend-app"
LOG_FILE="$APP_DIR/deploy.log"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create log file if it doesn't exist
mkdir -p $(dirname "$LOG_FILE")
touch "$LOG_FILE"

log "Starting backend deployment..."

# Navigate to application directory
cd "$APP_DIR"

# Pull latest changes
log "Pulling latest changes..."
git pull origin main

# Install dependencies
log "Installing dependencies..."
npm ci --production

# Check if PM2 process exists
if pm2 show $PM2_APP_NAME > /dev/null; then
    log "Restarting PM2 process..."
    pm2 restart $PM2_APP_NAME
else
    log "Starting new PM2 process..."
    pm2 start npm --name $PM2_APP_NAME -- start
fi

log "Deployment completed successfully!"
