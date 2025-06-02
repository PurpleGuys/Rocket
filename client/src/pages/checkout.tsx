import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface BookingDetails {
  serviceId: number;
  serviceName: string;
  serviceVolume: number;
  address: string;
  postalCode: string;
  city: string;
  wasteTypes: string[];
  distance: number;
  pricing: {
    service: number;
    transport: number;
    total: number;
  };
}

const CheckoutForm = ({ bookingDetails }: { bookingDetails: BookingDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-success',
        },
      });

      if (error) {
        toast({
          title: "Erreur de paiement",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement du paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Résumé de la commande */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Résumé de votre commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">{bookingDetails.serviceName}</h3>
            <p className="text-gray-600">Volume: {bookingDetails.serviceVolume}m³</p>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium">Adresse de livraison</h4>
            <p className="text-gray-600">
              {bookingDetails.address}<br />
              {bookingDetails.postalCode} {bookingDetails.city}
            </p>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium">Types de déchets</h4>
            <ul className="text-gray-600">
              {bookingDetails.wasteTypes.map((waste, index) => (
                <li key={index}>• {waste}</li>
              ))}
            </ul>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Service</span>
              <span>{bookingDetails.pricing.service.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span>Transport ({bookingDetails.distance} km aller-retour)</span>
              <span>{bookingDetails.pricing.transport.toFixed(2)}€</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total TTC</span>
              <span className="text-red-600">{bookingDetails.pricing.total.toFixed(2)}€</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de paiement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Paiement sécurisé</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection de la date souhaitée */}
            <div className="space-y-2">
              <Label htmlFor="preferred-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date souhaitée pour la livraison *
              </Label>
              <input
                id="preferred-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Minimum demain
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500">
                * La date vous sera confirmée par email. Si elle n'est pas disponible, 
                REMONDIS vous proposera une autre date selon ses disponibilités et vous en informera par email.
              </p>
            </div>

            <PaymentElement />
            
            {/* Mentions légales obligatoires */}
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-2">
              <h4 className="font-semibold text-gray-900">Informations légales :</h4>
              <ul className="space-y-1 text-xs">
                <li>• Prix TTC incluant TVA 20% applicable aux prestations de collecte</li>
                <li>• Prestation soumise au Code de l'environnement (déchets)</li>
                <li>• Traitement en centre agréé ICPE selon réglementation</li>
                <li>• Bordereau de suivi de déchets (BSD) fourni</li>
                <li>• Droit de rétractation : 14 jours (Art. L221-18 Code consommation)</li>
                <li>• Réclamations : service.client@remondis.fr</li>
              </ul>
            </div>
            
            <Button 
              type="submit" 
              disabled={!stripe || isProcessing}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? "Traitement..." : `Payer ${bookingDetails.pricing.total.toFixed(2)}€`}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              En finalisant votre commande, vous acceptez nos conditions générales de vente et notre politique de confidentialité.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Checkout() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Récupérer les détails de réservation depuis sessionStorage
    const details = sessionStorage.getItem('bookingDetails');
    if (!details) {
      toast({
        title: "Erreur",
        description: "Aucune réservation en cours. Retour à l'accueil.",
        variant: "destructive",
      });
      setLocation('/');
      return;
    }

    const parsedDetails = JSON.parse(details);
    setBookingDetails(parsedDetails);

    // Créer l'intention de paiement
    createPaymentIntent(parsedDetails);
  }, []);

  const createPaymentIntent = async (details: BookingDetails) => {
    try {
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: details.pricing.total,
        orderId: `booking-${Date.now()}`, // ID temporaire pour la réservation
        bookingDetails: details
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de préparer le paiement",
        variant: "destructive",
      });
      setLocation('/');
    }
  };

  if (!bookingDetails || !clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finaliser votre réservation</h1>
          <p className="text-gray-600 mt-2">Complétez votre paiement pour confirmer votre commande</p>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm bookingDetails={bookingDetails} />
        </Elements>
      </div>
    </div>
  );
}