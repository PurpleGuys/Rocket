# Configuration DNS pour purpleguy.world

## ÉTAPE OBLIGATOIRE avant déploiement HTTPS

Avant d'exécuter le script `https-deployment.sh`, vous devez configurer votre DNS pour que le domaine purpleguy.world pointe vers votre serveur VPS.

## Enregistrements DNS requis

Dans votre panneau de gestion DNS (chez votre registraire de domaine), ajoutez ces enregistrements:

```
Type: A
Nom: @
Valeur: 162.19.67.3
TTL: 300

Type: A
Nom: www
Valeur: 162.19.67.3
TTL: 300
```

## Vérification DNS

Avant de lancer le déploiement, vérifiez que le DNS est correctement configuré:

```bash
# Vérifier le domaine principal
dig +short purpleguy.world

# Vérifier le sous-domaine www
dig +short www.purpleguy.world

# Les deux commandes doivent retourner: 162.19.67.3
```

## Délai de propagation

La propagation DNS peut prendre de 5 minutes à 48 heures selon votre fournisseur. Généralement:

- **Cloudflare**: 2-5 minutes
- **OVH**: 15-30 minutes  
- **GoDaddy**: 1-2 heures
- **Other providers**: 2-24 heures

## Test de propagation

Utilisez ces outils en ligne pour vérifier la propagation:

- https://dnschecker.org/
- https://whatsmydns.net/

Entrez `purpleguy.world` et vérifiez que l'IP `162.19.67.3` apparaît dans toutes les régions.

## Configuration complète après propagation

Une fois le DNS propagé, lancez le déploiement HTTPS:

```bash
chmod +x https-deployment.sh
./https-deployment.sh
```

## Dépannage DNS

Si le DNS ne se propage pas:

1. **Vérifiez les enregistrements** dans votre panneau de contrôle
2. **Contactez votre registraire** si le problème persiste
3. **Utilisez des serveurs DNS publics** pour tester:
   ```bash
   dig @8.8.8.8 purpleguy.world
   dig @1.1.1.1 purpleguy.world
   ```

## Après déploiement HTTPS

Votre site sera disponible sur:
- https://purpleguy.world
- https://www.purpleguy.world

Toutes les requêtes HTTP seront automatiquement redirigées vers HTTPS.