# BennesPro Production - Express Simple
FROM node:18-alpine

# Installer les outils nécessaires
RUN apk add --no-cache bash curl

# Créer utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bennespro -u 1001

# Répertoire de travail
WORKDIR /app

# Copier et installer les dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier votre application complète
COPY . .

# Copier le serveur Express
COPY server-express-prod.js ./

# Créer les dossiers et permissions
RUN mkdir -p uploads logs client/dist
RUN chown -R bennespro:nodejs /app

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000

# Utilisateur non-root
USER bennespro

# Port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Démarrage Express simple
CMD ["node", "server-express-prod.js"]