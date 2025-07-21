import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { stripePromise } from "@/lib/stripe";
import { Calendar, AlertTriangle, CheckCircle, MapPin, Truck, Clock, CreditCard, Euro, Package, ArrowLeft, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import AdBlockDetector from "@/components/AdBlockDetector";

function CheckoutForm({ cartItems, totalAmount }: { cartItems: any[]; totalAmount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Conditions requises",
        description: "Vous devez accepter les conditions générales pour continuer.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?order_id=${order.id}&payment=success`,
        },
      });

      if (error) {
        toast({
          title: "Erreur de paiement",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du traitement de votre paiement.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AdBlockDetector />
      
      <Card>
        <CardHeader>
          <CardTitle>Mode de paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement options={{ layout: "tabs" }} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conditions générales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="accept-terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            />
            <Label htmlFor="accept-terms" className="text-sm leading-relaxed">
              J'accepte les{' '}
              <a href="#" className="text-primary hover:underline">conditions générales de vente</a>{' '}
              et la{' '}
              <a href="#" className="text-primary hover:underline">politique de confidentialité</a> *
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setLocation('/booking')}
          disabled={isProcessing}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing || !acceptTerms}
          className="flex-1"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {isProcessing ? "Traitement..." : `Payer ${parseFloat(order.basePrice).toFixed(2)}€`}
        </Button>
      </div>
    </form>
  );
}

export default function CheckoutRedesign() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  
  // Récupérer l'ID de la commande et les infos client
  const orderId = localStorage.getItem('orderId');
  const customerInfoStr = localStorage.getItem('customerInfo');
  const customerInfo = customerInfoStr ? JSON.parse(customerInfoStr) : null;

  // Charger la commande
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
  });

  // Créer le payment intent quand la commande est chargée
  useEffect(() => {
    if (order && !clientSecret) {
      apiRequest("/api/create-order-payment", "POST", {
        orderId: order.id,
        amount: parseFloat(order.basePrice)
      })
      .then((response) => {
        if (response.clientSecret) {
          setClientSecret(response.clientSecret);
        }
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        toast({
          title: "Erreur",
          description: "Impossible de préparer le paiement. Veuillez réessayer.",
          variant: "destructive",
        });
      });
    }
  }, [order, clientSecret, toast]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-12 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-amber-500" />
              <h2 className="text-2xl font-bold mb-2">Aucune commande trouvée</h2>
              <p className="text-gray-600 mb-6">
                Veuillez d'abord créer une réservation sur la page de réservation.
              </p>
              <Button onClick={() => setLocation('/booking')}>
                Retour à la réservation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-12 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold mb-2">Commande introuvable</h2>
              <p className="text-gray-600 mb-6">
                La commande demandée n'existe pas ou a été supprimée.
              </p>
              <Button onClick={() => setLocation('/booking')}>
                Créer une nouvelle réservation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Finaliser votre commande</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Client Info Summary */}
              {customerInfo && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Informations client</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Nom:</strong> {customerInfo.firstName} {customerInfo.lastName}</p>
                      <p><strong>Email:</strong> {customerInfo.email}</p>
                      <p><strong>Téléphone:</strong> {customerInfo.phone}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Form */}
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm order={order} customerInfo={customerInfo} />
                </Elements>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">Préparation du paiement...</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                  <CardDescription>Commande #{order.orderNumber}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Package className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-500">Service</span>
                      </div>
                      <p className="font-medium">Service #{order.serviceId}</p>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center mb-2">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-500">Adresse de livraison</span>
                      </div>
                      <p className="text-sm">{order.deliveryStreet}</p>
                      <p className="text-sm">{order.deliveryPostalCode} {order.deliveryCity}</p>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-500">Dates</span>
                      </div>
                      <p className="text-sm">Livraison: {new Date(order.deliveryDate).toLocaleDateString('fr-FR')}</p>
                      <p className="text-sm">Enlèvement: {new Date(order.pickupDate).toLocaleDateString('fr-FR')}</p>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center mb-2">
                        <Euro className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-500">Montant total</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {parseFloat(order.basePrice).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}