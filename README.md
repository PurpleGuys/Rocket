# Application de Gestion des Déchets Remondis

Une plateforme complète de gestion des déchets et de développement durable qui utilise des technologies intelligentes pour améliorer l'engagement environnemental.

## 🚀 Technologies Utilisées

- **Frontend**: React + TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Base de données**: PostgreSQL avec Drizzle ORM
- **Authentification**: Sessions sécurisées + JWT
- **Services externes**: SendGrid, Stripe, Google Maps API
- **Déploiement**: Docker, PM2, Nginx

## 📋 Prérequis

- Node.js 18+ 
- PostgreSQL 15+
- npm ou yarn

## 🛠️ Installation

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd remondis-app
```

### 2. Configuration de l'environnement
```bash
cp .env.example .env
# Modifier le fichier .env avec vos configurations
```

### 3. Installation des dépendances
```bash
npm install
```

### 4. Configuration de la base de données
```bash
# Créer la base de données PostgreSQL
createdb remondis_db

# Appliquer le schéma
npm run db:push
```

### 5. Démarrage en développement
```bash
npm run dev
```

L'application sera accessible sur http://localhost:5000

## 🔧 Configuration

### Variables d'environnement essentielles

```bash
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/remondis_db"

# Sécurité
SESSION_SECRET="votre-cle-secrete-32-caracteres-minimum"
JWT_SECRET="votre-cle-jwt-32-caracteres-minimum"

# Services externes
SENDGRID_API_KEY="votre-cle-sendgrid"
GOOGLE_MAPS_API_KEY="votre-cle-google-maps"
STRIPE_SECRET_KEY="votre-cle-stripe"
```

## 🚀 Déploiement

### Déploiement automatique
```bash
./deploy.sh production
```

### Déploiement avec Docker
```bash
docker-compose up -d
```

### Déploiement manuel

1. **Build de l'application**
   ```bash
   npm run build
   ```

2. **Installation PM2**
   ```bash
   npm install -g pm2
   ```

3. **Démarrage avec PM2**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

## 📁 Structure du Projet

```
.
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── hooks/         # Hooks personnalisés
│   │   └── lib/           # Utilitaires
├── server/                # Backend Node.js
│   ├── auth.ts           # Service d'authentification
│   ├── routes.ts         # Routes API
│   ├── storage.ts        # Interface de stockage
│   └── services/         # Services métier
├── shared/               # Code partagé
│   └── schema.ts         # Schémas de base de données
├── migrations/           # Migrations DB
└── dist/                # Build de production
```

## 🔐 Sécurité

### Authentification
- Sessions sécurisées avec cookies HttpOnly
- Tokens JWT pour l'API
- Hachage des mots de passe avec bcrypt
- Protection contre les attaques par force brute

### Sécurité des API
- Rate limiting configurable
- Validation des données avec Zod
- En-têtes de sécurité HTTP
- Protection CORS

### Base de données
- Connexions chiffrées
- Requêtes préparées (protection SQL injection)
- Audit trail complet

## 📊 Fonctionnalités

### Gestion des utilisateurs
- Inscription/connexion sécurisée
- Profils particuliers et professionnels
- Vérification par email
- Réinitialisation de mot de passe

### Gestion des commandes
- Réservation de services de collecte
- Calcul automatique des prix
- Suivi des livraisons
- Système de facturation

### Services de collecte
- Bennes de différentes tailles
- Collecte de déchets spécialisés
- Planification des créneaux
- Géolocalisation et calcul de distances

### Administration
- Tableau de bord administrateur
- Gestion des utilisateurs et commandes
- Statistiques et rapports
- Configuration des tarifs

### Système de notification
- Emails automatiques
- Notifications d'inactivité
- Suivi des commandes abandonnées
- Questionnaires de satisfaction

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev              # Démarrer en mode développement
npm run build           # Builder pour la production
npm run preview         # Prévisualiser le build

# Base de données
npm run db:push         # Appliquer le schéma
npm run db:studio       # Interface graphique DB
npm run db:generate     # Générer les migrations

# Tests et qualité
npm run lint            # Vérifier le code
npm run type-check      # Vérifier les types TypeScript

# Production
npm start               # Démarrer en production
pm2 start ecosystem.config.js
```

## 🐳 Docker

### Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production
```bash
docker-compose up -d
```

## 📋 API

### Endpoints principaux

```bash
# Authentification
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me

# Services
GET  /api/services
GET  /api/services/:id

# Commandes
POST /api/orders
GET  /api/orders
GET  /api/orders/:id
PUT  /api/orders/:id

# Administration
GET  /api/admin/users
GET  /api/admin/orders
GET  /api/admin/stats
```

## 🔍 Monitoring

### Logs
```bash
# PM2 logs
pm2 logs remondis-app

# Application logs
tail -f logs/combined.log
tail -f logs/err.log
```

### Monitoring PM2
```bash
pm2 monit
pm2 status
```

## 🛡️ Sauvegarde

### Base de données
```bash
# Sauvegarde
pg_dump remondis_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restauration
psql remondis_db < backup_file.sql
```

### Fichiers
```bash
# Sauvegarde des uploads et logs
tar -czf backup_files_$(date +%Y%m%d).tar.gz uploads/ logs/
```

## 🔄 Mise à jour

```bash
# Arrêter l'application
pm2 stop remondis-app

# Mettre à jour le code
git pull origin main

# Reinstaller les dépendances si nécessaire
npm ci --only=production

# Rebuild
npm run build

# Appliquer les migrations DB
npm run db:push

# Redémarrer
pm2 restart remondis-app
```

## 🐛 Dépannage

### Problèmes courants

1. **Erreur de connexion DB**
   - Vérifier DATABASE_URL dans .env
   - Vérifier que PostgreSQL est démarré

2. **Erreur de build**
   - Nettoyer node_modules: `rm -rf node_modules && npm install`
   - Vérifier les versions Node.js

3. **PM2 ne démarre pas**
   - Vérifier les logs: `pm2 logs`
   - Redémarrer PM2: `pm2 kill && pm2 start ecosystem.config.js`

### Logs utiles
```bash
# Logs de l'application
pm2 logs remondis-app --lines 100

# Logs Nginx (si utilisé)
tail -f /var/log/nginx/error.log

# Logs système
journalctl -u nginx -f
```

## 📞 Support

Pour toute question ou problème:
1. Vérifiez la documentation
2. Consultez les logs d'erreur
3. Vérifiez la configuration .env
4. Contactez l'équipe de développement

## 📄 Licence

Propriétaire - Remondis France