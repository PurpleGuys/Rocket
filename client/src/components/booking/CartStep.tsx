import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBookingState } from "@/hooks/useBookingState";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, CheckCircle, Calendar, MapPin, Package, Euro, User } from "lucide-react";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";

export default function CartStep() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { bookingData, calculateTotalPrice } = useBookingState();
  const pricing = calculateTotalPrice();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    acceptTerms: false,
    acceptMarketing: false,
  });

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!customerInfo.acceptTerms) {
      toast({
        title: "Conditions requises",
        description: "Vous devez accepter les conditions générales pour continuer.",
        variant: "destructive",
      });
      return;
    }

    if (!bookingData.deliveryTimeSlot) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez sélectionner une date de livraison dans l'étape précédente.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Générer un ID de session
      let sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('session_id', sessionId);
      }

      // Ajouter au panier
      const cartResponse = await apiRequest("/api/cart/add", "POST", {
        serviceId: bookingData.service!.id,
        wasteTypeId: bookingData.wasteTypes[0] || 1,
        quantity: 1,
        transportDistance: pricing.distance || 10,
        transportPrice: pricing.deliveryFee.toFixed(2),
        rentalPrice: pricing.rentalPrice.toFixed(2),
        treatmentPrice: pricing.treatmentPrice.toFixed(2),
        totalPrice: pricing.totalTTC.toFixed(2),
        deliveryAddress: bookingData.address!.street,
        deliveryPostalCode: bookingData.address!.postalCode,
        deliveryCity: bookingData.address!.city,
        deliveryDate: bookingData.deliveryTimeSlot!.date,
        deliveryTimeSlot: `${bookingData.deliveryTimeSlot!.startTime} - ${bookingData.deliveryTimeSlot!.endTime}`,
        pickupDate: bookingData.pickupTimeSlot?.date,
        pickupTimeSlot: bookingData.pickupTimeSlot ? `${bookingData.pickupTimeSlot.startTime} - ${bookingData.pickupTimeSlot.endTime}` : '',
        notes: customerInfo.acceptMarketing ? "Accepte les communications marketing" : ""
      });

      // Stocker les infos client
      localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
      
      // Rediriger vers le panier
      toast({
        title: "✅ Ajouté au panier",
        description: "Votre benne a été ajoutée au panier avec succès !",
      });
      
      setTimeout(() => {
        setLocation('/cart');
      }, 500);
    } catch (error: any) {
      console.error('Cart error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter au panier",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Finaliser votre sélection</h2>
        <p className="text-slate-600">Complétez vos informations pour ajouter la benne au panier</p>
      </div>
      
      {/* Résumé de la réservation */}
      <Card className="border-2 border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="h-6 w-6 mr-3" />
            Résumé de votre sélection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bookingData.service && (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-green-600" />
                <span className="text-slate-600">Service</span>
              </div>
              <span className="font-bold text-green-700">{bookingData.service.name}</span>
            </div>
          )}
          
          {bookingData.address && (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="text-slate-600">Lieu</span>
              </div>
              <span className="font-bold text-green-700 text-right text-sm">
                {bookingData.address.city} ({bookingData.address.postalCode})
              </span>
            </div>
          )}
          
          {bookingData.deliveryTimeSlot && (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-slate-600">Livraison</span>
              </div>
              <span className="font-bold text-green-700">
                {new Date(bookingData.deliveryTimeSlot.date).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
          
          <Separator />
          
          <div className="pt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Prix HT</span>
              <span>{(pricing.totalTTC / 1.2).toFixed(2)}€</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">TVA (20%)</span>
              <span>{(pricing.totalTTC - pricing.totalTTC / 1.2).toFixed(2)}€</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-bold">Total TTC</span>
              <span className="font-bold text-green-700 text-lg">{pricing.totalTTC.toFixed(2)}€</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleAddToCart} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
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
          </CardContent>
        </Card>

        {/* Cart Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
              Information panier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Alert className="bg-blue-100 border-blue-300">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Votre benne sera ajoutée au panier. Vous pourrez :
                  <ul className="mt-2 ml-6 list-disc text-sm">
                    <li>Ajouter d'autres bennes si nécessaire</li>
                    <li>Modifier les quantités ou supprimer des articles</li>
                    <li>Procéder au paiement sécurisé quand vous êtes prêt</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <div className="pt-2 text-sm text-gray-600">
                <p>✓ Paiement sécurisé par Stripe</p>
                <p>✓ Modification possible avant paiement</p>
                <p>✓ Confirmation par email</p>
              </div>
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
                <a href="#" className="text-primary hover:underline">conditions générales de vente</a>{' '}
                et la{' '}
                <a href="#" className="text-primary hover:underline">politique de confidentialité</a> *
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
        <div>
          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-lg py-6 h-auto flex items-center justify-center"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin w-5 h-5 border-3 border-white border-t-transparent rounded-full mr-3" />
                Ajout en cours...
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-3" />
                Ajouter au panier - {pricing.totalTTC.toFixed(2)}€ TTC
              </>
            )}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center">
            <Euro className="h-4 w-4 mr-1" />
            Prix TTC incluant la TVA (20%)
          </p>
        </div>
      </form>
    </div>
  );
}