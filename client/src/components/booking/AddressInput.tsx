import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useBookingState } from "@/hooks/useBookingState";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Search, Building2, Construction } from "lucide-react";

export default function AddressInput() {
  const { bookingData, updateAddress } = useBookingState();
  const { user } = useAuth();
  
  const [deliveryLocationType, setDeliveryLocationType] = useState<"company" | "construction_site">("company");
  const [formData, setFormData] = useState({
    street: bookingData.address?.street || "",
    city: bookingData.address?.city || "",
    postalCode: bookingData.address?.postalCode || "",
    country: bookingData.address?.country || "FR",
    deliveryNotes: bookingData.address?.deliveryNotes || "",
    constructionSiteContactPhone: "",
  });

  const [addressSearch, setAddressSearch] = useState("");
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

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
      const deliveryAddress = `${formData.street}, ${formData.city}, ${formData.postalCode}, ${formData.country}`;
      const response = await fetch('/api/calculate-distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryAddress }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setCalculatedDistance(result.distance);
      } else {
        console.error('Failed to calculate distance:', response.statusText);
        setCalculatedDistance(null);
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      setCalculatedDistance(null);
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
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

          {/* Address Search */}
          <div>
            <Label htmlFor="address-search" className="text-sm font-medium text-slate-700 mb-2 block">
              Rechercher une adresse
            </Label>
            <div className="relative">
              <Input
                id="address-search"
                placeholder="Tapez votre adresse..."
                value={addressSearch}
                onChange={(e) => setAddressSearch(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Nous utilisons la géolocalisation pour calculer les frais de livraison
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
