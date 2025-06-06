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
import { Truck, AlertTriangle, MapPin, Calendar as CalendarIcon, Loader2, Building2, Construction, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ServiceImageGallery } from "@/components/ui/service-image-gallery";
import FidForm from "./FidForm";

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
  
  // Variables pour la sélection du lieu de livraison
  const [deliveryLocationType, setDeliveryLocationType] = useState<"company" | "construction_site">("company");
  const [constructionSiteContactPhone, setConstructionSiteContactPhone] = useState("");
  
  // Nouvelles variables pour la durée de location
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [durationDays, setDurationDays] = useState<number>(7); // Durée par défaut: 1 semaine
  
  // Variables pour l'option BSD et FID
  const [bsdOption, setBsdOption] = useState<boolean>(false); // BSD optionnel par défaut
  const [fidData, setFidData] = useState<any>(null);
  const [showFidForm, setShowFidForm] = useState(false);

  // Queries pour récupérer les données
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

  // Récupérer les données utilisateur pour l'adresse de l'entreprise
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  const service = Array.isArray(services) ? services.find((s: Service) => s.id === selectedServiceId) : undefined;

  // Calculer automatiquement la date de fin basée sur la date de début et la durée
  useEffect(() => {
    if (startDate && durationDays > 0) {
      const calculatedEndDate = addDays(startDate, durationDays);
      setEndDate(calculatedEndDate);
    }
  }, [startDate, durationDays]);

  // Pré-remplir automatiquement l'adresse de l'entreprise quand sélectionnée
  useEffect(() => {
    if (deliveryLocationType === "company" && user && typeof user === 'object') {
      // Construire l'adresse complète de l'entreprise
      const userAddress = (user as any).address || '';
      const userPostalCode = (user as any).postalCode || '';
      const userCity = (user as any).city || '';
      const companyAddress = `${userAddress}, ${userPostalCode} ${userCity}`.trim();
      
      if (companyAddress !== ', ') {
        setDeliveryAddress(companyAddress);
        setPostalCode(userPostalCode);
        setCity(userCity);
        
        // Calculer automatiquement la distance pour l'adresse de l'entreprise
        if (companyAddress.length > 10) {
          calculateDistance(companyAddress);
        }
      }
    } else if (deliveryLocationType === "construction_site") {
      // Réinitialiser les champs pour un chantier spécifique
      setDeliveryAddress('');
      setPostalCode('');
      setCity('');
      setDistance(0);
    }
  }, [deliveryLocationType, user]);

  // Calcul automatique de la distance quand les données changent
  useEffect(() => {
    if (selectedServiceId && deliveryAddress && postalCode && city && selectedWasteType) {
      calculatePricing();
    }
  }, [selectedServiceId, deliveryAddress, postalCode, city, selectedWasteType, distance, startDate, endDate, durationDays, bsdOption]);

  // Fonction pour calculer la distance
  const calculateDistance = async (address: string) => {
    if (!address || address.length < 5) return;

    setIsCalculatingDistance(true);
    setDistanceError("");
    
    try {
      const response = await fetch('/api/calculate-distance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: address.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setDistance(data.distance);
      } else {
        setDistanceError(data.error || "Erreur lors du calcul de distance");
        setDistance(0);
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
      setDistanceError("Impossible de calculer la distance");
      setDistance(0);
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  // Fonction pour calculer le prix total
  const calculatePricing = async () => {
    if (!selectedServiceId || !selectedWasteType || !deliveryAddress) return;

    try {
      const response = await fetch('/api/calculate-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          wasteType: selectedWasteType,
          address: deliveryAddress,
          distance: distance,
          durationDays: durationDays,
          bsdOption: bsdOption
        })
      });

      const data = await response.json();

      if (data.success) {
        setPriceData(data.pricing);
      }
    } catch (error) {
      console.error('Pricing calculation error:', error);
    }
  };

  // Fonction pour gérer les suggestions d'adresses
  const handleAddressChange = async (value: string) => {
    setDeliveryAddress(value);
    
    if (value.length > 3) {
      setIsLoadingSuggestions(true);
      try {
        const response = await apiRequest(`/api/places/autocomplete?input=${encodeURIComponent(value)}`);
        if (response.suggestions) {
          setAddressSuggestions(response.suggestions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Address suggestions error:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Fonction pour sélectionner une suggestion d'adresse
  const handleSuggestionSelect = (suggestion: any) => {
    setDeliveryAddress(suggestion.description || suggestion.main_text);
    setShowSuggestions(false);
    calculateDistance(suggestion.description || suggestion.main_text);
  };

  // Fonction pour gérer le changement de type de déchet
  const handleWasteTypeChange = (value: string) => {
    setSelectedWasteType(value);
  };

  // Fonction pour sélectionner un service
  const handleServiceSelect = (service: Service) => {
    setSelectedServiceId(service.id);
  };

  // Fonction pour procéder à la réservation
  const handleBooking = () => {
    // Validation complète avant de procéder au checkout
    if (!selectedServiceId || !deliveryAddress.trim() || !selectedWasteType) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    // Validation FID obligatoire seulement si l'option BSD est activée
    if (bsdOption && !fidData) {
      toast({
        title: "FID obligatoire",
        description: "Vous devez remplir la Fiche d'Identification des Déchets avant de continuer.",
        variant: "destructive",
      });
      setShowFidForm(true);
      return;
    }

    // Vérifier le téléphone de contact pour chantier spécifique
    if (deliveryLocationType === "construction_site" && !constructionSiteContactPhone) {
      toast({
        title: "Téléphone manquant",
        description: "Le numéro de téléphone de contact chantier est obligatoire",
        variant: "destructive",
      });
      return;
    }

    // Préparer les données de réservation avec les nouvelles informations de durée
    const bookingDetails = {
      serviceId: selectedServiceId,
      serviceName: service?.name,
      serviceVolume: service?.volume,
      address: deliveryAddress,
      postalCode: postalCode,
      city: city,
      wasteTypes: [selectedWasteType],
      bsdOption: bsdOption,
      fidData: fidData,
      distance: distance * 2, // Distance aller-retour
      // Nouvelles données de durée de location
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      durationDays: durationDays,
      deliveryLocationType: deliveryLocationType,
      constructionSiteContactPhone: constructionSiteContactPhone,
      pricing: priceData
    };

    // Sauvegarder dans sessionStorage et rediriger vers checkout
    sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    setLocation('/checkout');
  };

  // Fonction pour gérer la soumission du formulaire FID
  const handleFidSubmit = (fidFormData: any) => {
    setFidData(fidFormData);
    setShowFidForm(false);
    toast({
      title: "FID enregistrée",
      description: "La Fiche d'Identification des Déchets a été enregistrée avec succès.",
    });
  };

  // Fonction pour annuler le formulaire FID
  const handleFidCancel = () => {
    setShowFidForm(false);
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
    <div className="container-responsive min-h-screen-safe">
      <div className="grid grid-responsive gap-4 lg:gap-8">
        {/* Left Column - Configuration */}
        <div className="space-y-6 spacing-md">
        
        {/* Delivery Location Selection */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Où souhaitez-vous la livraison ?</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  deliveryLocationType === "company" 
                    ? "border-blue-500 bg-blue-100" 
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                onClick={() => setDeliveryLocationType("company")}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    deliveryLocationType === "company" 
                      ? "border-blue-500 bg-blue-500" 
                      : "border-gray-300"
                  }`}>
                    {deliveryLocationType === "company" && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Adresse de l'entreprise</div>
                    <div className="text-sm text-gray-600">Livraison à votre adresse principale</div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  deliveryLocationType === "construction_site" 
                    ? "border-blue-500 bg-blue-100" 
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                onClick={() => setDeliveryLocationType("construction_site")}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    deliveryLocationType === "construction_site" 
                      ? "border-blue-500 bg-blue-500" 
                      : "border-gray-300"
                  }`}>
                    {deliveryLocationType === "construction_site" && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                  <Construction className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Chantier spécifique</div>
                    <div className="text-sm text-gray-600">Livraison sur un chantier</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Construction Site Contact Phone */}
            {deliveryLocationType === "construction_site" && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <Label htmlFor="constructionSiteContactPhone" className="text-sm font-medium text-orange-800">
                  Numéro de téléphone de contact sur le chantier *
                </Label>
                <Input
                  id="constructionSiteContactPhone"
                  type="tel"
                  placeholder="Ex: 06 12 34 56 78"
                  value={constructionSiteContactPhone}
                  onChange={(e) => setConstructionSiteContactPhone(e.target.value)}
                  className="mt-2"
                  required
                />
                <p className="text-xs text-orange-700 mt-1">
                  Ce numéro sera utilisé par le chauffeur pour vous contacter lors de la livraison.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choisissez votre benne</h3>
          {Array.isArray(services) && services.length > 0 ? (
            <div className="grid gap-6">
              {services.map((service: Service) => (
                <div key={service.id}>
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedServiceId === service.id 
                        ? "ring-2 ring-red-500 border-red-300" 
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => handleServiceSelect(service)}
                  >
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Image plus grande */}
                        {service.imageUrl && (
                          <div className="md:col-span-1">
                            <img 
                              src={service.imageUrl}
                              alt={service.name}
                              className="w-full h-48 md:h-56 object-cover rounded-lg shadow-md"
                            />
                          </div>
                        )}
                        
                        {/* Informations du service */}
                        <div className={`${service.imageUrl ? 'md:col-span-2' : 'md:col-span-3'} flex flex-col justify-between`}>
                          <div>
                            <h4 className="font-bold text-xl text-gray-900 mb-2">{service.name}</h4>
                            <p className="text-gray-600 text-base mb-4">{service.description}</p>
                            
                            {/* Caractéristiques techniques */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-500">Volume</div>
                                <div className="font-semibold text-lg">{service.volume}m³</div>
                              </div>
                              {service.length && service.width && service.height && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="text-sm text-gray-500">Dimensions</div>
                                  <div className="font-semibold text-sm">{service.length} × {service.width} × {service.height}m</div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Prix et sélection */}
                          <div className="flex justify-between items-center">
                            <div className="text-2xl font-bold text-red-600">
                              À partir de {service.basePrice}€
                            </div>
                            {selectedServiceId === service.id && (
                              <Badge className="bg-red-600 text-white text-sm px-3 py-1">
                                ✓ Sélectionné
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun service disponible</p>
            </div>
          )}
        </div>

        {/* Waste Type Selection */}
        {selectedServiceId && (
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
        )}

        {/* Option BSD (Bordereau de Suivi des Déchets) - OPTIONNELLE */}
        {selectedWasteType && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-orange-600" />
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="bsd-option"
                      checked={bsdOption}
                      onChange={(e) => setBsdOption(e.target.checked)}
                      className="h-4 w-4 text-orange-600 bg-orange-100 border-orange-300 rounded cursor-pointer"
                    />
                    <label htmlFor="bsd-option" className="ml-3 text-lg font-semibold text-gray-900 cursor-pointer">
                      BSD (Bordereau de Suivi des Déchets)
                    </label>
                  </div>
                </div>
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                  +15€
                </Badge>
              </div>
              
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  <strong>Le Bordereau de Suivi des Déchets (BSD)</strong> est un document obligatoire selon la réglementation française.
                </p>
                <p className="mb-2">
                  Il permet de tracer le parcours de vos déchets de leur production jusqu'à leur traitement final, garantissant une gestion conforme à la réglementation environnementale.
                </p>
                <p className="text-red-700 font-medium mb-4">
                  ⚠️ Vous devez remplir une Fiche d'Identification des Déchets (FID) obligatoire avant le paiement.
                </p>
                
                {/* Bouton pour ouvrir le formulaire FID */}
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => setShowFidForm(true)}
                    variant={fidData ? "outline" : "default"}
                    className={fidData ? "border-green-500 text-green-700" : ""}
                  >
                    {fidData ? "✓ FID Remplie - Modifier" : "Remplir la FID (obligatoire)"}
                  </Button>
                  {fidData && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      FID Complétée
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Address Section */}
        {selectedWasteType && (
          <div>
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 mr-2 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {deliveryLocationType === "company" ? "Confirmation de l'adresse" : "Adresse du chantier"}
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="address">
                  {deliveryLocationType === "company" ? "Adresse de l'entreprise *" : "Adresse du chantier *"}
                </Label>
                {deliveryLocationType === "company" && user && (
                  <p className="text-sm text-blue-600 mb-2">
                    ✓ Adresse automatiquement remplie depuis votre profil
                  </p>
                )}
                <Input
                  id="address"
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder={
                    deliveryLocationType === "company" 
                      ? "Adresse de votre entreprise..." 
                      : "Tapez l'adresse du chantier..."
                  }
                  className="mt-1"
                  disabled={deliveryLocationType === "company"}
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
                    placeholder="Ex: 75001"
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
                    placeholder="Ex: Paris"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Distance Display */}
              {distance > 0 && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center text-green-800">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">
                      Distance calculée: {distance} km (aller-retour: {distance * 2} km)
                    </span>
                  </div>
                </div>
              )}

              {isCalculatingDistance && (
                <div className="flex items-center text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Calcul de la distance en cours...</span>
                </div>
              )}

              {distanceError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{distanceError}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}

        {/* Duration Selection */}
        {selectedWasteType && deliveryAddress && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Durée de location</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Date de début *</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setIsCalendarOpen(false);
                      }}
                      disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="duration">Durée (jours) *</Label>
                <Select value={durationDays.toString()} onValueChange={(value) => setDurationDays(parseInt(value))}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 jour</SelectItem>
                    <SelectItem value="3">3 jours</SelectItem>
                    <SelectItem value="7">1 semaine</SelectItem>
                    <SelectItem value="14">2 semaines</SelectItem>
                    <SelectItem value="30">1 mois</SelectItem>
                    <SelectItem value="60">2 mois</SelectItem>
                    <SelectItem value="90">3 mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {startDate && endDate && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-blue-800 text-sm">
                  <strong>Période de location:</strong> du {format(startDate, "dd/MM/yyyy", { locale: fr })} au {format(endDate, "dd/MM/yyyy", { locale: fr })} ({durationDays} jour{durationDays > 1 ? 's' : ''})
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column - Pricing Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h3>
            
            {priceData ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {priceData.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className={item.isSubItem ? "ml-4 text-gray-600" : ""}>{item.label}</span>
                      <span>{item.amount}€</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-red-600">{priceData.total}€</span>
                  </div>
                </div>

                <Button 
                  onClick={handleBooking}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                  disabled={!selectedServiceId || !deliveryAddress || !selectedWasteType || (bsdOption && !fidData)}
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

      {/* Formulaire FID Modal */}
      {showFidForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <FidForm
              onSubmit={handleFidSubmit}
              onCancel={handleFidCancel}
              initialData={fidData}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}