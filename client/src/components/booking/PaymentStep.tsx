import { useState, useEffect } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useBookingState } from "@/hooks/useBookingState";
import { stripePromise } from "@/lib/stripe";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Lock, Shield } from "lucide-react";

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { bookingData, updateCustomer, setCurrentStep, calculateTotalPrice } = useBookingState();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    createAccount: false,
    acceptTerms: false,
    acceptMarketing: false,
  });

  const pricing = calculateTotalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
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

      const orderResponse = await apiRequest("POST", "/api/orders", orderData);
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
          
          {/* Stripe Payment Element */}
          <div className="mt-4">
            <PaymentElement />
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

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-lg py-4 h-auto"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Traitement...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 mr-2" />
            Payer {pricing.totalTTC.toFixed(2)}€
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-xs text-slate-500 flex items-center justify-center">
          <Shield className="h-4 w-4 mr-1" />
          Paiement sécurisé SSL 256-bit
        </p>
      </div>
    </form>
  );
}

export default function PaymentStep() {
  const { bookingData, calculateTotalPrice } = useBookingState();
  const [clientSecret, setClientSecret] = useState("");
  const pricing = calculateTotalPrice();

  useEffect(() => {
    if (bookingData.service) {
      // Create payment intent
      apiRequest("POST", "/api/create-payment-intent", {
        amount: pricing.totalTTC,
        orderId: `temp-${Date.now()}`, // Temporary ID
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error("Error creating payment intent:", error);
        });
    }
  }, [bookingData.service, pricing.totalTTC]);

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Lock className="h-6 w-6 mr-3 text-primary-600" />
        <h2 className="text-xl font-semibold text-slate-900">Paiement sécurisé</h2>
      </div>

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
