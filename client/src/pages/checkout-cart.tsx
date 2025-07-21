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
import { Calendar, AlertTriangle, CheckCircle, MapPin, Truck, Clock, CreditCard, Euro, Package, ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdBlockDetector from "@/components/AdBlockDetector";

// Fonction pour formater les prix
const formatPrice = (price: string | number) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toFixed(2);
};

function CheckoutForm({ cartItems, totalAmount, customerInfo }: { cartItems: any[]; totalAmount: number; customerInfo: any }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
      // Créer une commande depuis le panier
      const orderData = {
        items: cartItems,
        customer: customerInfo,
        totalAmount
      };

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?payment=success`,
        },
      });

      if (error) {
        toast({
          title: "Erreur de paiement",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Vider le panier après paiement réussi
        await apiRequest('/api/cart', 'DELETE');
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
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
          onClick={() => setLocation('/cart')}
          disabled={isProcessing}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au panier
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing || !acceptTerms}
          className="flex-1"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {isProcessing ? "Traitement..." : `Payer ${totalAmount.toFixed(2)}€`}
        </Button>
      </div>
    </form>
  );
}

export default function CheckoutCart() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  
  // Récupérer les infos client stockées
  const customerInfoStr = localStorage.getItem('customerInfo');
  const customerInfo = customerInfoStr ? JSON.parse(customerInfoStr) : null;

  // Charger le panier
  const { data: cartItems, isLoading: cartLoading } = useQuery({
    queryKey: ['/api/cart'],
  });

  // Calculer le total
  const totalAmount = cartItems?.reduce((sum: number, item: any) => {
    return sum + parseFloat(item.totalPrice || '0');
  }, 0) || 0;

  // Créer le payment intent quand le panier est chargé
  useEffect(() => {
    if (cartItems && cartItems.length > 0 && totalAmount > 0 && !clientSecret) {
      apiRequest("/api/create-payment-intent", "POST", {
        amount: totalAmount,
        items: cartItems.map((item: any) => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          price: item.totalPrice
        }))
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
  }, [cartItems, totalAmount, clientSecret, toast]);

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-12 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
              <p className="text-gray-600 mb-6">
                Ajoutez des bennes à votre panier avant de procéder au paiement.
              </p>
              <Button onClick={() => setLocation('/booking')}>
                Commencer une réservation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!customerInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-12 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-amber-500" />
              <h2 className="text-2xl font-bold mb-2">Informations client manquantes</h2>
              <p className="text-gray-600 mb-6">
                Veuillez retourner au panier pour compléter vos informations.
              </p>
              <Button onClick={() => setLocation('/cart')}>
                Retour au panier
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

              {/* Payment Form */}
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm cartItems={cartItems} totalAmount={totalAmount} customerInfo={customerInfo} />
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

            {/* Cart Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Résumé du panier</CardTitle>
                  <CardDescription>{cartItems.length} article{cartItems.length > 1 ? 's' : ''}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item: any) => (
                      <div key={item.id} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">
                              {item.service?.name || `Service ${item.serviceId}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.service?.volume}m³ - {item.wasteType?.name || 'Type de déchet'}
                            </p>
                          </div>
                          <span className="font-medium">{formatPrice(item.totalPrice)}€</span>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {item.deliveryCity}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(item.deliveryDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.deliveryTimeSlot}
                          </div>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    {/* Détail des prix */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Sous-total HT</span>
                        <span>{(totalAmount / 1.2).toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TVA (20%)</span>
                        <span>{(totalAmount - totalAmount / 1.2).toFixed(2)}€</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-lg">
                      <span>Total TTC</span>
                      <span className="text-primary">{totalAmount.toFixed(2)}€</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security badges */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      Paiement sécurisé
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      SSL 256-bit
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