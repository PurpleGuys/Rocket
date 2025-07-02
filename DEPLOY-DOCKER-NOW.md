# 🚀 DÉPLOIEMENT DOCKER AUTOMATISÉ 100% FONCTIONNEL

## UNE SEULE COMMANDE POUR TOUT FAIRE !

```bash
./docker-deploy-auto.sh
```

**C'est tout ! Le script fait TOUT automatiquement :**

✅ Installe Docker et Docker Compose si manquants  
✅ Nettoie les anciens containers  
✅ Crée tous les fichiers de configuration  
✅ Build l'application complète  
✅ Lance PostgreSQL + Redis + App + Nginx  
✅ Configure le reverse proxy  
✅ Teste automatiquement tout  
✅ Affiche les logs en temps réel  

## RÉSULTAT FINAL

**Votre BennesPro sera accessible sur :**
- 🌐 **Site web:** http://localhost ou http://votre-ip
- 🔧 **API:** http://localhost/api
- 📊 **Santé:** http://localhost/api/health

## AVANT DE LANCER

1. **Éditez le fichier `.env`** avec vos vraies clés :
```bash
nano .env
```

2. **Ajoutez vos clés API :**
```env
SENDGRID_API_KEY=SG.votre_vraie_cle_sendgrid
GOOGLE_MAPS_API_KEY=votre_vraie_cle_google_maps  
STRIPE_SECRET_KEY=sk_live_ou_test_votre_cle_stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_ou_test_votre_cle_publique
```

## COMMANDES UTILES

**Statut des containers :**
```bash
docker-compose ps
```

**Voir les logs :**
```bash
docker-compose logs -f
```

**Redémarrer tout :**
```bash
docker-compose restart
```

**Arrêter tout :**
```bash
docker-compose down
```

**Nettoyer complètement :**
```bash
docker-compose down -v --remove-orphans
docker system prune -af
```

## ARCHITECTURE CRÉÉE

Le script crée automatiquement :

- **PostgreSQL 16** - Base de données principale
- **Redis 7** - Cache et sessions  
- **BennesPro App** - Votre application Node.js
- **Nginx** - Reverse proxy et HTTPS ready
- **Volumes persistants** - Données sauvegardées
- **Network isolé** - Sécurité renforcée
- **Health checks** - Monitoring automatique

## DÉPANNAGE

**Si ça ne marche pas :**

1. **Vérifiez Docker :**
```bash
docker --version
docker-compose --version
```

2. **Vérifiez les ports :**
```bash
netstat -tulpn | grep -E ':(80|443|5000|5432|6379)'
```

3. **Redémarrez tout :**
```bash
./docker-deploy-auto.sh  # Re-lance tout
```

4. **Logs détaillés :**
```bash
docker-compose logs app
docker-compose logs postgres  
docker-compose logs nginx
```

## PRODUCTION READY

✅ **Sécurité** - Utilisateurs non-root, networks isolés  
✅ **Performance** - Multi-stage builds, caching  
✅ **Monitoring** - Health checks automatiques  
✅ **Backup** - Volumes persistants  
✅ **SSL Ready** - Configuration HTTPS incluse  
✅ **Scalabilité** - Architecture microservices  

**Votre application sera 100% opérationnelle !**