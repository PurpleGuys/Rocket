# BennesPro Production - Votre application TypeScript complète
FROM node:18-alpine

# Installer bash et outils nécessaires
RUN apk add --no-cache bash curl postgresql-client tini

# Créer utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bennespro -u 1001

# Définir le répertoire de travail
WORKDIR /opt/bennespro

# Copier package.json en premier pour cache Docker
COPY package*.json ./

# Installer toutes les dépendances
RUN npm ci

# Installer tsx globalement pour production TypeScript
RUN npm install -g tsx

# Copier tous les fichiers de configuration
COPY tsconfig.json vite.config.ts tailwind.config.ts postcss.config.js components.json ./

# Copier tout le code source complet
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY uploads/ ./uploads/

# Copier les fichiers de configuration supplémentaires
COPY drizzle.config.js ./
COPY .env* ./

# Créer les dossiers nécessaires et définir les permissions
RUN mkdir -p uploads client/dist logs migrations
RUN chown -R bennespro:nodejs . && chmod -R 755 uploads logs

# Variables d'environnement pour production
ENV NODE_ENV=production
ENV PORT=5000

# Utiliser l'utilisateur non-root
USER bennespro

# Exposer le port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Point d'entrée avec Tini
ENTRYPOINT ["/sbin/tini", "--"]

# Commande de démarrage avec votre vrai serveur TypeScript
CMD ["npx", "tsx", "server/index.ts"]