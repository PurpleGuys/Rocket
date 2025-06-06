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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest } from "@/lib/queryClient";
import { Service } from "@shared/schema";
import { Truck, AlertTriangle, MapPin, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ServiceImageGallery } from "@/components/ui/service-image-gallery";

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
  const [priceData, setPriceData] = useState<any>(null);
  
  // Nouvelles variables pour la durée de location
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [durationDays, setDurationDays] = useState<number>(7); // Durée par défaut: 1 semaine

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['/api/services'],
  });

  // Récupérer les types de déchets configurés
  const { data: wasteTypes } = useQuery({
    queryKey: ['/api/waste-types'],
  });

  // Récupérer les tarifs de traitement
  const { data: treatmentPricing } = useQuery({
    queryKey: ['/api/treatment-pricing'],
  });

  const service = services ? services.find((s: Service) => s.id === selectedServiceId) : undefined;

  // Calculer automatiquement la date de fin basée sur la date de début et la durée
  useEffect(() => {
    if (startDate && durationDays > 0) {
      const calculatedEndDate = addDays(startDate, durationDays);
      setEndDate(calculatedEndDate);
    }
  }, [startDate, durationDays]);

  // Calcul automatique de la distance quand les données changent
  useEffect(() => {
    if (selectedServiceId && deliveryAddress && postalCode && city && selectedWasteType) {
      calculateDistance();
    }
  }, [selectedServiceId, deliveryAddress, postalCode, city, selectedWasteType, durationDays]);

  // Fonction pour valider et calculer la distance
  const calculateDistance = async () => {
    if (!selectedServiceId || !deliveryAddress || !postalCode || !city || !selectedWasteType) {
      setDistance(0);
      return;
    }

    setIsCalculatingDistance(true);
    setDistanceError("");

    try {
      // Convertir le nom du type de déchet en ID
      const wasteType = wasteTypes.find((wt: any) => wt.name === selectedWasteType);
      const wasteTypeId = wasteType ? wasteType.id : null;
      
      if (!wasteTypeId) {
        setDistanceError("Type de déchet non valide");
        return;
      }

      const response = await apiRequest('POST', '/api/calculate-pricing', {
        serviceId: selectedServiceId,
        wasteTypes: [wasteTypeId],
        address: deliveryAddress,
        postalCode: postalCode,
        city: city,
        durationDays: durationDays
      });
      
      const data = await response.json();
      
      if (data.success && data.distance) {
        setDistance(data.distance.kilometers);
        setPriceData(data); // Sauvegarder toutes les données de prix
        setDistanceError("");
      } else {
        setDistanceError(data.message || "Impossible de calculer la distance");
        setDistance(15); // Distance estimée par défaut
        setPriceData(null);
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
    if (!service || !priceData) {
      return { service: 0, transport: 0, treatment: 0, total: 0, details: [] };
    }

    const servicePrice = priceData.pricing?.service || parseFloat(service.basePrice);
    const durationSupplement = priceData.pricing?.durationSupplement || 0;
    const transportCost = priceData.pricing?.transport || 0;
    const totalTreatmentCost = priceData.pricing?.treatment || 0;
    const total = priceData.pricing?.total || (servicePrice + durationSupplement + transportCost + totalTreatmentCost);

    const details = [
      { label: "Service de base", amount: servicePrice },
    ];

    // Ajouter le supplément de durée si applicable
    if (durationSupplement > 0) {
      details.push({ label: `Supplément durée (${durationDays} jours)`, amount: durationSupplement });
    }

    const roundTripKm = priceData.distance?.roundTripKm || (distance * 2);
    details.push({ label: `Transport (${roundTripKm.toFixed(1)} km aller-retour)`, amount: transportCost });

    // Ajouter les détails des coûts de traitement si disponibles
    if (totalTreatmentCost > 0) {
      const maxTonnage = priceData.service?.maxTonnage || service.volume || 0;
      const wasteTypeName = selectedWasteType || "Déchets";
      details.push({ 
        label: `Traitement ${wasteTypeName} (${maxTonnage}T max)`, 
        amount: totalTreatmentCost 
      });
    }

    details.push({ label: "Total TTC", amount: total });

    return {
      service: servicePrice,
      transport: transportCost,
      treatment: totalTreatmentCost,
      total: total,
      details: details
    };
  };

  const priceCalculation = calculatePrice();

  // Fonction pour gérer la réservation
  const handleBooking = () => {
    if (!selectedServiceId || !selectedWasteType || !deliveryAddress || !postalCode || !city || !startDate || !endDate) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs requis y compris les dates de location",
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

    // Préparer les données de réservation avec les nouvelles informations de durée
    const bookingDetails = {
      serviceId: selectedServiceId,
      serviceName: service.name,
      serviceVolume: service.volume,
      address: deliveryAddress,
      postalCode: postalCode,
      city: city,
      wasteTypes: [selectedWasteType],
      distance: distance * 2, // Distance aller-retour
      // Nouvelles données de durée de location
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationDays: durationDays,
      deliveryDate: startDate.toISOString(), // Date de livraison = date de début
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

  // Obtenir les types de déchets disponibles depuis les configurations admin
  const availableWasteTypes = Array.isArray(wasteTypes) ? wasteTypes.map((wt: any) => wt.name) : [];

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
          <div className="grid lg:grid-cols-1 gap-6">
            {Array.isArray(services) && services.map((service: Service) => (
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
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Image de la benne */}
                      <div className="md:col-span-1">
                        {service.imageUrl && (
                          <img 
                            src={service.imageUrl} 
                            alt={service.name}
                            className="w-full h-32 object-contain bg-gray-50 rounded-lg"
                          />
                        )}
                      </div>
                      
                      {/* Informations principales */}
                      <div className="md:col-span-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                          <span className="text-red-600 font-bold text-xl">
                            {parseFloat(service.basePrice).toFixed(0)}€
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><strong>Volume:</strong> {service.volume}m³</p>
                          {service.length && service.width && service.height && (
                            <p><strong>Dimensions:</strong> {service.length}m × {service.width}m × {service.height}m</p>
                          )}
                          {service.description && (
                            <p className="text-gray-700 mt-2">{service.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Prestations incluses */}
                      <div className="md:col-span-1">
                        <h5 className="font-medium text-gray-900 mb-2">Prestations incluses</h5>
                        <div className="space-y-1">
                          {service.includedServices?.map((includedService: string, index: number) => (
                            <div key={index} className="flex items-center text-xs text-gray-600">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                              {includedService}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {selectedServiceId === service.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Badge className="bg-red-600 text-white">✓ Sélectionné</Badge>
                      </div>
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

          {/* Section Durée de location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-red-600" />
              Durée de location
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date de début */}
              <div>
                <Label>Date de début de location *</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setIsCalendarOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Durée en jours */}
              <div>
                <Label htmlFor="duration">Durée (jours) *</Label>
                <Select value={durationDays.toString()} onValueChange={(value) => setDurationDays(parseInt(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 jour</SelectItem>
                    <SelectItem value="3">3 jours</SelectItem>
                    <SelectItem value="7">1 semaine (7 jours)</SelectItem>
                    <SelectItem value="14">2 semaines (14 jours)</SelectItem>
                    <SelectItem value="21">3 semaines (21 jours)</SelectItem>
                    <SelectItem value="30">1 mois (30 jours)</SelectItem>
                    <SelectItem value="60">2 mois (60 jours)</SelectItem>
                    <SelectItem value="90">3 mois (90 jours)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Résumé des dates */}
            {startDate && endDate && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-sm text-blue-800">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">Période de location :</span>
                </div>
                <div className="mt-2 text-sm text-blue-700">
                  <div><strong>Début :</strong> {format(startDate, "EEEE d MMMM yyyy", { locale: fr })}</div>
                  <div><strong>Fin :</strong> {format(endDate, "EEEE d MMMM yyyy", { locale: fr })}</div>
                  <div><strong>Durée :</strong> {durationDays} jour{durationDays > 1 ? 's' : ''}</div>
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  📋 La livraison sera programmée le {format(startDate, "d MMMM yyyy", { locale: fr })} sauf en cas d'indisponibilité
                </div>
              </div>
            )}
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
                {priceCalculation.details.map((item, index) => {
                  const isTotal = item.label === "Total TTC";
                  const isSubItem = item.isSubItem;
                  
                  return (
                    <div key={index} className={`flex justify-between text-sm ${
                      isSubItem ? "ml-4 text-xs text-gray-500" : ""
                    }`}>
                      <span className={
                        isTotal ? "font-medium" : 
                        isSubItem ? "text-gray-500" : "text-gray-600"
                      }>
                        {item.label}
                      </span>
                      <span className={
                        isTotal ? "font-medium" : 
                        isSubItem ? "text-gray-500" : ""
                      }>
                        {item.amount.toFixed(2)}€
                      </span>
                    </div>
                  );
                })}
                
                {/* Affichage spécial du tonnage si disponible */}
                {priceData?.maxTonnage > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <div className="flex justify-between">
                      <span className="text-blue-800">Capacité / prix de traitement:</span>
                      <span className="text-blue-800 font-medium">{priceData.maxTonnage} tonnes</span>
                    </div>
                  </div>
                )}
                
                <hr className="border-gray-200" />
                <div className="flex justify-between text-xl font-bold text-red-600">
                  <span>Total TTC</span>
                  <span>{priceCalculation.total.toFixed(2)}€</span>
                </div>
                
                {/* Mentions légales TVA */}
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <p>• Prix TTC (TVA 20% incluse)</p>
                  <p>• Facture émise après prestation</p>
                  <p>• Conforme aux réglementations environnementales</p>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleBooking}
                  disabled={!selectedServiceId || !selectedWasteType || !deliveryAddress || !postalCode || !city || !startDate || !endDate}
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