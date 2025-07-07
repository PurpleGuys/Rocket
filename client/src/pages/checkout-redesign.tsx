import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, AlertTriangle, CheckCircle, MapPin, Truck, Clock, CreditCard } from "lucide-react";
import GradientBackground from "@/components/ui/gradient-background";

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
      <GradientBackground>
        <div className="container mx-auto py-12 px-4">
          <Card className="max-w-2xl mx-auto border-2 border-orange-200 shadow-xl">
            <CardContent className="p-12 text-center">
              <Truck className="h-16 w-16 mx-auto mb-6 text-orange-500" />
              <p className="text-xl text-gray-700 mb-8">
                Aucune réservation en cours. Commencez par sélectionner votre service.
              </p>
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold">
                <a href="/booking">🚀 Commencer la réservation</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">✨ Finalisation de votre commande</h1>
          <p className="text-xl text-slate-600">Vérifiez les détails et confirmez votre réservation</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-8">
              {/* Résumé de la commande */}
              <Card className="border-2 border-green-200 shadow-2xl bg-gradient-to-br from-white to-green-50/30">
                <CardHeader className="bg-green-600 text-white rounded-t-xl p-6">
                  <CardTitle className="text-2xl flex items-center">
                    <CheckCircle className="mr-3 h-7 w-7" />
                    📋 Récapitulatif de votre réservation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {/* Service */}
                  <div className="bg-white p-5 rounded-xl shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Truck className="h-6 w-6 mr-3 text-green-600" />
                        <div>
                          <h3 className="font-bold text-lg">{bookingData.serviceName}</h3>
                          <p className="text-gray-600">Volume: {bookingData.serviceVolume}m³</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-green-700">{bookingData.pricing.service.toFixed(2)}€</span>
                    </div>
                  </div>

                  {/* Adresse */}
                  <div className="bg-white p-5 rounded-xl shadow-md">
                    <div className="flex items-start">
                      <MapPin className="h-6 w-6 mr-3 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">📍 Adresse de livraison</h4>
                        <p className="text-gray-700">
                          {bookingData.address}<br />
                          {bookingData.postalCode} {bookingData.city}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Distance: {bookingData.distance} km aller-retour</p>
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
                  <div className="bg-white p-5 rounded-xl shadow-md">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <span className="text-2xl mr-2">♻️</span> Types de déchets
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {bookingData.wasteTypes.map((waste, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {waste}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conditions d'évacuation */}
              <Card className="border-2 border-orange-200 shadow-2xl">
                <CardHeader className="bg-orange-500 text-white rounded-t-xl">
                  <CardTitle className="flex items-center text-xl">
                    <AlertTriangle className="mr-3 h-6 w-6" />
                    ⚠️ Conditions d'évacuation obligatoires
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-orange-800 font-medium">Toutes les conditions doivent être acceptées :</p>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'heightLimit', label: "Je m'engage à ne pas dépasser la hauteur maximale de la benne" },
                      { key: 'noDangerousWaste', label: "Je certifie ne pas mettre de déchets dangereux" },
                      { key: 'spaceRequirements', label: "Je confirme disposer de l'espace nécessaire" },
                      { key: 'groundProtection', label: "Je protégerai le sol si nécessaire" }
                    ].map((condition) => (
                      <div key={condition.key} className="flex items-start space-x-3 p-3 hover:bg-orange-50 rounded-lg transition-colors">
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
              <Card className="border-2 border-blue-200 shadow-2xl sticky top-4">
                <CardHeader className="bg-blue-600 text-white rounded-t-xl">
                  <CardTitle className="text-xl flex items-center">
                    <CreditCard className="mr-3 h-6 w-6" />
                    💳 Total à payer
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
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Total TTC</span>
                      <span className="text-blue-600">{bookingData.pricing.total.toFixed(2)}€</span>
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
                    className="w-full py-6 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
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
    </GradientBackground>
  );
}