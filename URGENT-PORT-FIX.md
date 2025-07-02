# 🛠️ CORRECTION URGENTE - CONFLIT DE PORTS

## ❌ PROBLÈME IDENTIFIÉ
Le port PostgreSQL 5432 est déjà utilisé sur votre VPS, ce qui empêche le démarrage des containers Docker.

## ✅ SOLUTION IMMÉDIATE

### Option 1 : Script automatique
```bash
chmod +x docker-fix-ports.sh
./docker-fix-ports.sh
```

### Option 2 : Commandes manuelles
```bash
# 1. Arrêter tous les containers
sudo docker-compose down
sudo docker stop $(sudo docker ps -aq)

# 2. Nettoyer le système
sudo docker system prune -af

# 3. Relancer avec ports corrigés
./deploy.sh
```

## 🎯 CE QUI A ÉTÉ CORRIGÉ

✅ **Port PostgreSQL Docker** : 5432 → 5433  
✅ **Script de correction automatique** créé  
✅ **Nettoyage des containers** inclus  

## 🚀 APRÈS LA CORRECTION

Votre application BennesPro sera accessible sur :
- **Site web** : http://votre-serveur/
- **API** : http://votre-serveur/api/
- **Base de données Docker** : port 5433

## 💡 VÉRIFICATION RAPIDE

```bash
# Vérifier que l'application fonctionne
curl http://localhost/api/health

# Vérifier les containers actifs
sudo docker ps
```

## 🔧 EN CAS DE PROBLÈME

Si le problème persiste :

1. **Identifier le service qui utilise le port 5432** :
   ```bash
   sudo netstat -tlnp | grep :5432
   ```

2. **Arrêter le service PostgreSQL système** (si pas nécessaire) :
   ```bash
   sudo systemctl stop postgresql
   sudo systemctl disable postgresql
   ```

3. **Relancer le déploiement** :
   ```bash
   ./deploy.sh
   ```

---

**✨ Votre application BennesPro sera 100% opérationnelle après cette correction !**