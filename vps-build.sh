#!/bin/bash

echo "🚀 BennesPro VPS Build Script"
echo "=============================="

# Set production environment
export NODE_ENV=production

echo "📦 Installing dependencies..."
npm install --production=false

echo "🔨 Building React application..."
npm run build

# Check if build was successful
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build successful! Files created in /dist"
    ls -la dist/
else
    echo "❌ Build failed! No dist folder or index.html found"
    exit 1
fi

echo "🎯 Starting production server..."
echo "Run: NODE_ENV=production npm start"
echo "Or: NODE_ENV=production node server/index.js"

echo ""
echo "🌐 VPS Setup Complete!"
echo "Your application is ready to serve from the /dist folder"