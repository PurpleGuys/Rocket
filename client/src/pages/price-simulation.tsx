import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CalendarDays, MapPin, Truck, Package, Calculator, AlertCircle, CheckCircle, Mail } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

interface Service {
  id: number;
  name: string;
  volume: number;
  basePrice: string;
  description?: string;
  imageUrl?: string;
  length?: string;
  width?: string;
  height?: string;
}

interface WasteType {
  id: number;
  name: string;
  description?: string;
}

interface PricingData {
  pricing: {
    service: number;
    durationSupplement: number;
    transport: number;
    treatment: number;
    total: number;
  };
  distance: {
    kilometers: number;
    roundTripKm: number;
    duration: number;
  };
  duration: {
    days: number;
    supplement: number;
  };
}

export default function PriceSimulation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<number[]>([]);
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [pickupDate, setPickupDate] = useState<Date | undefined>(addDays(new Date(), 8));
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Customer form for test orders
  const [customerData, setCustomerData] = useState({
    firstName: "Test",
    lastName: "Simulation",
    email: "test@simulation.fr",
    phone: "0123456789",
    company: "Entreprise Test",
    siret: "12345678901234",
    notes: "Commande de test pour simulation de prix"
  });

  // Fetch data
  const { data: services } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: wasteTypes } = useQuery({
    queryKey: ["/api/waste-types"],
  });

  const selectedService = Array.isArray(services) ? services.find((s: Service) => s.id === selectedServiceId) : null;

  // Calculate duration in days
  const durationDays = deliveryDate && pickupDate ? differenceInDays(pickupDate, deliveryDate) : 7;

  // Address autocomplete
  const handleAddressChange = async (value: string) => {
    setAddress(value);
    if (value.length > 3) {
      try {
        const response = await apiRequest(`/api/places/autocomplete?input=${encodeURIComponent(value)}`, "GET");
        const data = await response.json();
        setAddressSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Erreur autocomplete:", error);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectAddress = (suggestion: any) => {
    setAddress(suggestion.description);
    setPostalCode(suggestion.postal_code || "");
    setCity(suggestion.city || "");
    setShowSuggestions(false);
  };

  // Calculate pricing
  const calculatePricing = async () => {
    if (!selectedServiceId || !address || !postalCode || !city || selectedWasteTypes.length === 0) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    try {
      const response = await apiRequest("/api/calculate-pricing", "POST", {
        serviceId: selectedServiceId,
        address,
        postalCode,
        city,
        wasteTypes: selectedWasteTypes,
        deliveryDate: deliveryDate?.toISOString(),
        pickupDate: pickupDate?.toISOString(),
        durationDays
      });

      const data = await response.json();
      if (data.success) {
        setPricingData(data);
        toast({
          title: "Prix calculé",
          description: "Le devis a été calculé avec succès",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur de calcul",
        description: error.message || "Impossible de calculer le prix",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Create test order
  const createTestOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedServiceId || !pricingData) {
        throw new Error("Données manquantes");
      }

      const response = await apiRequest("/api/orders/test", "POST", {
        serviceId: selectedServiceId,
        wasteTypes: selectedWasteTypes,
        deliveryDate: deliveryDate?.toISOString(),
        pickupDate: pickupDate?.toISOString(),
        durationDays,
        address,
        postalCode,
        city,
        pricing: pricingData.pricing,
        customer: customerData,
        isTestOrder: true
      });

      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Commande test créée",
        description: `Numéro de commande: ${data.orderNumber}. Emails d'envoi en cours...`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la commande test",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulation de Prix</h1>
          <p className="text-gray-600">
            Testez le système de calcul de prix et de génération de commandes avec envoi d'emails
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-red-600" />
                  Choisissez votre benne
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(services) && services.map((service: Service) => (
                    <div
                      key={service.id}
                      className={`relative cursor-pointer transition-all border rounded-lg p-4 ${
                        selectedServiceId === service.id ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300"
                      }`}
                      onClick={() => setSelectedServiceId(service.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">Volume: {service.volume}m³</p>
                          {service.description && (
                            <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                          )}
                        </div>
                        <span className="text-red-600 font-bold text-xl">
                          {parseFloat(service.basePrice).toFixed(0)}€
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Waste Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-red-600" />
                  Types de déchets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(wasteTypes) && wasteTypes.map((wasteType: WasteType) => (
                    <div key={wasteType.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`waste-${wasteType.id}`}
                        checked={selectedWasteTypes.includes(wasteType.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedWasteTypes([...selectedWasteTypes, wasteType.id]);
                          } else {
                            setSelectedWasteTypes(selectedWasteTypes.filter(id => id !== wasteType.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={`waste-${wasteType.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {wasteType.name}
                        {wasteType.description && (
                          <span className="text-gray-500 ml-2">- {wasteType.description}</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2 text-red-600" />
                  Dates de livraison et enlèvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date de livraison</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {deliveryDate ? format(deliveryDate, "PPP", { locale: fr }) : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={deliveryDate}
                          onSelect={setDeliveryDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Date d'enlèvement</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {pickupDate ? format(pickupDate, "PPP", { locale: fr }) : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={pickupDate}
                          onSelect={setPickupDate}
                          disabled={(date) => date < (deliveryDate || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge variant="outline">
                    Durée: {durationDays} jour{durationDays > 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-600" />
                  Adresse de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="address">Adresse complète</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      placeholder="Tapez votre adresse..."
                      className="w-full"
                    />
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                        {addressSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => selectAddress(suggestion)}
                          >
                            {suggestion.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="75001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Paris"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Data for Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-red-600" />
                  Données client (pour test d'envoi d'emails)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Prénom</Label>
                    <Input
                      value={customerData.firstName}
                      onChange={(e) => setCustomerData({...customerData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <Input
                      value={customerData.lastName}
                      onChange={(e) => setCustomerData({...customerData, lastName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Email (pour recevoir les emails de test)</Label>
                    <Input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Entreprise</Label>
                    <Input
                      value={customerData.company}
                      onChange={(e) => setCustomerData({...customerData, company: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>SIRET</Label>
                    <Input
                      value={customerData.siret}
                      onChange={(e) => setCustomerData({...customerData, siret: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Notes</Label>
                  <Textarea
                    value={customerData.notes}
                    onChange={(e) => setCustomerData({...customerData, notes: e.target.value})}
                    placeholder="Notes pour la commande de test..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-lg border-red-100">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Simulation de Prix
                </h3>
                
                <div className="space-y-4">
                  <Button
                    onClick={calculatePricing}
                    disabled={isCalculating || !selectedServiceId || !address || selectedWasteTypes.length === 0}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {isCalculating ? "Calcul en cours..." : "Calculer le prix"}
                  </Button>

                  {pricingData && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Service de base</span>
                          <span>{pricingData.pricing.service.toFixed(2)}€</span>
                        </div>
                        
                        {pricingData.pricing.durationSupplement > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Supplément durée ({durationDays} jours)</span>
                            <span>{pricingData.pricing.durationSupplement.toFixed(2)}€</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <span>Transport ({pricingData.distance.roundTripKm.toFixed(1)} km aller-retour)</span>
                          <span>{pricingData.pricing.transport.toFixed(2)}€</span>
                        </div>
                        
                        {pricingData.pricing.treatment > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Traitement des déchets</span>
                            <span>{pricingData.pricing.treatment.toFixed(2)}€</span>
                          </div>
                        )}
                        
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total TTC</span>
                          <span className="text-red-600">{pricingData.pricing.total.toFixed(2)}€</span>
                        </div>
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Distance calculée: {pricingData.distance.kilometers.toFixed(1)} km
                          <br />
                          Temps de trajet: {pricingData.distance.duration} minutes
                        </AlertDescription>
                      </Alert>

                      <Button
                        onClick={() => createTestOrderMutation.mutate()}
                        disabled={createTestOrderMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {createTestOrderMutation.isPending ? "Création..." : "Créer commande test (0€)"}
                      </Button>

                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          La commande test sera créée à 0€ pour tester uniquement l'envoi d'emails et le workflow.
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}