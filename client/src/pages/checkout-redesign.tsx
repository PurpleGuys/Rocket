import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, AlertTriangle, CheckCircle, MapPin, Truck, Clock, CreditCard, Euro, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export default function CheckoutRedesign() {
  const [bookingData, setBookingData] = useState<BookingDetails | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Récupérer les dates du localStorage
  const savedDates = localStorage.getItem('bookingDates');
  const parsedDates = savedDates ? JSON.parse(savedDates) : null;
  const [deliveryDate] = useState(parsedDates?.deliveryDate || "");
  const [pickupDate] = useState(parsedDates?.pickupDate || "");
  const [deliveryTimeSlot] = useState(parsedDates?.deliveryTimeSlot || null);
  
  // États pour les conditions
  const [evacuationConditions, setEvacuationConditions] = useState({
    heightLimit: false,
    noDangerousWaste: false,
    spaceRequirements: false,
    groundProtection: false,
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    const savedBooking = sessionStorage.getItem('bookingDetails');
    if (savedBooking) {
      setBookingData(JSON.parse(savedBooking));
    }
  }, []);

  const allConditionsAccepted = Object.values(evacuationConditions).every(v => v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allConditionsAccepted || !acceptTerms) {
      toast({
        title: "Conditions manquantes",
        description: "Veuillez accepter toutes les conditions avant de continuer",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryDate) {
      toast({
        title: "Date manquante",
        description: "Veuillez sélectionner une date de livraison",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const orderData = {
        serviceId: bookingData?.serviceId,
        wasteTypes: bookingData?.wasteTypes,
        deliveryDate: deliveryDate,
        pickupDate: pickupDate,
        address: bookingData?.address,
        postalCode: bookingData?.postalCode,
        city: bookingData?.city,
        evacuationConditions,
        acceptTerms
      };

      const response = await apiRequest('POST', '/api/orders', orderData);
      
      toast({
        title: "✅ Commande créée avec succès !",
        description: `Votre commande #${response.id} est confirmée.`,
      });
      
      // Nettoyer le stockage
      sessionStorage.removeItem('bookingDetails');
      localStorage.removeItem('bookingDates');
      
      setLocation('/dashboard');
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la commande",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-12 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <Truck className="h-16 w-16 mx-auto mb-6 text-gray-400" />
              <p className="text-xl text-gray-700 mb-8">
                Aucune réservation en cours. Commencez par sélectionner votre service.
              </p>
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                <a href="/booking">Commencer la réservation</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalisation de votre commande</h1>

        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Résumé de la commande */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Récapitulatif de votre réservation
                  </CardTitle>
                  <CardDescription>Vérifiez les détails de votre commande</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Service */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Truck className="h-5 w-5 mr-3 text-gray-600" />
                        <div>
                          <h3 className="font-semibold">{bookingData.serviceName}</h3>
                          <p className="text-sm text-gray-600">Volume: {bookingData.serviceVolume}m³</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{bookingData.pricing.service.toFixed(2)}€</span>
                    </div>
                  </div>

                  {/* Adresse */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-3 text-gray-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Adresse de livraison</h4>
                        <p className="text-sm text-gray-700">
                          {bookingData.address}<br />
                          {bookingData.postalCode} {bookingData.city}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Distance: {bookingData.distance} km aller-retour</p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="bg-white p-5 rounded-xl shadow-md">
                    <div className="flex items-start">
                      <Calendar className="h-6 w-6 mr-3 text-purple-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">📅 Planning</h4>
                        <div className="space-y-2">
                          {deliveryDate ? (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Livraison:</span>
                              <span className="font-medium">
                                {new Date(deliveryDate).toLocaleDateString('fr-FR')}
                                {deliveryTimeSlot && ` - ${deliveryTimeSlot.startTime} à ${deliveryTimeSlot.endTime}`}
                              </span>
                            </div>
                          ) : (
                            <Alert className="border-red-200 bg-red-50">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>Date de livraison non sélectionnée</AlertDescription>
                            </Alert>
                          )}
                          {pickupDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Récupération:</span>
                              <span className="font-medium">{new Date(pickupDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Types de déchets */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Types de déchets</h4>
                    <div className="flex flex-wrap gap-2">
                      {bookingData.wasteTypes.map((waste, index) => (
                        <Badge key={index} variant="secondary">
                          {waste}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conditions d'évacuation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-amber-600" />
                    Conditions d'évacuation obligatoires
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-amber-800 font-medium">Toutes les conditions doivent être acceptées :</p>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'heightLimit', label: "Je m'engage à ne pas dépasser la hauteur maximale de la benne" },
                      { key: 'noDangerousWaste', label: "Je certifie ne pas mettre de déchets dangereux" },
                      { key: 'spaceRequirements', label: "Je confirme disposer de l'espace nécessaire" },
                      { key: 'groundProtection', label: "Je protégerai le sol si nécessaire" }
                    ].map((condition) => (
                      <div key={condition.key} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <Checkbox
                          checked={evacuationConditions[condition.key as keyof typeof evacuationConditions]}
                          onCheckedChange={(checked) => 
                            setEvacuationConditions(prev => ({ ...prev, [condition.key]: !!checked }))
                          }
                          className="mt-1"
                        />
                        <label className="text-gray-700 cursor-pointer select-none">{condition.label}</label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Colonne de droite - Prix et paiement */}
            <div className="space-y-6">
              {/* Résumé des prix */}
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Total à payer
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span>Service</span>
                      <span className="font-medium">{bookingData.pricing.service.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span>Transport</span>
                      <span className="font-medium">{bookingData.pricing.transport.toFixed(2)}€</span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total TTC</span>
                      <span className="text-red-600">{bookingData.pricing.total.toFixed(2)}€</span>
                    </div>
                  </div>

                  {/* CGV */}
                  <div className="pt-4 border-t">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(!!checked)}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                        J'accepte les <a href="/cgv" className="text-blue-600 underline">conditions générales de vente</a>
                      </label>
                    </div>
                  </div>

                  {/* Bouton de paiement */}
                  <Button
                    type="submit"
                    disabled={!allConditionsAccepted || !acceptTerms || isProcessing || !deliveryDate}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full mr-3" />
                        Traitement...
                      </div>
                    ) : (
                      <span className="flex items-center justify-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Confirmer et payer {bookingData.pricing.total.toFixed(2)}€
                      </span>
                    )}
                  </Button>

                  {/* Sécurité */}
                  <div className="text-center text-xs text-gray-500 pt-2">
                    <p className="flex items-center justify-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Paiement sécurisé par Stripe
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}