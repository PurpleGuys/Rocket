# CORRECTION CALCUL DE DISTANCE

L'erreur "net::ERR_CONNECTION_REFUSED" sur /api/calculate-distance indique que :

1. L'endpoint n'existe pas ou n'est pas accessible
2. Le serveur Node.js n'est pas démarré sur le port 5000
3. Nginx ne fait pas correctement le proxy

## Solution :

1. Vérifier que l'endpoint existe dans server/routes.ts
2. S'assurer que le serveur est bien démarré : `pm2 status`
3. Vérifier la configuration Nginx : `sudo nginx -t`
4. Tester localement : `curl http://localhost:5000/api/calculate-distance`

## Si l'endpoint n'existe pas, utilisez directement /api/calculate-pricing qui inclut le calcul de distance.
