# CORRECTION ERREUR ADBLOCKER STRIPE

L'erreur "ERR_BLOCKED_BY_ADBLOCKER" empêche Stripe de fonctionner.

## Solutions :

### Pour les utilisateurs :
1. Désactiver l'AdBlocker pour le domaine purpleguy.world
2. Ajouter purpleguy.world à la liste blanche
3. Utiliser un navigateur sans AdBlocker
4. Tester en navigation privée

### Pour le développeur :
1. Ajouter une détection d'AdBlocker dans le frontend
2. Afficher un message d'avertissement
3. Proposer des alternatives de paiement

### Code à ajouter dans PaymentStep.tsx :

```typescript
// Détection AdBlocker
useEffect(() => {
  const checkAdBlocker = async () => {
    try {
      await fetch('https://js.stripe.com/v3/', { mode: 'no-cors' });
    } catch (error) {
      setShowAdBlockWarning(true);
    }
  };
  checkAdBlocker();
}, []);

// Afficher l'avertissement si AdBlocker détecté
{showAdBlockWarning && (
  <Alert variant="warning">
    <AlertTitle>AdBlocker détecté</AlertTitle>
    <AlertDescription>
      Veuillez désactiver votre bloqueur de publicités pour effectuer le paiement.
      Stripe est bloqué et empêche le traitement sécurisé de votre paiement.
    </AlertDescription>
  </Alert>
)}
```
