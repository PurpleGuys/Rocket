FROM node:18-alpine

# Installer les dépendances système
RUN apk add --no-cache \
    postgresql-client \
    curl \
    && rm -rf /var/cache/apk/*

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de configuration des packages
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier les fichiers source
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p logs uploads dist

# Construire l'application
RUN npm run build

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Changer la propriété des fichiers
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Commande de démarrage
CMD ["node", "dist/index.js"]