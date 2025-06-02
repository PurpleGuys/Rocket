import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { Service } from "@shared/schema";
import { Truck, AlertTriangle, MapPin, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ServiceSelection() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedWasteType, setSelectedWasteType] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [distance, setDistance] = useState(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [distanceError, setDistanceError] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['/api/services'],
  });

  // Récupérer les activités configurées depuis le panneau d'administration
  const { data: companyActivities } = useQuery({
    queryKey: ['/api/admin/company-activities'],
  });

  const service = services?.find((s: Service) => s.id === selectedServiceId);

  // Calcul automatique de la distance quand les données changent
  useEffect(() => {
    if (selectedServiceId && deliveryAddress && postalCode && city && selectedWasteType) {
      calculateDistance();
    }
  }, [selectedServiceId, deliveryAddress, postalCode, city, selectedWasteType]);

  // Fonction pour valider et calculer la distance
  const calculateDistance = async () => {
    if (!selectedServiceId || !deliveryAddress || !postalCode || !city || !selectedWasteType) {
      setDistance(0);
      return;
    }

    setIsCalculatingDistance(true);
    setDistanceError("");

    try {
      const response = await apiRequest('POST', '/api/calculate-pricing', {
        serviceId: selectedServiceId,
        wasteTypes: [selectedWasteType],
        address: deliveryAddress,
        postalCode: postalCode,
        city: city
      });
      
      const data = await response.json();
      
      if (data.success && data.distance) {
        setDistance(data.distance.kilometers);
        setDistanceError("");
      } else {
        setDistanceError(data.message || "Impossible de calculer la distance");
        setDistance(15); // Distance estimée par défaut
      }
    } catch (error: any) {
      console.error('Erreur calcul distance:', error);
      if (error.message.includes('Adresse du site industriel non configurée')) {
        setDistanceError("Configuration requise : veuillez configurer l'adresse du site industriel dans le panneau d'administration");
      } else {
        setDistanceError("Erreur lors du calcul de distance");
      }
      setDistance(15); // Distance estimée par défaut
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  // Fonction pour récupérer les suggestions d'adresses
  const fetchAddressSuggestions = async (input: string) => {
    if (input.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await apiRequest('GET', `/api/places/autocomplete?input=${encodeURIComponent(input)}`);
      const data = await response.json();
      
      if (data.suggestions) {
        setAddressSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Erreur autocomplétion:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedServiceId(service.id);
  };

  const handleWasteTypeChange = (wasteType: string) => {
    setSelectedWasteType(wasteType);
  };

  const handleAddressChange = (value: string) => {
    setDeliveryAddress(value);
    fetchAddressSuggestions(value);
  };

  const handleSuggestionSelect = (suggestion: any) => {
    setDeliveryAddress(suggestion.description);
    setShowSuggestions(false);
    
    // Extraire code postal et ville de la suggestion
    const parts = suggestion.description.split(', ');
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1];
      const postalMatch = lastPart.match(/\b\d{5}\b/);
      if (postalMatch) {
        setPostalCode(postalMatch[0]);
        const cityPart = lastPart.replace(postalMatch[0], '').trim();
        setCity(cityPart);
      }
    }
  };

  // Calculer le prix en fonction de la sélection
  const calculatePrice = () => {
    if (!service || distance === 0) {
      return { service: 0, transport: 0, total: 0, details: [] };
    }

    const servicePrice = parseFloat(service.basePrice);
    const transportPrice = Math.max(distance * 2 * 2.5, 150); // 2.5€/km aller-retour, minimum 150€
    const total = servicePrice + transportPrice;

    return {
      service: servicePrice,
      transport: transportPrice,
      total: total,
      details: [
        { label: "Service", amount: servicePrice },
        { label: `Transport (${distance.toFixed(1)} km)`, amount: transportPrice },
        { label: "Total TTC", amount: total }
      ]
    };
  };

  const priceCalculation = calculatePrice();

  // Fonction pour gérer la réservation
  const handleBooking = () => {
    if (!selectedServiceId || !selectedWasteType || !deliveryAddress || !postalCode || !city) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      });
      return;
    }

    if (!service) {
      toast({
        title: "Erreur",
        description: "Service non sélectionné",
        variant: "destructive",
      });
      return;
    }

    // Préparer les données de réservation
    const bookingDetails = {
      serviceId: selectedServiceId,
      serviceName: service.name,
      serviceVolume: service.volume,
      address: deliveryAddress,
      postalCode: postalCode,
      city: city,
      wasteTypes: [selectedWasteType],
      distance: distance * 2, // Distance aller-retour
      pricing: {
        service: priceCalculation.service,
        transport: priceCalculation.transport,
        total: priceCalculation.total
      }
    };

    // Sauvegarder dans sessionStorage et rediriger vers checkout
    sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    setLocation('/checkout');
  };

  // Obtenir les types de déchets disponibles
  const availableWasteTypes = companyActivities?.wasteTypes || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="ml-2 text-gray-600">Chargement des services...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des services. Veuillez réessayer.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left Column - Configuration */}
      <div className="lg:col-span-2 space-y-6">
        {/* Container Type Selection */}
        <div>
          <div className="flex items-center mb-4">
            <Truck className="h-5 w-5 mr-2 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Choisissez votre benne</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {services?.map((service: Service) => (
              <div
                key={service.id}
                className={`relative cursor-pointer transition-all ${
                  selectedServiceId === service.id ? "ring-2 ring-red-500" : ""
                }`}
                onClick={() => handleServiceSelect(service)}
              >
                <Card className={`${
                  selectedServiceId === service.id
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-300"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <span className="text-red-600 font-semibold">
                        {parseFloat(service.basePrice).toFixed(0)}€
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Volume: {service.volume}m³</p>
                    {selectedServiceId === service.id && (
                      <Badge className="bg-red-600 text-white">Sélectionné</Badge>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Waste Type Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Type de déchet</h3>
          {availableWasteTypes.length > 0 ? (
            <Select value={selectedWasteType} onValueChange={handleWasteTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez un type de déchet" />
              </SelectTrigger>
              <SelectContent>
                {availableWasteTypes.map((wasteType: string) => (
                  <SelectItem key={wasteType} value={wasteType}>
                    {wasteType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-center text-gray-500 py-4 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-sm">Aucun type de déchet configuré.</p>
              <p className="text-xs text-gray-400 mt-1">Contactez l'administrateur pour configurer les types de déchets.</p>
            </div>
          )}
        </div>

        {/* Address Section */}
        <div>
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 mr-2 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Adresse de livraison</h3>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                type="text"
                value={deliveryAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="Tapez votre adresse..."
                className="mt-1"
              />
              
              {/* Suggestions d'adresses */}
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {addressSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="font-medium">{suggestion.main_text}</div>
                      <div className="text-gray-500 text-xs">{suggestion.secondary_text}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {isLoadingSuggestions && (
                <div className="absolute right-3 top-9">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">Code postal *</Label>
                <Input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="75001"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Paris"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Distance et erreurs */}
          {isCalculatingDistance && (
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Calcul de la distance en cours...
            </div>
          )}
          
          {distanceError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{distanceError}</AlertDescription>
            </Alert>
          )}
          
          {distance > 0 && !isCalculatingDistance && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Distance calculée : {distance.toFixed(1)} km (aller-retour : {(distance * 2).toFixed(1)} km)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Price Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4 shadow-lg border-red-100">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Devis instantané</h3>
            
            {priceCalculation.total > 0 ? (
              <div className="space-y-3">
                {priceCalculation.details.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className={index >= priceCalculation.details.length - 1 ? "font-medium" : "text-gray-600"}>
                      {item.label}
                    </span>
                    <span className={index >= priceCalculation.details.length - 1 ? "font-medium" : ""}>
                      {item.amount.toFixed(2)}€
                    </span>
                  </div>
                ))}
                <hr className="border-gray-200" />
                <div className="flex justify-between text-xl font-bold text-red-600">
                  <span>Total TTC</span>
                  <span>{priceCalculation.total.toFixed(2)}€</span>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleBooking}
                  disabled={!selectedServiceId || !selectedWasteType || !deliveryAddress || !postalCode || !city}
                >
                  Réserver maintenant
                </Button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Sélectionnez une benne pour voir le prix</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}