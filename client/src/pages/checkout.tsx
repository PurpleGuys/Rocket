import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  ShoppingCart, 
  MapPin, 
  Calendar, 
  Package, 
  CreditCard,
  CheckCircle,
  Loader2
} from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface BookingData {
  serviceId: number;
  wasteTypeId: number;
  deliveryDate: Date | null;
  pickupDate: Date | null;
  deliveryTimeSlotId: number | null;
  pickupTimeSlotId: number | null;
  address: string;
  city: string;
  postalCode: string;
  additionalInfo: string;
  rentalDays: number;
  transportPrice: number;
  treatmentPrice: number;
  rentalPrice: number;
  totalPrice: number;
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation`,
        },
        redirect: "if_required"
      });

      if (error) {
        // Show error to customer (e.g., insufficient funds)
        setErrorMessage(error.message || "Une erreur est survenue lors du paiement");
        toast({
          title: "Erreur de paiement",
          description: error.message,
          variant: "destructive"
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        toast({
          title: "Paiement réussi",
          description: "Votre réservation a été confirmée avec succès",
        });

        // Clear booking data
        localStorage.removeItem('bookingData');
        
        // Redirect to confirmation page
        navigate(`/booking-confirmation?payment_intent=${paymentIntent.id}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Une erreur inattendue s'est produite");
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Informations de paiement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement 
            options={{
              layout: "tabs",
              defaultValues: {
                billingDetails: {
                  email: '',
                  phone: '',
                  address: {
                    country: 'FR',
                  }
                }
              }
            }}
          />
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Payer maintenant
          </>
        )}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get booking data from localStorage
    console.log('Checkout page - checking localStorage');
    const storedData = localStorage.getItem('bookingData');
    console.log('Retrieved data from localStorage:', storedData);
    
    if (!storedData) {
      console.log('No booking data found in localStorage');
      toast({
        title: "Erreur",
        description: "Aucune réservation en cours. Veuillez recommencer.",
        variant: "destructive"
      });
      setTimeout(() => {
        navigate('/booking-new');
      }, 2000);
      return;
    }

    try {
      const data = JSON.parse(storedData);
      console.log('Parsed booking data:', data);
      
      // Parse dates back to Date objects
      data.deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : null;
      data.pickupDate = data.pickupDate ? new Date(data.pickupDate) : null;
      setBookingData(data);
      
      // Create payment intent
      createPaymentIntent(data);
    } catch (error) {
      console.error('Error parsing booking data:', error);
      toast({
        title: "Erreur",
        description: "Données de réservation invalides",
        variant: "destructive"
      });
      setTimeout(() => {
        navigate('/booking-new');
      }, 2000);
    }
  }, []);

  const createPaymentIntent = async (data: BookingData) => {
    try {
      console.log('Creating payment intent for:', data);
      
      const response = await apiRequest("/api/create-order-payment", "POST", {
        bookingData: data,
        amount: data.totalPrice
      });

      console.log('Payment intent response:', response);
      
      if (response && response.clientSecret) {
        setClientSecret(response.clientSecret);
      } else {
        throw new Error("Pas de client secret reçu");
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le paiement. Veuillez réessayer.",
        variant: "destructive"
      });
      setTimeout(() => {
        navigate('/booking-new');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !bookingData || !clientSecret) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#dc2626',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Finaliser votre commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Récapitulatif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Service Info */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Service
                </h4>
                <div className="text-sm space-y-1">
                  <p>Benne {bookingData.serviceId}</p>
                  <p className="text-gray-600">Type de déchet: {bookingData.wasteTypeId}</p>
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Dates
                </h4>
                <div className="text-sm space-y-1">
                  <p>
                    Livraison: {bookingData.deliveryDate 
                      ? format(bookingData.deliveryDate, "dd MMMM yyyy", { locale: fr })
                      : "Non définie"}
                  </p>
                  <p>
                    Récupération: {bookingData.pickupDate 
                      ? format(bookingData.pickupDate, "dd MMMM yyyy", { locale: fr })
                      : "Non définie"}
                  </p>
                  <Badge variant="secondary">
                    {bookingData.rentalDays} jour{bookingData.rentalDays > 1 ? 's' : ''} de location
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Address */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adresse de livraison
                </h4>
                <div className="text-sm space-y-1">
                  <p>{bookingData.address}</p>
                  <p>{bookingData.postalCode} {bookingData.city}</p>
                  {bookingData.additionalInfo && (
                    <p className="text-gray-600 italic">{bookingData.additionalInfo}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Pricing */}
              <div>
                <h4 className="font-semibold mb-2">Détail du prix</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span>{bookingData.rentalPrice.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport</span>
                    <span>{bookingData.transportPrice.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Traitement</span>
                    <span>{bookingData.treatmentPrice.toFixed(2)} €</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total TTC</span>
                    <span className="text-green-600">{bookingData.totalPrice.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <Elements stripe={stripePromise} options={stripeOptions}>
            <CheckoutForm />
          </Elements>

          {/* Security Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-900">Paiement sécurisé</p>
                <p>Vos informations de paiement sont cryptées et sécurisées par Stripe.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}