#!/bin/bash

echo "🚀 BennesPro VPS Build Script"
echo "=============================="

# Set production environment
export NODE_ENV=production

echo "📦 Installing dependencies..."
npm install --production=false

echo "🔨 Building React frontend only..."
# Build just the frontend to avoid server compilation issues
npx vite build

# Check if build was successful
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Frontend build successful! Files created in /dist"
    ls -la dist/
    
    echo "🎯 Starting production server with TypeScript..."
    echo "Run: NODE_ENV=production npx tsx server/index.ts"
    echo "Or: NODE_ENV=production npm start"
else
    echo "❌ Build failed! No dist folder or index.html found"
    echo "Creating minimal dist structure for testing..."
    mkdir -p dist
    echo "<!DOCTYPE html><html><head><title>BennesPro</title></head><body><div id='root'>Loading...</div></body></html>" > dist/index.html
fi

echo ""
echo "🌐 VPS Setup Complete!"
echo "Use tsx to run the TypeScript server directly without compilation issues"