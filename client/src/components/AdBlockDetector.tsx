import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, ExternalLink, RefreshCw } from 'lucide-react';

interface AdBlockDetectorProps {
  onStripeReady?: () => void;
  children: React.ReactNode;
}

export const AdBlockDetector: React.FC<AdBlockDetectorProps> = ({ onStripeReady, children }) => {
  const [isAdBlockDetected, setIsAdBlockDetected] = useState(false);
  const [isStripeBlocked, setIsStripeBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const checkAdBlock = async () => {
    try {
      setIsLoading(true);
      
      // Test 1: Vérifier si les ressources Stripe sont accessibles
      const stripeTests = [
        'https://js.stripe.com/v3/',
        'https://r.stripe.com/b',
        'https://m.stripe.com/6'
      ];

      let stripeBlocked = false;
      
      for (const url of stripeTests) {
        try {
          const response = await fetch(url, { 
            method: 'HEAD', 
            mode: 'no-cors',
            cache: 'no-cache'
          });
          // Si on arrive ici, la ressource n'est pas bloquée
        } catch (error) {
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            stripeBlocked = true;
            break;
          }
        }
      }

      // Test 2: Vérifier les éléments DOM typiques des ad blockers
      const adBlockTest = document.createElement('div');
      adBlockTest.innerHTML = '&nbsp;';
      adBlockTest.className = 'adsbox';
      adBlockTest.style.position = 'absolute';
      adBlockTest.style.left = '-9999px';
      document.body.appendChild(adBlockTest);

      setTimeout(() => {
        const isAdBlocked = adBlockTest.offsetHeight === 0;
        document.body.removeChild(adBlockTest);
        
        setIsAdBlockDetected(isAdBlocked);
        setIsStripeBlocked(stripeBlocked);
        
        if (!isAdBlocked && !stripeBlocked && onStripeReady) {
          onStripeReady();
        }
        
        setIsLoading(false);
      }, 100);

    } catch (error) {
      console.error('Erreur lors de la détection AdBlock:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAdBlock();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Vérification des modules de paiement...</span>
      </div>
    );
  }

  if (isAdBlockDetected || isStripeBlocked) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            Module de paiement bloqué
          </CardTitle>
          <CardDescription>
            Votre bloqueur de publicités empêche le fonctionnement du système de paiement sécurisé.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription>
              <strong>Pourquoi ce message ?</strong><br />
              Les bloqueurs de publicités bloquent parfois les modules de paiement sécurisés comme Stripe
              pour des raisons de sécurité. Cette mesure protège vos données bancaires.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium">Solutions recommandées :</h4>
            <div className="pl-4 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-blue-600">1.</span>
                <div className="text-sm">
                  <strong>Désactiver temporairement votre bloqueur</strong> pour ce site uniquement
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-blue-600">2.</span>
                <div className="text-sm">
                  <strong>Mode navigation privée</strong> (souvent sans extensions)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-blue-600">3.</span>
                <div className="text-sm">
                  <strong>Autre navigateur</strong> sans bloqueur de publicités
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleRetry} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <a href="mailto:contact@bennespro.fr" className="flex items-center justify-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Nous contacter
              </a>
            </Button>
          </div>

          <div className="text-xs text-gray-500 border-t pt-3">
            <strong>Note technique :</strong> Cette vérification protège vos données en s'assurant que 
            les modules de paiement sécurisés fonctionnent correctement avant de traiter vos informations bancaires.
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default AdBlockDetector;