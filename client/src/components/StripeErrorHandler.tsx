import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, ExternalLink, RefreshCw, CheckCircle } from 'lucide-react';

interface StripeErrorHandlerProps {
  children: React.ReactNode;
}

export const StripeErrorHandler: React.FC<StripeErrorHandlerProps> = ({ children }) => {
  const [hasStripeError, setHasStripeError] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkStripeAvailability = async () => {
      try {
        // Attendre un peu pour que Stripe se charge
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Vérifier si Stripe est disponible
        const testElement = document.createElement('div');
        testElement.innerHTML = '<script src="https://js.stripe.com/v3/"></script>';
        
        // Tester les domaines Stripe
        const stripeTests = [
          'https://js.stripe.com/v3/',
          'https://r.stripe.com/favicon.ico',
          'https://m.stripe.com/favicon.ico'
        ];

        let blocked = false;
        for (const url of stripeTests) {
          try {
            const response = await fetch(url, { 
              method: 'HEAD', 
              mode: 'no-cors',
              cache: 'no-store'
            });
          } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
              blocked = true;
              break;
            }
          }
        }

        setHasStripeError(blocked);
        setIsChecking(false);
      } catch (error) {
        console.error('Erreur lors de la vérification Stripe:', error);
        setHasStripeError(true);
        setIsChecking(false);
      }
    };

    checkStripeAvailability();
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[200px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Vérification des modules de paiement sécurisés...</p>
        </div>
      </div>
    );
  }

  if (hasStripeError) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl text-orange-800">
              Paiement temporairement indisponible
            </CardTitle>
            <CardDescription className="text-orange-700">
              Les modules de paiement sécurisés sont bloqués par votre navigateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Pourquoi ce message ?</strong><br />
                Votre bloqueur de publicités ou votre navigateur bloque les connexions vers Stripe, 
                notre processeur de paiement sécurisé, pour des raisons de sécurité.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Solutions rapides :</h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Désactiver votre bloqueur de publicités</h5>
                    <p className="text-sm text-gray-600">
                      Cliquez sur l'icône de votre bloqueur et sélectionnez "Désactiver sur ce site"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-green-600">2</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Navigation privée</h5>
                    <p className="text-sm text-gray-600">
                      Ouvrez ce site en navigation privée (Ctrl+Maj+N)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">3</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Autre navigateur</h5>
                    <p className="text-sm text-gray-600">
                      Essayez avec Chrome, Firefox, Safari ou Edge
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="flex-1"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
              <Button 
                onClick={() => window.open('mailto:contact@bennespro.fr?subject=Commande%20BennesPro&body=Bonjour,%0A%0AJe%20souhaite%20passer%20une%20commande%20mais%20j\'ai%20des%20problèmes%20de%20paiement%20en%20ligne.%0A%0AMerci%20de%20me%20contacter.', '_blank')}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Nous contacter
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-900">Alternative</span>
              </div>
              <p className="text-sm text-gray-600">
                Vous pouvez également nous contacter par email à{' '}
                <a href="mailto:contact@bennespro.fr" className="text-blue-600 hover:underline">
                  contact@bennespro.fr
                </a>{' '}
                pour passer votre commande par téléphone.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default StripeErrorHandler;