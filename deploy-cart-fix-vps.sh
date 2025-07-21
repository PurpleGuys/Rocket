#!/bin/bash

echo "🚀 DÉPLOIEMENT RAPIDE CART FIX VPS"
echo "================================="

# Build the application
echo "📦 Building application..."
npm run build

# Copy files to VPS
echo "📤 Deploying to VPS..."
scp -r dist/* ubuntu@162.19.67.3:/home/ubuntu/REM-Bennes/dist/
scp server/routes.ts ubuntu@162.19.67.3:/home/ubuntu/REM-Bennes/server/
scp server/storage.ts ubuntu@162.19.67.3:/home/ubuntu/REM-Bennes/server/

# Restart application on VPS
echo "🔄 Restarting application..."
ssh ubuntu@162.19.67.3 "cd /home/ubuntu/REM-Bennes && sudo systemctl restart bennespro"

echo "✅ Deployment complete!"
echo "🌐 Test at: https://purpleguy.world"