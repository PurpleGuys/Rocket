import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Calendar } from "lucide-react";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    // Nettoyer les données de réservation temporaires
    sessionStorage.removeItem('bookingDetails');
    
    // Générer un numéro de commande temporaire (sera remplacé par celui de la DB)
    setOrderNumber(`CMD-${Date.now()}`);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                Paiement confirmé !
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-gray-600 mb-2">Votre commande a été traitée avec succès</p>
                <p className="font-semibold text-lg">Numéro de commande : {orderNumber}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-600" />
                  Prochaines étapes
                </h3>
                <ul className="text-left space-y-2 text-gray-600">
                  <li>• Un email de confirmation vous sera envoyé sous peu</li>
                  <li>• Notre équipe vous contactera pour confirmer la date de livraison</li>
                  <li>• La benne sera livrée à l'adresse indiquée</li>
                  <li>• Vous recevrez un appel avant la collecte</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/')}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger la facture
                </Button>
                <Button 
                  onClick={() => setLocation('/')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Retour à l'accueil
                </Button>
              </div>

              <div className="text-sm text-gray-500">
                <p>Une question ? Contactez-nous au <strong>01 23 45 67 89</strong></p>
                <p>ou par email à <strong>contact@remondis.fr</strong></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}