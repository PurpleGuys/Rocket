import { useState, useEffect } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBookingState } from "@/hooks/useBookingState";
import { stripePromise } from "@/lib/stripe";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Lock, Shield, AlertCircle, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { bookingData, updateCustomer, setCurrentStep, calculateTotalPrice } = useBookingState();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    createAccount: false,
    acceptTerms: false,
    acceptMarketing: false,
  });

  // Vérifier si Stripe est disponible
  useEffect(() => {
    const checkStripe = async () => {
      try {
        const stripeInstance = await stripePromise;
        if (!stripeInstance) {
          setStripeError("Stripe est bloqué par votre bloqueur de publicités. Veuillez le désactiver ou utiliser un autre mode de paiement.");
        }
      } catch (err) {
        setStripeError("Impossible de charger le module de paiement. Veuillez réessayer.");
      }
    };
    checkStripe();
  }, []);

  const pricing = calculateTotalPrice();

  // Sauvegarder les données dans sessionStorage pour la page checkout
  useEffect(() => {
    if (bookingData.service && bookingData.address && bookingData.deliveryTimeSlot) {
      const bookingDetails = {
        serviceId: bookingData.service.id,
        serviceName: bookingData.service.name,
        serviceVolume: bookingData.service.volume,
        address: bookingData.address.street,
        postalCode: bookingData.address.postalCode,
        city: bookingData.address.city,
        wasteTypes: bookingData.wasteTypes,
        distance: 0, // Distance calculée côté serveur
        pricing: {
          service: pricing.basePrice,
          transport: pricing.transportCost,
          total: pricing.totalTTC
        }
      };
      sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
      
      // Sauvegarder aussi les dates
      const bookingDates = {
        deliveryDate: bookingData.deliveryTimeSlot.date,
        pickupDate: bookingData.pickupTimeSlot?.date,
        deliveryTimeSlot: bookingData.deliveryTimeSlot,
        pickupTimeSlot: bookingData.pickupTimeSlot
      };
      localStorage.setItem('bookingDates', JSON.stringify(bookingDates));
    }
  }, [bookingData, pricing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Vérifier que toutes les données nécessaires sont présentes
    if (!bookingData.deliveryTimeSlot) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez sélectionner une date de livraison dans l'étape précédente.",
        variant: "destructive",
      });
      return;
    }

    if (!customerInfo.acceptTerms) {
      toast({
        title: "Conditions requises",
        description: "Vous devez accepter les conditions générales pour continuer.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const orderData = {
        serviceId: bookingData.service!.id,
        deliveryTimeSlotId: bookingData.deliveryTimeSlot?.id,
        pickupTimeSlotId: bookingData.pickupTimeSlot?.id,
        customerFirstName: customerInfo.firstName,
        customerLastName: customerInfo.lastName,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        deliveryStreet: bookingData.address!.street,
        deliveryCity: bookingData.address!.city,
        deliveryPostalCode: bookingData.address!.postalCode,
        deliveryCountry: bookingData.address!.country,
        deliveryNotes: bookingData.address!.deliveryNotes,
        durationDays: bookingData.durationDays,
        wasteTypes: bookingData.wasteTypes,
        status: "pending",
        paymentStatus: "pending",
      };

      const orderResponse = await apiRequest("/api/orders", "POST", orderData);
      const order = await orderResponse.json();

      // Update customer in booking state
      updateCustomer({
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        createAccount: customerInfo.createAccount,
      });

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}?order_id=${order.id}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Erreur de paiement",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Payment successful, move to confirmation
        toast({
          title: "Paiement réussi",
          description: "Votre commande a été confirmée avec succès!",
        });
        setCurrentStep(5);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du traitement de votre commande.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Vos informations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first-name">Prénom *</Label>
              <Input
                id="first-name"
                required
                value={customerInfo.firstName}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="last-name">Nom *</Label>
              <Input
                id="last-name"
                required
                value={customerInfo.lastName}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="create-account"
              checked={customerInfo.createAccount}
              onCheckedChange={(checked) => 
                setCustomerInfo(prev => ({ ...prev, createAccount: checked as boolean }))
              }
            />
            <Label htmlFor="create-account" className="text-sm">
              Créer un compte pour suivre mes commandes
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Mode de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup defaultValue="stripe">
            <div className="flex items-center space-x-2 p-4 border-2 border-primary-500 bg-primary-50 rounded-lg">
              <RadioGroupItem value="stripe" id="stripe" />
              <Label htmlFor="stripe" className="flex items-center flex-1">
                <CreditCard className="h-5 w-5 mr-3 text-primary-600" />
                <div>
                  <div className="font-medium">Carte bancaire</div>
                  <div className="text-sm text-slate-600">Paiement sécurisé via Stripe</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
          
          {/* Stripe Payment Element avec gestion AdBlock */}
          <div className="mt-4">
            {stripeError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Problème de chargement du paiement</div>
                  <div className="text-sm mb-3">{stripeError}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                      Réessayer
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        toast({
                          title: "Alternative de paiement",
                          description: "Contactez-nous pour un paiement manuel : contact@bennespro.fr",
                        });
                      }}
                    >
                      Paiement manuel
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <PaymentElement 
                options={{
                  layout: "tabs"
                }}
                onReady={() => setStripeError(null)}
                onError={(error) => setStripeError(error.message)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Conditions générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="accept-terms"
              required
              checked={customerInfo.acceptTerms}
              onCheckedChange={(checked) => 
                setCustomerInfo(prev => ({ ...prev, acceptTerms: checked as boolean }))
              }
            />
            <Label htmlFor="accept-terms" className="text-sm leading-relaxed">
              J'accepte les{' '}
              <a href="#" className="text-primary-600 hover:underline">conditions générales de vente</a>{' '}
              et la{' '}
              <a href="#" className="text-primary-600 hover:underline">politique de confidentialité</a> *
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="accept-marketing"
              checked={customerInfo.acceptMarketing}
              onCheckedChange={(checked) => 
                setCustomerInfo(prev => ({ ...prev, acceptMarketing: checked as boolean }))
              }
            />
            <Label htmlFor="accept-marketing" className="text-sm">
              J'accepte de recevoir des offres commerciales par email
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-4 h-auto"
          onClick={() => {
            // Sauvegarder les informations client avant de naviguer
            updateCustomer({
              firstName: customerInfo.firstName,
              lastName: customerInfo.lastName,
              email: customerInfo.email,
              phone: customerInfo.phone,
            });
            // Naviguer vers la page checkout séparée
            setLocation('/checkout');
          }}
        >
          <ExternalLink className="h-5 w-5 mr-2" />
          Continuer vers la page de paiement
        </Button>
        
        <div className="text-center text-sm text-gray-500">ou</div>
        
        <Button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-lg py-4 h-auto"
          disabled={!stripe || isProcessing || !!stripeError}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Traitement...
            </>
          ) : stripeError ? (
            <>
              <AlertCircle className="h-5 w-5 mr-2" />
              Paiement indisponible
            </>
          ) : (
            <>
              <Lock className="h-5 w-5 mr-2" />
              Payer {pricing.totalTTC.toFixed(2)}€
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500 flex items-center justify-center">
          <Shield className="h-4 w-4 mr-1" />
          Paiement sécurisé SSL 256-bit
        </p>
      </div>
    </form>
  );
}

