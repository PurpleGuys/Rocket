import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBookingState } from "@/hooks/useBookingState";
import { Service } from "@shared/schema";
import { Truck, AlertTriangle, MapPin, Calendar } from "lucide-react";

export default function ServiceSelection() {
  const { bookingData, updateService, updateDuration, updateWasteTypes, calculateTotalPrice } = useBookingState();
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    bookingData.service?.id || null
  );
  const [selectedDuration, setSelectedDuration] = useState(bookingData.durationDays);
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>(bookingData.wasteTypes);
  const [postalCode, setPostalCode] = useState("");
  const [distance, setDistance] = useState(12); // km

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['/api/services'],
  });

  const pricing = calculateTotalPrice();

  useEffect(() => {
    if (selectedServiceId && services) {
      const service = services.find((s: Service) => s.id === selectedServiceId);
      if (service) {
        updateService(service);
      }
    }
  }, [selectedServiceId, services, updateService]);

  useEffect(() => {
    updateDuration(selectedDuration);
  }, [selectedDuration, updateDuration]);

  useEffect(() => {
    updateWasteTypes(selectedWasteTypes);
  }, [selectedWasteTypes, updateWasteTypes]);

  const handleServiceSelect = (service: Service) => {
    setSelectedServiceId(service.id);
  };

  const handleDurationSelect = (days: number) => {
    setSelectedDuration(days);
  };

  const handleWasteTypeChange = (wasteType: string, checked: boolean) => {
    setSelectedWasteTypes(prev => 
      checked 
        ? [...prev, wasteType]
        : prev.filter(type => type !== wasteType)
    );
  };

  const wasteTypeLabels = {
    construction: "Déchets de construction",
    household: "Déchets ménagers",
    green: "Déchets verts",
    metal: "Métaux et ferraille",
  };

  const calculateAdvancedPrice = () => {
    if (!selectedServiceId || !services) return { total: 0, details: [] };
    
    const service = services.find((s: Service) => s.id === selectedServiceId);
    if (!service) return { total: 0, details: [] };

    const basePrice = parseFloat(service.basePrice);
    const details = [];
    
    details.push({ label: `${service.name}`, amount: basePrice });
    
    // Duration pricing
    let durationPrice = 0;
    if (selectedDuration > 1) {
      durationPrice = (selectedDuration - 1) * 25;
      details.push({ label: `Supplément durée (${selectedDuration-1} jours)`, amount: durationPrice });
    }
    
    // Distance-based delivery fee
    let deliveryFee = 0;
    if (distance <= 10) {
      deliveryFee = 20;
    } else if (distance <= 25) {
      deliveryFee = 35;
    } else if (distance <= 50) {
      deliveryFee = 55;
    } else {
      deliveryFee = 75;
    }
    details.push({ label: `Livraison (${distance}km)`, amount: deliveryFee });
    
    // Waste type surcharge
    let wasteTypeSurcharge = 0;
    if (selectedWasteTypes.includes('metal')) {
      wasteTypeSurcharge += 15;
    }
    if (selectedWasteTypes.includes('construction') && service.volume >= 15) {
      wasteTypeSurcharge += 20;
    }
    if (wasteTypeSurcharge > 0) {
      details.push({ label: 'Supplément type de déchets', amount: wasteTypeSurcharge });
    }
    
    const subtotal = basePrice + durationPrice + deliveryFee + wasteTypeSurcharge;
    const vat = subtotal * 0.2;
    const total = subtotal + vat;
    
    details.push({ label: 'Sous-total HT', amount: subtotal });
    details.push({ label: 'TVA (20%)', amount: vat });
    
    return { total, details, subtotal, vat };
  };

  const priceCalculation = calculateAdvancedPrice();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
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
            <Truck className="h-5 w-5 mr-2 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Choisissez votre benne</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {services?.map((service: Service) => (
              <div
                key={service.id}
                className={`relative cursor-pointer transition-all ${
                  selectedServiceId === service.id
                    ? "ring-2 ring-green-500"
                    : ""
                }`}
                onClick={() => handleServiceSelect(service)}
              >
                <Card className={`${
                  selectedServiceId === service.id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <span className="text-green-600 font-semibold">
                        {parseFloat(service.basePrice).toFixed(0)}€
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>• Volume: {service.volume}m³</div>
                      <div>• Poids max: {service.maxWeight} tonnes</div>
                    </div>
                    {service.volume === 15 && (
                      <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                        Populaire
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Duration and Location */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-3">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Durée</h3>
            </div>
            <Select value={selectedDuration.toString()} onValueChange={(value) => setSelectedDuration(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 jour</SelectItem>
                <SelectItem value="3">3 jours (+50€)</SelectItem>
                <SelectItem value="7">1 semaine (+150€)</SelectItem>
                <SelectItem value="14">2 semaines (+325€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex items-center mb-3">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Code postal</h3>
            </div>
            <Input
              type="text"
              placeholder="75001"
              value={postalCode}
              onChange={(e) => {
                setPostalCode(e.target.value);
                // Mock distance calculation based on postal code
                const mockDistance = e.target.value.length >= 5 ? 
                  Math.floor(Math.random() * 40) + 5 : 12;
                setDistance(mockDistance);
              }}
              className="w-full"
            />
            {postalCode && (
              <p className="text-sm text-gray-500 mt-1">
                Distance estimée: {distance} km
              </p>
            )}
          </div>
        </div>

        {/* Waste Type Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Type de déchets</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {Object.entries(wasteTypeLabels).map(([type, label]) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={selectedWasteTypes.includes(type)}
                  onCheckedChange={(checked) => 
                    handleWasteTypeChange(type, checked as boolean)
                  }
                />
                <Label htmlFor={type} className="text-sm cursor-pointer">
                  {label}
                  {type === 'metal' && <span className="text-green-600"> (+15€)</span>}
                  {type === 'construction' && selectedServiceId && services?.find(s => s.id === selectedServiceId)?.volume >= 15 && 
                    <span className="text-green-600"> (+20€)</span>}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Price Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4 shadow-lg border-green-100">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Devis instantané</h3>
            
            {priceCalculation.total > 0 ? (
              <div className="space-y-3">
                {priceCalculation.details.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className={index >= priceCalculation.details.length - 2 ? "font-medium" : "text-gray-600"}>
                      {item.label}
                    </span>
                    <span className={index >= priceCalculation.details.length - 2 ? "font-medium" : ""}>
                      {item.amount.toFixed(2)}€
                    </span>
                  </div>
                ))}
                <hr className="border-gray-200" />
                <div className="flex justify-between text-xl font-bold text-green-600">
                  <span>Total TTC</span>
                  <span>{priceCalculation.total.toFixed(2)}€</span>
                </div>
                
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
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
