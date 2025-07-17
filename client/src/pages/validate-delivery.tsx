import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Check, X, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function ValidateDelivery() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [validationStatus, setValidationStatus] = useState<'loading' | 'valid' | 'expired' | 'error'>('loading');

  // Extraire les paramètres de l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const action = urlParams.get('action');

  useEffect(() => {
    // Vérifier si le token est valide au chargement
    if (!token) {
      setValidationStatus('error');
      return;
    }

    // Pour l'instant, on considère que le token est valide
    // En production, on ferait un appel API pour vérifier
    setValidationStatus('valid');
  }, [token]);

  const handleValidation = async (accepted: boolean) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await apiRequest(`/api/orders/validate-delivery-date/${token}`, 'POST', {
        accepted
      });

      toast({
        title: accepted ? "Date acceptée" : "Date refusée",
        description: accepted 
          ? "Merci ! Votre date de livraison est confirmée."
          : "Votre refus a été pris en compte. Nous vous proposerons une nouvelle date.",
      });

      // Rediriger vers une page de confirmation
      setTimeout(() => {
        setLocation('/');
      }, 3000);

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre réponse. Veuillez réessayer.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  // Auto-acceptation ou auto-refus si l'action est dans l'URL
  useEffect(() => {
    if (action && validationStatus === 'valid' && !isLoading) {
      if (action === 'accept') {
        handleValidation(true);
      } else if (action === 'reject') {
        handleValidation(false);
      }
    }
  }, [action, validationStatus]);

  if (validationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
            <p className="text-gray-600">Vérification de votre demande en cours</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (validationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Lien invalide</h2>
            <p className="text-gray-600 mb-4">
              Ce lien de validation n'est pas valide ou a expiré.
            </p>
            <Button onClick={() => setLocation('/')} className="bg-red-600 hover:bg-red-700">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (validationStatus === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Lien expiré</h2>
            <p className="text-gray-600 mb-4">
              Ce lien de validation a expiré. Veuillez contacter notre service client.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Email :</strong> contact@remondis.fr</p>
              <p><strong>Téléphone :</strong> 03 44 45 11 58</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si l'action est automatique, afficher un message de traitement
  if (action) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Traitement en cours...</h2>
            <p className="text-gray-600">
              {action === 'accept' ? 'Acceptation' : 'Refus'} de la date de livraison en cours
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
          <CalendarDays className="h-12 w-12 mx-auto mb-2" />
          <CardTitle className="text-2xl">Validation de date de livraison</CardTitle>
          <p className="text-red-100">REMONDIS France</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">
              Nouvelle date de livraison proposée
            </h3>
            <p className="text-gray-600 mb-4">
              Nous vous proposons une nouvelle date pour la livraison de votre benne.
              Merci de nous indiquer si cette date vous convient.
            </p>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
              <p className="font-semibold text-yellow-800">Date proposée</p>
              <p className="text-lg text-yellow-900">À définir selon la commande</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleValidation(true)}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              <Check className="h-5 w-5 mr-2" />
              ✓ J'accepte cette date
            </Button>
            
            <Button
              onClick={() => handleValidation(false)}
              disabled={isLoading}
              variant="outline"
              className="w-full border-red-600 text-red-600 hover:bg-red-50 py-3"
            >
              <X className="h-5 w-5 mr-2" />
              ✗ Je refuse cette date
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Ce lien expire dans 7 jours</p>
            <p className="mt-2">
              Besoin d'aide ? Contactez-nous au 03 44 45 11 58
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}