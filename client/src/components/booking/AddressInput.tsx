import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useBookingState } from "@/hooks/useBookingState";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Search, Building2, Construction, Phone } from "lucide-react";

interface AddressSuggestion {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  street_number?: string;
  route?: string;
  locality?: string;
  postal_code?: string;
  country?: string;
}

export default function AddressInput() {
  const { bookingData, updateAddress } = useBookingState();
  const { user } = useAuth();
  
  const [deliveryLocationType, setDeliveryLocationType] = useState<"company" | "construction_site">(
    bookingData.address?.deliveryLocationType || "company"
  );
  const [formData, setFormData] = useState({
    street: bookingData.address?.street || "",
    city: bookingData.address?.city || "",
    postalCode: bookingData.address?.postalCode || "",
    country: bookingData.address?.country || "FR",
    deliveryNotes: bookingData.address?.deliveryNotes || "",
    constructionSiteContactPhone: bookingData.address?.constructionSiteContactPhone || "",
  });

  const [addressSearch, setAddressSearch] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search for address suggestions
  const searchAddressSuggestions = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);

      if (response.ok) {
        const data = await response.json();
        const suggestions = (data.suggestions || []).map((s: any) => ({
          description: s.description,
          place_id: s.place_id,
          structured_formatting: {
            main_text: s.main_text,
            secondary_text: s.secondary_text
          }
        }));
        setAddressSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        // Gestion des erreurs API Google Places
        const errorData = await response.json().catch(() => null);
        console.error('Erreur autocomplete:', errorData?.message || 'Erreur inconnue');
        
        // Si c'est une erreur REQUEST_DENIED, on peut continuer sans autocomplétion
        if (errorData?.fallback) {
          console.log('Places API non disponible, saisie manuelle autorisée');
        }
        
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Get place details and populate form
  const selectAddressSuggestion = async (suggestion: AddressSuggestion) => {
    try {
      const response = await fetch(`/api/places/details?place_id=${encodeURIComponent(suggestion.place_id)}`);

      if (response.ok) {
        const data = await response.json();
        const components = data.address_components || [];
        
        // Extract address components
        let street_number = '';
        let route = '';
        let locality = '';
        let postal_code = '';
        
        components.forEach((component: any) => {
          const types = component.types;
          if (types.includes('street_number')) {
            street_number = component.long_name;
          } else if (types.includes('route')) {
            route = component.long_name;
          } else if (types.includes('locality')) {
            locality = component.long_name;
          } else if (types.includes('postal_code')) {
            postal_code = component.long_name;
          }
        });
        
        // Auto-populate form fields
        const street = `${street_number} ${route}`.trim();
        
        setFormData(prev => ({
          ...prev,
          street: street,
          city: locality,
          postalCode: postal_code,
        }));
        
        setAddressSearch(suggestion.description);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  // Handle address search input with debouncing
  const handleAddressSearchChange = (value: string) => {
    setAddressSearch(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchAddressSuggestions(value);
    }, 300);
  };

  // Auto-populate company address when delivery type is "company"
  useEffect(() => {
    if (deliveryLocationType === "company" && user?.address) {
      setFormData(prev => ({
        ...prev,
        street: user.address || "",
        city: user.city || "",
        postalCode: user.postalCode || "",
        country: user.country || "FR",
      }));
    }
  }, [deliveryLocationType, user]);

  // Calculate distance when address changes
  useEffect(() => {
    if (formData.street && formData.city && formData.postalCode) {
      updateAddress({
        street: formData.street,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        deliveryNotes: formData.deliveryNotes,
        deliveryLocationType,
        constructionSiteContactPhone: formData.constructionSiteContactPhone,
      });
      calculateDistance();
    }
  }, [formData, deliveryLocationType, updateAddress]);

  const calculateDistance = async () => {
    if (!formData.street || !formData.city || !formData.postalCode) return;
    
    setIsCalculatingDistance(true);
    try {
      const response = await fetch('/api/calculate-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: bookingData.service?.id || 9, // Service par défaut pour le calcul
          wasteType: "Gravats et matériaux inertes", // Type par défaut
          address: formData.street,
          postalCode: formData.postalCode,
          city: formData.city,
          durationDays: bookingData.durationDays || 7,
          bsdOption: false
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.distance) {
          setCalculatedDistance(result.distance.kilometers);
        } else {
          console.log('Distance calculation: using fallback');
          setCalculatedDistance(15); // Distance estimée par défaut
        }
      } else {
        console.error('Failed to calculate distance:', response.statusText);
        setCalculatedDistance(15); // Distance estimée par défaut
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      setCalculatedDistance(15); // Distance estimée par défaut
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Formatage spécifique pour le code postal français
    if (field === 'postalCode') {
      // Supprimer tous les caractères non numériques et limiter à 5 chiffres
      value = value.replace(/\D/g, '').slice(0, 5);
    }
    
    // Formatage pour le numéro de téléphone
    if (field === 'constructionSiteContactPhone') {
      // Supprimer tous les caractères non numériques
      const numbersOnly = value.replace(/\D/g, '');
      // Formater le numéro français (XX XX XX XX XX)
      if (numbersOnly.length <= 10) {
        const formatted = numbersOnly.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
        value = formatted;
      } else {
        // Limiter à 10 chiffres pour les numéros français
        return;
      }
    }
    
    // Capitalisation automatique pour la ville
    if (field === 'city') {
      value = value.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationTypeChange = (value: "company" | "construction_site") => {
    setDeliveryLocationType(value);
    if (value === "company") {
      setFormData(prev => ({ ...prev, constructionSiteContactPhone: "" }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <MapPin className="h-6 w-6 mr-3 text-primary-600" />
        <h2 className="text-xl font-semibold text-slate-900">Adresse de livraison</h2>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Delivery Location Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Où souhaitez-vous la livraison ?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  deliveryLocationType === "company" 
                    ? "border-primary-500 bg-primary-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleLocationTypeChange("company")}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    deliveryLocationType === "company" 
                      ? "border-primary-500 bg-primary-500" 
                      : "border-gray-300"
                  }`}>
                    {deliveryLocationType === "company" && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                  <Building2 className="h-5 w-5 text-primary-600" />
                  <div>
                    <div className="font-medium">Adresse de l'entreprise</div>
                    <div className="text-sm text-slate-600">Livraison à votre adresse principale</div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  deliveryLocationType === "construction_site" 
                    ? "border-primary-500 bg-primary-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleLocationTypeChange("construction_site")}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    deliveryLocationType === "construction_site" 
                      ? "border-primary-500 bg-primary-500" 
                      : "border-gray-300"
                  }`}>
                    {deliveryLocationType === "construction_site" && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                  <Construction className="h-5 w-5 text-primary-600" />
                  <div>
                    <div className="font-medium">Chantier spécifique</div>
                    <div className="text-sm text-slate-600">Livraison sur un chantier</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Construction Site Contact Phone (only if construction_site is selected) */}
          {deliveryLocationType === "construction_site" && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <Label htmlFor="constructionSiteContactPhone" className="text-sm font-medium text-amber-800">
                Numéro de téléphone de contact sur le chantier *
              </Label>
              <Input
                id="constructionSiteContactPhone"
                type="tel"
                placeholder="Ex: 06 12 34 56 78"
                value={formData.constructionSiteContactPhone}
                onChange={(e) => handleInputChange("constructionSiteContactPhone", e.target.value)}
                className="mt-2"
                required
              />
              <p className="text-xs text-amber-700 mt-1">
                Ce numéro sera utilisé pour coordonner la livraison sur le chantier
              </p>
            </div>
          )}

          {/* Address Search with Autocomplete */}
          <div className="relative">
            <Label htmlFor="address-search" className="text-sm font-medium text-slate-700 mb-2 block">
              Rechercher une adresse
            </Label>
            <div className="relative">
              <Input
                id="address-search"
                placeholder="Tapez votre adresse pour l'autocomplétion..."
                value={addressSearch}
                onChange={(e) => handleAddressSearchChange(e.target.value)}
                className="pr-10"
                onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isLoadingSuggestions ? (
                  <div className="animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                ) : (
                  <Search className="text-slate-400 h-4 w-4" />
                )}
              </div>
            </div>
            
            {/* Address suggestions dropdown */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {addressSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => selectAddressSuggestion(suggestion)}
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {suggestion.structured_formatting.main_text}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {suggestion.structured_formatting.secondary_text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-sm text-slate-500 mt-1">
              Sélectionnez une adresse dans la liste pour remplir automatiquement les champs
            </p>
          </div>

          {/* Address Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street" className="text-sm font-medium text-slate-700 mb-2 block">
                Numéro et rue *
              </Label>
              <Input
                id="street"
                required
                value={formData.street}
                onChange={(e) => handleInputChange("street", e.target.value)}
                placeholder="123 Rue de la République"
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-sm font-medium text-slate-700 mb-2 block">
                Ville *
              </Label>
              <Input
                id="city"
                required
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Paris"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postal-code" className="text-sm font-medium text-slate-700 mb-2 block">
                Code postal *
              </Label>
              <Input
                id="postal-code"
                required
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                placeholder="75001"
              />
            </div>
            <div>
              <Label htmlFor="country" className="text-sm font-medium text-slate-700 mb-2 block">
                Pays
              </Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="BE">Belgique</SelectItem>
                  <SelectItem value="LU">Luxembourg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="delivery-notes" className="text-sm font-medium text-slate-700 mb-2 block">
              Instructions de livraison
            </Label>
            <Textarea
              id="delivery-notes"
              rows={3}
              placeholder="Informations complémentaires pour la livraison (accès difficile, étage, etc.)"
              value={formData.deliveryNotes}
              onChange={(e) => handleInputChange("deliveryNotes", e.target.value)}
            />
          </div>

          {/* Delivery Distance Calculator */}
          {(formData.street && formData.city && formData.postalCode) && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Distance de livraison:</span>
                </div>
                {isCalculatingDistance ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-slate-600">Calcul en cours...</span>
                  </div>
                ) : calculatedDistance !== null ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold text-slate-900">{calculatedDistance.toFixed(1)} km</span>
                    <span className="text-sm text-slate-600">aller-retour</span>
                  </div>
                ) : (
                  <span className="text-sm text-amber-600">Distance non calculée</span>
                )}
              </div>
              <div className="mt-2">
                <span className="text-sm text-slate-600">Frais de livraison:</span>
                <span className="ml-2 text-lg font-semibold text-primary-600">+24€</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
