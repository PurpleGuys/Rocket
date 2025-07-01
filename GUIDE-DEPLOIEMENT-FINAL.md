# 🚀 GUIDE DÉPLOIEMENT PRODUCTION BENNESPRO

## VPS: 162.19.67.3 | Domain: purpleguy.world

---

## 📋 PRÉPARATION (5 minutes)

### 1. Validation du projet
```bash
./validate-deployment.sh
```

### 2. Export de la base de données
```bash
./export-database.sh
```

---

## 🚀 DÉPLOIEMENT AUTOMATIQUE (15 minutes)

### Commande unique pour tout déployer :
```bash
./deploy-production.sh
```

**Ce script fait TOUT automatiquement :**
- ✅ Build de l'application React + Node.js
- ✅ Transfer des fichiers vers le VPS
- ✅ Installation Node.js, Nginx, PostgreSQL, PM2
- ✅ Configuration base de données PostgreSQL
- ✅ Configuration Nginx avec reverse proxy
- ✅ Installation certificat SSL Let's Encrypt
- ✅ Démarrage de l'application avec PM2
- ✅ Configuration auto-restart et monitoring

---

## 🎯 RÉSULTAT FINAL

Après exécution du script, votre application BennesPro sera :

**🌐 ACCESSIBLE :**
- **URL principale :** https://purpleguy.world
- **Dashboard client :** https://purpleguy.world/dashboard
- **Interface admin :** https://purpleguy.world/admin
- **API :** https://purpleguy.world/api/*

**🔒 SÉCURISÉE :**
- Certificat SSL automatique
- Headers de sécurité configurés
- Base de données protégée
- Sessions sécurisées

**⚡ OPTIMISÉE :**
- Application en cluster avec PM2
- Nginx en reverse proxy
- Gestion automatique des erreurs
- Logs centralisés

---

## 📊 MONITORING ET MAINTENANCE

### Commandes utiles après déploiement :

```bash
# Status de l'application
ssh ubuntu@162.19.67.3 'pm2 status'

# Logs en temps réel
ssh ubuntu@162.19.67.3 'pm2 logs bennespro'

# Monitoring visuel
ssh ubuntu@162.19.67.3 'pm2 monit'

# Redémarrer l'application
ssh ubuntu@162.19.67.3 'pm2 restart bennespro'

# Status Nginx
ssh ubuntu@162.19.67.3 'sudo systemctl status nginx'

# Status PostgreSQL
ssh ubuntu@162.19.67.3 'sudo systemctl status postgresql'
```

### Vérification santé de l'application :
```bash
curl https://purpleguy.world/api/health
```

---

## 🔧 CONFIGURATION PRODUITE

### Structure sur le serveur :
```
/var/www/bennespro/
├── dist/           # Application compilée
├── client/         # Frontend React
├── server/         # Backend Node.js
├── shared/         # Types partagés
├── uploads/        # Fichiers uploadés
├── .env.production # Configuration production
└── ecosystem.config.js # Configuration PM2
```

### Services configurés :
- **Node.js 18** : Runtime application
- **Nginx** : Reverse proxy et serveur web
- **PostgreSQL** : Base de données
- **PM2** : Process manager
- **Certbot** : Gestion SSL

### Base de données :
- **Nom :** remondis_db
- **Utilisateur :** remondis_db
- **Mot de passe :** Remondis60110$
- **Port :** 5432

---

## 🎉 FONCTIONNALITÉS DÉPLOYÉES

Votre application BennesPro complète est maintenant en production avec :

### 👥 **Gestion utilisateurs**
- Inscription/connexion clients
- Dashboard administrateur
- Rôles et permissions

### 📦 **Gestion des services**
- Catalogue de bennes (Big Bag, 10m³, 18m³)
- Images et descriptions
- Tarification dynamique

### 🗺️ **Géolocalisation et tarification**
- Calcul automatique des distances
- Tarification transport aller-retour
- Intégration Google Maps

### 📋 **Gestion des commandes**
- Processus de commande complet
- Statuts et suivi
- Génération de FID (PDF)
- Notifications email

### 💳 **Paiement et facturation**
- Intégration Stripe (quand configuré)
- Gestion des devis
- Historique des commandes

### 📊 **Dashboard administrateur**
- Statistiques en temps réel
- Gestion des commandes
- Gestion des services
- Audit et logs

---

## ⚡ DÉPLOIEMENT EXPRESS

**Commande unique pour déployer MAINTENANT :**

```bash
./deploy-production.sh
```

**Temps total :** ~15 minutes
**Résultat :** Application BennesPro complète en production sur https://purpleguy.world

---

## 🆘 SUPPORT

En cas de problème, tous les logs sont disponibles :
- **Application :** `ssh ubuntu@162.19.67.3 'pm2 logs'`
- **Nginx :** `ssh ubuntu@162.19.67.3 'sudo tail -f /var/log/nginx/error.log'`
- **PostgreSQL :** `ssh ubuntu@162.19.67.3 'sudo tail -f /var/log/postgresql/postgresql-*.log'`

**🔥 VOTRE APPLICATION BENNESPRO EST PRÊTE POUR LA PRODUCTION !**