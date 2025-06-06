import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, AlertTriangle, CheckCircle } from "lucide-react";

interface FidFormProps {
  onSubmit: (fidData: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function FidForm({ onSubmit, onCancel, initialData }: FidFormProps) {
  const [formData, setFormData] = useState({
    // Informations sur le producteur des déchets
    producerCompanyName: initialData?.producerCompanyName || "",
    producerSiret: initialData?.producerSiret || "",
    producerAddress: initialData?.producerAddress || "",
    producerPostalCode: initialData?.producerPostalCode || "",
    producerCity: initialData?.producerCity || "",
    producerContactName: initialData?.producerContactName || "",
    producerContactPhone: initialData?.producerContactPhone || "",
    producerContactEmail: initialData?.producerContactEmail || "",
    
    // Caractérisation des déchets
    wasteDescription: initialData?.wasteDescription || "",
    wasteCode: initialData?.wasteCode || "",
    wasteCategory: initialData?.wasteCategory || "",
    physicalState: initialData?.physicalState || "",
    estimatedWeight: initialData?.estimatedWeight || "",
    estimatedVolume: initialData?.estimatedVolume || "",
    
    // Informations sur la dangerosité
    isDangerous: initialData?.isDangerous || false,
    dangerousProperties: initialData?.dangerousProperties || [],
    containsAsbestos: initialData?.containsAsbestos || false,
    containsPcb: initialData?.containsPcb || false,
    
    // Origine des déchets
    wasteOrigin: initialData?.wasteOrigin || "",
    productionProcess: initialData?.productionProcess || "",
    
    // Traitement envisagé
    plannedTreatment: initialData?.plannedTreatment || "",
    treatmentCode: initialData?.treatmentCode || "",
    
    // Observations complémentaires
    additionalComments: initialData?.additionalComments || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validation des champs obligatoires
    if (!formData.producerCompanyName) newErrors.producerCompanyName = "Raison sociale obligatoire";
    if (!formData.producerSiret) newErrors.producerSiret = "SIRET obligatoire";
    if (!formData.producerAddress) newErrors.producerAddress = "Adresse obligatoire";
    if (!formData.producerPostalCode) newErrors.producerPostalCode = "Code postal obligatoire";
    if (!formData.producerCity) newErrors.producerCity = "Ville obligatoire";
    if (!formData.producerContactName) newErrors.producerContactName = "Nom du contact obligatoire";
    if (!formData.producerContactPhone) newErrors.producerContactPhone = "Téléphone obligatoire";
    if (!formData.producerContactEmail) newErrors.producerContactEmail = "Email obligatoire";
    
    if (!formData.wasteDescription) newErrors.wasteDescription = "Description des déchets obligatoire";
    if (!formData.wasteCode) newErrors.wasteCode = "Code déchet obligatoire";
    if (!formData.wasteCategory) newErrors.wasteCategory = "Catégorie obligatoire";
    if (!formData.physicalState) newErrors.physicalState = "État physique obligatoire";
    if (!formData.estimatedWeight) newErrors.estimatedWeight = "Poids estimé obligatoire";
    
    if (!formData.wasteOrigin) newErrors.wasteOrigin = "Origine des déchets obligatoire";
    if (!formData.plannedTreatment) newErrors.plannedTreatment = "Traitement envisagé obligatoire";

    // Validation du SIRET (14 chiffres)
    if (formData.producerSiret && !/^\d{14}$/.test(formData.producerSiret)) {
      newErrors.producerSiret = "Le SIRET doit contenir 14 chiffres";
    }

    // Validation de l'email
    if (formData.producerContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.producerContactEmail)) {
      newErrors.producerContactEmail = "Format d'email invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-yellow-600" />
                <CardTitle className="text-xl">Fiche d'Identification des Déchets (FID)</CardTitle>
              </div>
              <Button variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            </div>
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Cette fiche est obligatoire pour l'option BSD. Toutes les informations doivent être remplies conformément à la réglementation française sur les déchets.
              </AlertDescription>
            </Alert>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Producteur des déchets */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    1
                  </div>
                  Informations sur le producteur des déchets
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="producerCompanyName">Raison sociale *</Label>
                    <Input
                      id="producerCompanyName"
                      value={formData.producerCompanyName}
                      onChange={(e) => updateField("producerCompanyName", e.target.value)}
                      className={errors.producerCompanyName ? "border-red-500" : ""}
                    />
                    {errors.producerCompanyName && <p className="text-red-500 text-xs mt-1">{errors.producerCompanyName}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="producerSiret">SIRET *</Label>
                    <Input
                      id="producerSiret"
                      value={formData.producerSiret}
                      onChange={(e) => updateField("producerSiret", e.target.value.replace(/\D/g, '').slice(0, 14))}
                      placeholder="12345678901234"
                      className={errors.producerSiret ? "border-red-500" : ""}
                    />
                    {errors.producerSiret && <p className="text-red-500 text-xs mt-1">{errors.producerSiret}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="producerAddress">Adresse complète *</Label>
                    <Input
                      id="producerAddress"
                      value={formData.producerAddress}
                      onChange={(e) => updateField("producerAddress", e.target.value)}
                      className={errors.producerAddress ? "border-red-500" : ""}
                    />
                    {errors.producerAddress && <p className="text-red-500 text-xs mt-1">{errors.producerAddress}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="producerPostalCode">Code postal *</Label>
                    <Input
                      id="producerPostalCode"
                      value={formData.producerPostalCode}
                      onChange={(e) => updateField("producerPostalCode", e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="75001"
                      className={errors.producerPostalCode ? "border-red-500" : ""}
                    />
                    {errors.producerPostalCode && <p className="text-red-500 text-xs mt-1">{errors.producerPostalCode}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="producerCity">Ville *</Label>
                    <Input
                      id="producerCity"
                      value={formData.producerCity}
                      onChange={(e) => updateField("producerCity", e.target.value)}
                      className={errors.producerCity ? "border-red-500" : ""}
                    />
                    {errors.producerCity && <p className="text-red-500 text-xs mt-1">{errors.producerCity}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="producerContactName">Nom du contact *</Label>
                    <Input
                      id="producerContactName"
                      value={formData.producerContactName}
                      onChange={(e) => updateField("producerContactName", e.target.value)}
                      className={errors.producerContactName ? "border-red-500" : ""}
                    />
                    {errors.producerContactName && <p className="text-red-500 text-xs mt-1">{errors.producerContactName}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="producerContactPhone">Téléphone *</Label>
                    <Input
                      id="producerContactPhone"
                      type="tel"
                      value={formData.producerContactPhone}
                      onChange={(e) => {
                        const numbersOnly = e.target.value.replace(/\D/g, '');
                        if (numbersOnly.length <= 10) {
                          const formatted = numbersOnly.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
                          updateField("producerContactPhone", formatted);
                        }
                      }}
                      placeholder="06 12 34 56 78"
                      className={errors.producerContactPhone ? "border-red-500" : ""}
                    />
                    {errors.producerContactPhone && <p className="text-red-500 text-xs mt-1">{errors.producerContactPhone}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="producerContactEmail">Email *</Label>
                    <Input
                      id="producerContactEmail"
                      type="email"
                      value={formData.producerContactEmail}
                      onChange={(e) => updateField("producerContactEmail", e.target.value)}
                      className={errors.producerContactEmail ? "border-red-500" : ""}
                    />
                    {errors.producerContactEmail && <p className="text-red-500 text-xs mt-1">{errors.producerContactEmail}</p>}
                  </div>
                </div>
              </div>

              {/* Section 2: Caractérisation des déchets */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    2
                  </div>
                  Caractérisation des déchets
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="wasteDescription">Description détaillée des déchets *</Label>
                    <Textarea
                      id="wasteDescription"
                      value={formData.wasteDescription}
                      onChange={(e) => updateField("wasteDescription", e.target.value)}
                      placeholder="Décrivez précisément la nature des déchets, leur composition, leur origine..."
                      className={errors.wasteDescription ? "border-red-500" : ""}
                      rows={3}
                    />
                    {errors.wasteDescription && <p className="text-red-500 text-xs mt-1">{errors.wasteDescription}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="wasteCode">Code déchet (selon nomenclature européenne) *</Label>
                    <Input
                      id="wasteCode"
                      value={formData.wasteCode}
                      onChange={(e) => updateField("wasteCode", e.target.value)}
                      placeholder="Ex: 17 01 01"
                      className={errors.wasteCode ? "border-red-500" : ""}
                    />
                    {errors.wasteCode && <p className="text-red-500 text-xs mt-1">{errors.wasteCode}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="wasteCategory">Catégorie de déchets *</Label>
                    <Select value={formData.wasteCategory} onValueChange={(value) => updateField("wasteCategory", value)}>
                      <SelectTrigger className={errors.wasteCategory ? "border-red-500" : ""}>
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inertes">Déchets inertes</SelectItem>
                        <SelectItem value="non-dangereux">Déchets non dangereux</SelectItem>
                        <SelectItem value="dangereux">Déchets dangereux</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.wasteCategory && <p className="text-red-500 text-xs mt-1">{errors.wasteCategory}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="physicalState">État physique *</Label>
                    <Select value={formData.physicalState} onValueChange={(value) => updateField("physicalState", value)}>
                      <SelectTrigger className={errors.physicalState ? "border-red-500" : ""}>
                        <SelectValue placeholder="Sélectionnez l'état" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solide">Solide</SelectItem>
                        <SelectItem value="liquide">Liquide</SelectItem>
                        <SelectItem value="gazeux">Gazeux</SelectItem>
                        <SelectItem value="pateux">Pâteux</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.physicalState && <p className="text-red-500 text-xs mt-1">{errors.physicalState}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="estimatedWeight">Poids estimé (tonnes) *</Label>
                    <Input
                      id="estimatedWeight"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.estimatedWeight}
                      onChange={(e) => updateField("estimatedWeight", e.target.value)}
                      placeholder="Ex: 2.5"
                      className={errors.estimatedWeight ? "border-red-500" : ""}
                    />
                    {errors.estimatedWeight && <p className="text-red-500 text-xs mt-1">{errors.estimatedWeight}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="estimatedVolume">Volume estimé (m³)</Label>
                    <Input
                      id="estimatedVolume"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.estimatedVolume}
                      onChange={(e) => updateField("estimatedVolume", e.target.value)}
                      placeholder="Ex: 8"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Origine et traitement */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    3
                  </div>
                  Origine et traitement envisagé
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wasteOrigin">Origine des déchets *</Label>
                    <Select value={formData.wasteOrigin} onValueChange={(value) => updateField("wasteOrigin", value)}>
                      <SelectTrigger className={errors.wasteOrigin ? "border-red-500" : ""}>
                        <SelectValue placeholder="Sélectionnez l'origine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="construction">Chantier de construction</SelectItem>
                        <SelectItem value="demolition">Chantier de démolition</SelectItem>
                        <SelectItem value="renovation">Chantier de rénovation</SelectItem>
                        <SelectItem value="industrial">Activité industrielle</SelectItem>
                        <SelectItem value="commercial">Activité commerciale</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.wasteOrigin && <p className="text-red-500 text-xs mt-1">{errors.wasteOrigin}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="plannedTreatment">Traitement envisagé *</Label>
                    <Select value={formData.plannedTreatment} onValueChange={(value) => updateField("plannedTreatment", value)}>
                      <SelectTrigger className={errors.plannedTreatment ? "border-red-500" : ""}>
                        <SelectValue placeholder="Sélectionnez le traitement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recycling">Recyclage</SelectItem>
                        <SelectItem value="recovery">Valorisation énergétique</SelectItem>
                        <SelectItem value="disposal">Élimination</SelectItem>
                        <SelectItem value="storage">Stockage</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.plannedTreatment && <p className="text-red-500 text-xs mt-1">{errors.plannedTreatment}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="productionProcess">Processus de production à l'origine des déchets</Label>
                    <Textarea
                      id="productionProcess"
                      value={formData.productionProcess}
                      onChange={(e) => updateField("productionProcess", e.target.value)}
                      placeholder="Décrivez le processus qui a généré ces déchets..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Observations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    4
                  </div>
                  Observations complémentaires
                </h3>
                
                <div>
                  <Label htmlFor="additionalComments">Commentaires additionnels</Label>
                  <Textarea
                    id="additionalComments"
                    value={formData.additionalComments}
                    onChange={(e) => updateField("additionalComments", e.target.value)}
                    placeholder="Toute information complémentaire utile pour le traitement des déchets..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Valider la FID
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}