// Composant de fallback anti-AdBlock avec instructions détaillées
function PaymentFallback() {
  const { toast } = useToast();
  const { bookingData, calculateTotalPrice, setCurrentStep } = useBookingState();
  const pricing = calculateTotalPrice();

  const handleManualOrder = () => {
    toast({
      title: "Commande enregistrée",
      description: "Votre commande a été enregistrée. Nous vous contacterons pour le paiement.",
    });
    setCurrentStep(5);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-2">Module de paiement bloqué par AdBlock</div>
          <div className="text-sm">
            Pour des raisons de sécurité, votre bloqueur de publicités empêche le chargement du système de paiement Stripe.
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Activer les paiements sécurisés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-800 mb-1">🛡️ Instructions AdBlock</div>
              <div className="text-blue-700 space-y-1">
                <div>1. Cliquez sur l'icône AdBlock dans votre navigateur</div>
                <div>2. Sélectionnez "Désactiver sur ce site"</div>
                <div>3. Rechargez la page</div>
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="font-medium text-green-800 mb-1">🔒 Sécurité Stripe</div>
              <div className="text-sm text-green-700">
                Stripe protège des millions de transactions. Vos données bancaires sont cryptées et sécurisées.
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleRetry} variant="outline" className="flex-1">
              <AlertCircle className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
            <Button onClick={handleManualOrder} className="flex-1 bg-red-600 hover:bg-red-700">
              Commande manuelle
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total de votre commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-lg">Montant à payer:</span>
            <span className="font-bold text-2xl text-red-600">{pricing.totalTTC.toFixed(2)}€</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentStep() {
  const { bookingData, calculateTotalPrice } = useBookingState();
  const [clientSecret, setClientSecret] = useState("");
  const [stripeError, setStripeError] = useState(false);
  const { toast } = useToast();
  const pricing = calculateTotalPrice();

  useEffect(() => {
    const checkStripeAndCreateIntent = async () => {
      try {
        // Vérifier si Stripe peut se charger
        const stripe = await stripePromise;
        if (!stripe) {
          setStripeError(true);
          return;
        }

        // Créer le payment intent
        if (bookingData.service) {
          const response = await apiRequest("/api/create-payment-intent", {
            method: "POST",
            body: JSON.stringify({
              amount: pricing.totalTTC,
              orderId: `temp-${Date.now()}`,
            })
          });
          const data = await response.json();
          setClientSecret(data.clientSecret);
        }
      } catch (error) {
        console.error("Erreur Stripe/Payment:", error);
        setStripeError(true);
      }
    };

    checkStripeAndCreateIntent();
  }, [bookingData.service, pricing.totalTTC]);

  // Si Stripe est bloqué, afficher le fallback
  if (stripeError) {
    return <PaymentFallback />;
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Finaliser la commande</h2>
        <p className="text-slate-600">Complétez vos informations et procédez au paiement</p>
      </div>
      
      {/* Résumé de la réservation */}
      <Card className="border-2 border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="h-6 w-6 mr-3" />
            Résumé de votre réservation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookingData.service && (
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-slate-600 font-medium">🚛 Service :</span>
              <span className="font-bold text-green-700">{bookingData.service.name}</span>
            </div>
          )}
          {bookingData.durationDays && (
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-slate-600 font-medium">⏱️ Durée :</span>
              <span className="font-bold text-green-700">{bookingData.durationDays} jour{bookingData.durationDays > 1 ? 's' : ''}</span>
            </div>
          )}
          {bookingData.address && (
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-slate-600 font-medium">📍 Adresse :</span>
              <span className="font-bold text-green-700 text-right">{bookingData.address.street}, {bookingData.address.postalCode} {bookingData.address.city}</span>
            </div>
          )}
          {bookingData.deliveryTimeSlot ? (
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-slate-600 font-medium">📅 Livraison :</span>
              <span className="font-bold text-green-700">
                {new Date(bookingData.deliveryTimeSlot.date).toLocaleDateString('fr-FR')} 
                {bookingData.deliveryTimeSlot.startTime && ` de ${bookingData.deliveryTimeSlot.startTime} à ${bookingData.deliveryTimeSlot.endTime}`}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg border border-red-300">
              <span className="text-red-600 font-medium">⚠️ Date de livraison :</span>
              <span className="font-bold text-red-700">Non sélectionnée</span>
            </div>
          )}
          {bookingData.pickupTimeSlot && (
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-slate-600 font-medium">🔄 Récupération :</span>
              <span className="font-bold text-green-700">
                {new Date(bookingData.pickupTimeSlot.date).toLocaleDateString('fr-FR')}
                {bookingData.pickupTimeSlot.startTime && ` de ${bookingData.pickupTimeSlot.startTime} à ${bookingData.pickupTimeSlot.endTime}`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Elements 
        stripe={stripePromise} 
        options={{ 
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#2563eb',
            },
          },
        }}
      >
        <CheckoutForm />
      </Elements>
    </div>
  );
}
