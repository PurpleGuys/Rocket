import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Calendar,
  MapPin,
  Package,
  Home
} from "lucide-react";

export default function BookingConfirmationPage() {
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const [loading, setLoading] = useState(true);
  const [confirmationData, setConfirmationData] = useState<any>(null);

  useEffect(() => {
    // Get payment intent ID from URL
    const paymentIntentId = new URLSearchParams(searchParams).get('payment_intent');
    const paymentIntentClientSecret = new URLSearchParams(searchParams).get('payment_intent_client_secret');
    
    if (paymentIntentId || paymentIntentClientSecret) {
      // Payment successful - show confirmation
      setLoading(false);
      setConfirmationData({
        success: true,
        paymentIntentId: paymentIntentId || paymentIntentClientSecret
      });
    } else {
      // No payment info - redirect to booking
      navigate('/booking-new');
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Réservation confirmée !</h1>
        <p className="text-gray-600">Votre paiement a été traité avec succès</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Détails de votre réservation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Numéro de confirmation</span>
              <Badge variant="secondary" className="font-mono">
                {confirmationData?.paymentIntentId?.slice(-8).toUpperCase() || 'CONF-2025'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Conservez ce numéro pour toute correspondance future
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-semibold">Email de confirmation</p>
                <p className="text-sm text-gray-600">
                  Un email de confirmation a été envoyé avec tous les détails de votre réservation
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-semibold">Prochaines étapes</p>
                <p className="text-sm text-gray-600">
                  Notre équipe vous contactera dans les 24h pour confirmer les dates de livraison
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-semibold">Préparation de votre commande</p>
                <p className="text-sm text-gray-600">
                  Votre benne sera préparée selon vos spécifications
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Besoin d'aide ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-600">
            Si vous avez des questions concernant votre réservation :
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Appelez-nous au <strong>0 800 123 456</strong></li>
            <li>Envoyez un email à <strong>contact@remondis.fr</strong></li>
            <li>Référez-vous à votre numéro de confirmation</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          Retour à l'accueil
        </Button>
        
        <Button
          onClick={() => window.print()}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Imprimer la confirmation
        </Button>
      </div>
    </div>
  );
}