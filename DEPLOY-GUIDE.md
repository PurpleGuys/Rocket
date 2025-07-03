# BennesPro - Guide de Déploiement Docker

## 🚀 Déploiement en une seule commande

### Pour développement local (localhost)
```bash
chmod +x deploy-corrected.sh
./deploy-corrected.sh
```
- Appuyez sur **Entrée** quand demandé pour le domaine
- L'application sera disponible sur `http://localhost:8080`

### Pour production avec HTTPS
```bash
chmod +x deploy-corrected.sh
./deploy-corrected.sh
```
- Entrez votre nom de domaine (ex: `bennespro.com`)
- Entrez votre email pour Let's Encrypt
- Suivez les instructions pour générer le certificat SSL

## 🔧 Configuration automatique

Le script configure automatiquement :
- ✅ PostgreSQL (port 5433)
- ✅ Redis (port 6379)
- ✅ Application Node.js (port 8080)
- ✅ NGINX avec HTTPS (production seulement)
- ✅ Certificats SSL Let's Encrypt (production seulement)

## 🛠️ Commandes utiles

### Vérifier l'état des services
```bash
sudo docker-compose ps
```

### Voir les logs
```bash
sudo docker-compose logs -f
```

### Arrêter les services
```bash
sudo docker-compose down
```

### Redémarrer complètement
```bash
sudo docker-compose down --volumes
./deploy-corrected.sh
```

## 📋 Ports utilisés

- **8080** : Application web principale
- **5433** : PostgreSQL (exposé pour debug)
- **6379** : Redis (exposé pour debug)
- **80/443** : NGINX (production HTTPS uniquement)

## 🔐 Variables d'environnement

Le script configure automatiquement :
- Base de données PostgreSQL
- Clés JWT sécurisées
- Configuration Redis
- Variables optionnelles (Stripe, SendGrid, Google Maps)

## ⚠️ Prérequis

- Docker et Docker Compose installés
- Ports 8080, 5433, 6379 disponibles
- Pour production : domaine pointant vers le serveur

## 🎯 Résolution de problèmes

### L'application ne démarre pas
```bash
sudo docker-compose logs app
```

### Problème PostgreSQL
```bash
sudo docker-compose logs postgres
```

### Problème Redis
```bash
sudo docker-compose logs redis
```

### Réinitialisation complète
```bash
sudo docker system prune -a -f --volumes
./deploy-corrected.sh
```

## 🌐 Accès à l'application

- **Local** : http://localhost:8080
- **Production** : https://votre-domaine.com

L'application inclut :
- Interface client complète
- Tableau de bord administrateur
- API REST complète
- Authentification JWT
- Gestion des commandes et paiements