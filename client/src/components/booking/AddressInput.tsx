import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBookingState } from "@/hooks/useBookingState";
import { MapPin, Search } from "lucide-react";

export default function AddressInput() {
  const { bookingData, updateAddress } = useBookingState();
  const [formData, setFormData] = useState({
    street: bookingData.address?.street || "",
    city: bookingData.address?.city || "",
    postalCode: bookingData.address?.postalCode || "",
    country: bookingData.address?.country || "FR",
    deliveryNotes: bookingData.address?.deliveryNotes || "",
  });

  const [addressSearch, setAddressSearch] = useState("");
  const [calculatedDistance] = useState(12); // Mock distance calculation

  useEffect(() => {
    // Update address when form data changes
    if (formData.street && formData.city && formData.postalCode) {
      updateAddress({
        street: formData.street,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        deliveryNotes: formData.deliveryNotes,
      });
    }
  }, [formData, updateAddress]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <MapPin className="h-6 w-6 mr-3 text-primary-600" />
        <h2 className="text-xl font-semibold text-slate-900">Adresse de livraison</h2>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
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
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-slate-700">Distance calculée:</span>
                <span className="ml-2 text-lg font-semibold text-slate-900">{calculatedDistance} km</span>
              </div>
              <div>
                <span className="text-sm text-slate-600">Frais de livraison:</span>
                <span className="ml-2 text-lg font-semibold text-primary-600">+24€</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
