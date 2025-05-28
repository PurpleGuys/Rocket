import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBookingState } from "@/hooks/useBookingState";
import { Service } from "@shared/schema";
import { Cog, AlertTriangle } from "lucide-react";

export default function ServiceSelection() {
  const { bookingData, updateService, updateDuration, updateWasteTypes } = useBookingState();
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    bookingData.service?.id || null
  );
  const [selectedDuration, setSelectedDuration] = useState(bookingData.durationDays);
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>(bookingData.wasteTypes);

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['/api/services'],
  });

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
    construction: "Déchets de construction et démolition",
    household: "Déchets ménagers non dangereux",
    green: "Déchets verts (branches, feuilles)",
    metal: "Métaux et ferraille",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
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
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Cog className="h-6 w-6 mr-3 text-primary-600" />
        <h2 className="text-xl font-semibold text-slate-900">Choisissez votre benne</h2>
      </div>

      {/* Container Type Selection */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Type de benne</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {services?.map((service: Service) => (
              <div
                key={service.id}
                className={`relative cursor-pointer transition-all ${
                  selectedServiceId === service.id
                    ? "ring-2 ring-primary-500"
                    : ""
                }`}
                onClick={() => handleServiceSelect(service)}
              >
                <Card className={`${
                  selectedServiceId === service.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-200 hover:border-primary-300"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{service.name}</h4>
                      <span className="text-primary-600 font-semibold">
                        À partir de {parseFloat(service.basePrice).toFixed(0)}€
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                    <div className="text-xs text-slate-500 space-y-1">
                      <div>• Volume: {service.volume}m³</div>
                      <div>• Poids max: {service.maxWeight} tonnes</div>
                    </div>
                    {service.volume === 15 && (
                      <Badge className="absolute top-2 right-2 bg-primary-600 text-white">
                        Populaire
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Duration Selection */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Durée de location</h3>
          <div className="flex flex-wrap gap-3">
            {[1, 3, 7, 14].map((days) => (
              <Button
                key={days}
                variant={selectedDuration === days ? "default" : "outline"}
                onClick={() => handleDurationSelect(days)}
                className={`${
                  selectedDuration === days
                    ? "bg-primary-600 hover:bg-primary-700"
                    : ""
                }`}
              >
                <div className="text-center">
                  <div className="font-medium">
                    {days === 1 ? "1 jour" : days === 7 ? "1 semaine" : days === 14 ? "2 semaines" : `${days} jours`}
                  </div>
                  <div className="text-sm">
                    {days === 1 ? "+0€" : `+${(days - 1) * 25}€`}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Waste Type Selection */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Type de déchets</h3>
          <div className="space-y-3">
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
                </Label>
              </div>
            ))}
          </div>
          <Alert className="mt-4 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Les déchets dangereux (amiante, produits chimiques) ne sont pas acceptés.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
