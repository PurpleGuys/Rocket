# Use Node.js 18 LTS Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy application code
COPY . .

# Build frontend and backend avec script personnalisé
RUN chmod +x build-production.js && node build-production.js

# Ne pas supprimer les dépendances nécessaires pour la production
# Garder Vite et les outils de build disponibles

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Create necessary directories and change ownership
RUN mkdir -p uploads dist logs && \
    chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application in production mode
CMD ["npm", "start"]