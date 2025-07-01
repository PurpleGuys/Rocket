#!/bin/bash

echo "🔧 CORRECTION ERREUR ES MODULE - BENNESPRO"
echo "=========================================="

# Recréer le serveur Express avec la syntaxe ES modules
echo "📦 Correction du serveur Express..."
cat > server-express-prod.js << 'EOF'
#!/usr/bin/env node

/**
 * Serveur Express Production - BennesPro
 * Serveur simple qui utilise votre application complète
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Logging simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'BennesPro Express Server Running',
    version: '1.0.0'
  });
});

// Servir les fichiers statiques du frontend
const clientDistPath = path.join(__dirname, 'client', 'dist');

if (fs.existsSync(clientDistPath)) {
  console.log(`Frontend trouvé: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  
  // Route catch-all pour SPA
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      const indexPath = path.join(clientDistPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Frontend not built');
      }
    } else {
      res.status(404).json({ message: 'API endpoint not found' });
    }
  });
} else {
  console.log('Frontend dist non trouvé, mode API uniquement');
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.json({
        message: 'BennesPro Express Server',
        status: 'Frontend not built yet',
        instructions: 'Build frontend with: npm run build in client/ directory'
      });
    } else {
      res.status(404).json({ message: 'API endpoint not found' });
    }
  });
}

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BennesPro Express Server running on port ${PORT}`);
  console.log(`🌐 Access: http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/api/health`);
});

// Gestion des erreurs
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
EOF

echo "✅ Serveur Express corrigé avec syntaxe ES modules"

# Copier vers VPS et redémarrer
if [ "$1" == "deploy" ]; then
    echo "🚀 Déploiement de la correction sur VPS..."
    
    # Copier le fichier corrigé
    scp server-express-prod.js ubuntu@162.19.67.3:~/REM-Bennes/
    
    # Redémarrer le conteneur
    ssh ubuntu@162.19.67.3 << 'REMOTE'
        cd ~/REM-Bennes
        sudo docker-compose down
        sudo docker-compose up -d --build
        echo "🔄 Conteneur redémarré avec serveur Express corrigé"
REMOTE
    
    echo "✅ Correction déployée sur VPS"
fi

echo "🎯 Pour déployer: ./fix-module-error.sh deploy"