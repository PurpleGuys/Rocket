import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { FileText, AlertTriangle, CheckCircle, Plus, Trash2, Upload } from "lucide-react";

interface FidFormProps {
  onSubmit: (fidData: any) => void;
  onCancel: () => void;
  initialData?: any;
}

interface Constituent {
  name: string;
  percentage: string;
}

export default function FidForm({ onSubmit, onCancel, initialData }: FidFormProps) {
  const [formData, setFormData] = useState({
    // 1. Coordonnées client
    clientCompanyName: initialData?.clientCompanyName || "",
    clientContactName: initialData?.clientContactName || "",
    clientAddress: initialData?.clientAddress || "",
    clientVatNumber: initialData?.clientVatNumber || "",
    clientPhone: initialData?.clientPhone || "",
    clientEmail: initialData?.clientEmail || "",
    clientSiret: initialData?.clientSiret || "",
    clientActivity: initialData?.clientActivity || "",
    
    // 2. Producteur
    sameAsClient: initialData?.sameAsClient ?? true,
    producerCompanyName: initialData?.producerCompanyName || "",
    producerContactName: initialData?.producerContactName || "",
    producerAddress: initialData?.producerAddress || "",
    producerVatNumber: initialData?.producerVatNumber || "",
    producerPhone: initialData?.producerPhone || "",
    producerEmail: initialData?.producerEmail || "",
    producerSiret: initialData?.producerSiret || "",
    producerActivity: initialData?.producerActivity || "",
    
    // 3. Information déchet
    wasteName: initialData?.wasteName || "",
    nomenclatureCode: initialData?.nomenclatureCode || "",
    annualQuantity: initialData?.annualQuantity || "",
    collectionFrequency: initialData?.collectionFrequency || "",
    
    // Procédé ayant généré le déchet
    generationProcess: {
      destockage: initialData?.generationProcess?.destockage || false,
      depollution: initialData?.generationProcess?.depollution || false,
      production: initialData?.generationProcess?.production || false,
      fabricationIncident: initialData?.generationProcess?.fabricationIncident || false,
      other: initialData?.generationProcess?.other || false,
      otherText: initialData?.generationProcess?.otherText || ""
    },
    
    // Conditionnement
    packaging: {
      containers: initialData?.packaging?.containers || false,
      smallConfinements: initialData?.packaging?.smallConfinements || false,
      drums200L: initialData?.packaging?.drums200L || false,
      bigBag: initialData?.packaging?.bigBag || false,
      other: initialData?.packaging?.other || false,
      otherText: initialData?.packaging?.otherText || ""
    },
    
    // Aspect physique
    physicalAspect: {
      liquid: initialData?.physicalAspect?.liquid || false,
      solid: initialData?.physicalAspect?.solid || false,
      pasty: initialData?.physicalAspect?.pasty || false,
      powdery: initialData?.physicalAspect?.powdery || false,
      gas: initialData?.physicalAspect?.gas || false,
      other: initialData?.physicalAspect?.other || false,
      otherText: initialData?.physicalAspect?.otherText || ""
    },
    
    // 4. Constituants principaux
    constituents: initialData?.constituents || [{ name: "", percentage: "" }],
    
    // 5. Nature du déchet (HP1 à HP15)
    hazardousProperties: {
      hp1: initialData?.hazardousProperties?.hp1 || false, // Explosif
      hp2: initialData?.hazardousProperties?.hp2 || false, // Comburant
      hp3: initialData?.hazardousProperties?.hp3 || false, // Inflammable
      hp4: initialData?.hazardousProperties?.hp4 || false, // Irritant
      hp5: initialData?.hazardousProperties?.hp5 || false, // Toxicité spécifique
      hp6: initialData?.hazardousProperties?.hp6 || false, // Toxicité aiguë
      hp7: initialData?.hazardousProperties?.hp7 || false, // Cancérogène
      hp8: initialData?.hazardousProperties?.hp8 || false, // Corrosif
      hp9: initialData?.hazardousProperties?.hp9 || false, // Infectieux
      hp10: initialData?.hazardousProperties?.hp10 || false, // Toxique pour la reproduction
      hp11: initialData?.hazardousProperties?.hp11 || false, // Mutagène
      hp12: initialData?.hazardousProperties?.hp12 || false, // Dégagement de gaz toxique
      hp13: initialData?.hazardousProperties?.hp13 || false, // Sensibilisant
      hp14: initialData?.hazardousProperties?.hp14 || false, // Écotoxique
      hp15: initialData?.hazardousProperties?.hp15 || false  // Déchets susceptibles de présenter une propriété dangereuse
    },
    
    // 6. Déchet POP (PFAS)
    isPop: initialData?.isPop || false,
    popSubstances: initialData?.popSubstances || "",
    
    // 7. Absence d'information
    lackOfInformation: initialData?.lackOfInformation || false,
    
    // 8. Transport
    transportResponsible: initialData?.transportResponsible || "client", // client, remondis, others
    dangerClass: initialData?.dangerClass || "",
    unCode: initialData?.unCode || "",
    packagingGroup: initialData?.packagingGroup || "",
    transportDesignation: initialData?.transportDesignation || "",
    
    // Fichiers joints
    attachedFiles: initialData?.attachedFiles || [],
    
    // RGPD
    rgpdConsent: initialData?.rgpdConsent || false
  });

  const [constituents, setConstituents] = useState<Constituent[]>(
    initialData?.constituents || [{ name: "", percentage: "" }]
  );

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value } as any));
  };

  const updateNestedField = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const addConstituent = () => {
    setConstituents(prev => [...prev, { name: "", percentage: "" }]);
  };

  const removeConstituent = (index: number) => {
    if (constituents.length > 1) {
      setConstituents(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateConstituent = (index: number, field: 'name' | 'percentage', value: string) => {
    setConstituents(prev => 
      prev.map((constituent, i) => 
        i === index ? { ...constituent, [field]: value } : constituent
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de base
    if (!formData.rgpdConsent) {
      alert("Vous devez accepter les conditions RGPD pour continuer.");
      return;
    }
    
    const fidData = {
      ...formData,
      constituents: constituents
    };
    
    onSubmit(fidData);
  };

  const hazardousPropertiesLabels = {
    hp1: "HP1 - Explosif",
    hp2: "HP2 - Comburant", 
    hp3: "HP3 - Inflammable",
    hp4: "HP4 - Irritant",
    hp5: "HP5 - Toxicité spécifique pour certains organes cibles",
    hp6: "HP6 - Toxicité aiguë",
    hp7: "HP7 - Cancérogène",
    hp8: "HP8 - Corrosif",
    hp9: "HP9 - Infectieux",
    hp10: "HP10 - Toxique pour la reproduction",
    hp11: "HP11 - Mutagène",
    hp12: "HP12 - Dégagement de gaz toxique au contact de l'eau",
    hp13: "HP13 - Sensibilisant",
    hp14: "HP14 - Écotoxique",
    hp15: "HP15 - Déchet susceptible de présenter une des propriétés dangereuses"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-xl">Fiche d'Identification des Déchets (FID)</CardTitle>
              </div>
              <Button variant="outline" onClick={onCancel}>
                Fermer
              </Button>
            </div>
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Formulaire obligatoire conforme à la réglementation française sur les déchets. 
                Tous les champs marqués d'un * sont obligatoires.
              </AlertDescription>
            </Alert>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* 1. Coordonnées client */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    1
                  </div>
                  Coordonnées client
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientCompanyName">Nom de l'entreprise *</Label>
                    <Input
                      id="clientCompanyName"
                      value={formData.clientCompanyName}
                      onChange={(e) => updateField("clientCompanyName", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientContactName">Contact (Prénom Nom) *</Label>
                    <Input
                      id="clientContactName"
                      value={formData.clientContactName}
                      onChange={(e) => updateField("clientContactName", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="clientAddress">Adresse complète *</Label>
                    <Textarea
                      id="clientAddress"
                      value={formData.clientAddress}
                      onChange={(e) => updateField("clientAddress", e.target.value)}
                      required
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientVatNumber">N° de TVA</Label>
                    <Input
                      id="clientVatNumber"
                      value={formData.clientVatNumber}
                      onChange={(e) => updateField("clientVatNumber", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientPhone">Téléphone *</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => updateField("clientPhone", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientEmail">Email *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => updateField("clientEmail", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientSiret">SIRET *</Label>
                    <Input
                      id="clientSiret"
                      value={formData.clientSiret}
                      onChange={(e) => updateField("clientSiret", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="clientActivity">Activité *</Label>
                    <Input
                      id="clientActivity"
                      value={formData.clientActivity}
                      onChange={(e) => updateField("clientActivity", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* 2. Producteur */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    2
                  </div>
                  Producteur des déchets
                </h3>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="sameAsClient"
                    checked={formData.sameAsClient}
                    onCheckedChange={(checked) => updateField("sameAsClient", checked)}
                  />
                  <Label htmlFor="sameAsClient">Identique au client</Label>
                </div>
                
                {!formData.sameAsClient && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="producerCompanyName">Nom de l'entreprise *</Label>
                      <Input
                        id="producerCompanyName"
                        value={formData.producerCompanyName}
                        onChange={(e) => updateField("producerCompanyName", e.target.value)}
                        required={!formData.sameAsClient}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="producerContactName">Contact (Prénom Nom) *</Label>
                      <Input
                        id="producerContactName"
                        value={formData.producerContactName}
                        onChange={(e) => updateField("producerContactName", e.target.value)}
                        required={!formData.sameAsClient}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="producerAddress">Adresse complète *</Label>
                      <Textarea
                        id="producerAddress"
                        value={formData.producerAddress}
                        onChange={(e) => updateField("producerAddress", e.target.value)}
                        required={!formData.sameAsClient}
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="producerVatNumber">N° de TVA</Label>
                      <Input
                        id="producerVatNumber"
                        value={formData.producerVatNumber}
                        onChange={(e) => updateField("producerVatNumber", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="producerPhone">Téléphone *</Label>
                      <Input
                        id="producerPhone"
                        type="tel"
                        value={formData.producerPhone}
                        onChange={(e) => updateField("producerPhone", e.target.value)}
                        required={!formData.sameAsClient}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="producerEmail">Email *</Label>
                      <Input
                        id="producerEmail"
                        type="email"
                        value={formData.producerEmail}
                        onChange={(e) => updateField("producerEmail", e.target.value)}
                        required={!formData.sameAsClient}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="producerSiret">SIRET *</Label>
                      <Input
                        id="producerSiret"
                        value={formData.producerSiret}
                        onChange={(e) => updateField("producerSiret", e.target.value)}
                        required={!formData.sameAsClient}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="producerActivity">Activité *</Label>
                      <Input
                        id="producerActivity"
                        value={formData.producerActivity}
                        onChange={(e) => updateField("producerActivity", e.target.value)}
                        required={!formData.sameAsClient}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* 3. Information déchet */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    3
                  </div>
                  Information déchet
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="wasteName">Nom du déchet *</Label>
                    <Input
                      id="wasteName"
                      value={formData.wasteName}
                      onChange={(e) => updateField("wasteName", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nomenclatureCode">Code nomenclature *</Label>
                    <Input
                      id="nomenclatureCode"
                      value={formData.nomenclatureCode}
                      onChange={(e) => updateField("nomenclatureCode", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="annualQuantity">Quantité annuelle prévue *</Label>
                    <Input
                      id="annualQuantity"
                      value={formData.annualQuantity}
                      onChange={(e) => updateField("annualQuantity", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="collectionFrequency">Fréquence d'enlèvement *</Label>
                    <Input
                      id="collectionFrequency"
                      value={formData.collectionFrequency}
                      onChange={(e) => updateField("collectionFrequency", e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                {/* Procédé ayant généré le déchet */}
                <div className="mb-6">
                  <Label className="text-base font-medium">Procédé ayant généré le déchet *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="destockage"
                        checked={formData.generationProcess.destockage}
                        onCheckedChange={(checked) => updateNestedField("generationProcess", "destockage", checked)}
                      />
                      <Label htmlFor="destockage">Déstockage</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="depollution"
                        checked={formData.generationProcess.depollution}
                        onCheckedChange={(checked) => updateNestedField("generationProcess", "depollution", checked)}
                      />
                      <Label htmlFor="depollution">Dépollution</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="production"
                        checked={formData.generationProcess.production}
                        onCheckedChange={(checked) => updateNestedField("generationProcess", "production", checked)}
                      />
                      <Label htmlFor="production">Production</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="fabricationIncident"
                        checked={formData.generationProcess.fabricationIncident}
                        onCheckedChange={(checked) => updateNestedField("generationProcess", "fabricationIncident", checked)}
                      />
                      <Label htmlFor="fabricationIncident">Incident de fabrication</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="generationOther"
                        checked={formData.generationProcess.other}
                        onCheckedChange={(checked) => updateNestedField("generationProcess", "other", checked)}
                      />
                      <Label htmlFor="generationOther">Autre</Label>
                    </div>
                  </div>
                  
                  {formData.generationProcess.other && (
                    <Input
                      className="mt-2"
                      placeholder="Précisez..."
                      value={formData.generationProcess.otherText}
                      onChange={(e) => updateNestedField("generationProcess", "otherText", e.target.value)}
                    />
                  )}
                </div>
                
                {/* Conditionnement */}
                <div className="mb-6">
                  <Label className="text-base font-medium">Conditionnement *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="containers"
                        checked={formData.packaging.containers}
                        onCheckedChange={(checked) => updateNestedField("packaging", "containers", checked)}
                      />
                      <Label htmlFor="containers">Containers</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="smallConfinements"
                        checked={formData.packaging.smallConfinements}
                        onCheckedChange={(checked) => updateNestedField("packaging", "smallConfinements", checked)}
                      />
                      <Label htmlFor="smallConfinements">Petits confinements</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="drums200L"
                        checked={formData.packaging.drums200L}
                        onCheckedChange={(checked) => updateNestedField("packaging", "drums200L", checked)}
                      />
                      <Label htmlFor="drums200L">Fûts 200L</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bigBag"
                        checked={formData.packaging.bigBag}
                        onCheckedChange={(checked) => updateNestedField("packaging", "bigBag", checked)}
                      />
                      <Label htmlFor="bigBag">Big-bag</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="packagingOther"
                        checked={formData.packaging.other}
                        onCheckedChange={(checked) => updateNestedField("packaging", "other", checked)}
                      />
                      <Label htmlFor="packagingOther">Autre</Label>
                    </div>
                  </div>
                  
                  {formData.packaging.other && (
                    <Input
                      className="mt-2"
                      placeholder="Précisez..."
                      value={formData.packaging.otherText}
                      onChange={(e) => updateNestedField("packaging", "otherText", e.target.value)}
                    />
                  )}
                </div>
                
                {/* Aspect physique */}
                <div className="mb-6">
                  <Label className="text-base font-medium">Aspect physique *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="liquid"
                        checked={formData.physicalAspect.liquid}
                        onCheckedChange={(checked) => updateNestedField("physicalAspect", "liquid", checked)}
                      />
                      <Label htmlFor="liquid">Liquide</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="solid"
                        checked={formData.physicalAspect.solid}
                        onCheckedChange={(checked) => updateNestedField("physicalAspect", "solid", checked)}
                      />
                      <Label htmlFor="solid">Solide</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="pasty"
                        checked={formData.physicalAspect.pasty}
                        onCheckedChange={(checked) => updateNestedField("physicalAspect", "pasty", checked)}
                      />
                      <Label htmlFor="pasty">Pâteux</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="powdery"
                        checked={formData.physicalAspect.powdery}
                        onCheckedChange={(checked) => updateNestedField("physicalAspect", "powdery", checked)}
                      />
                      <Label htmlFor="powdery">Pulvérulent</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="gas"
                        checked={formData.physicalAspect.gas}
                        onCheckedChange={(checked) => updateNestedField("physicalAspect", "gas", checked)}
                      />
                      <Label htmlFor="gas">GAZ</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="physicalOther"
                        checked={formData.physicalAspect.other}
                        onCheckedChange={(checked) => updateNestedField("physicalAspect", "other", checked)}
                      />
                      <Label htmlFor="physicalOther">Autre</Label>
                    </div>
                  </div>
                  
                  {formData.physicalAspect.other && (
                    <Input
                      className="mt-2"
                      placeholder="Précisez..."
                      value={formData.physicalAspect.otherText}
                      onChange={(e) => updateNestedField("physicalAspect", "otherText", e.target.value)}
                    />
                  )}
                </div>
              </div>

              <Separator />

              {/* 4. Constituants principaux */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    4
                  </div>
                  Constituants principaux
                </h3>
                
                <div className="space-y-3">
                  {constituents.map((constituent, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <Input
                          placeholder="Nom du constituant"
                          value={constituent.name}
                          onChange={(e) => updateConstituent(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          placeholder="% (ex: 30%)"
                          value={constituent.percentage}
                          onChange={(e) => updateConstituent(index, 'percentage', e.target.value)}
                        />
                      </div>
                      {constituents.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeConstituent(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addConstituent}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un constituant
                  </Button>
                </div>
                
                <div className="mt-4">
                  <Label>Échantillon ou FDS (PDF, JPG)</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Glissez vos fichiers ici ou cliquez pour parcourir
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Formats acceptés: PDF, JPG, PNG (max 10 Mo)
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 5. Nature du déchet (HP1-HP15) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    5
                  </div>
                  Nature du déchet (Propriétés de danger)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.entries(hazardousPropertiesLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox 
                        id={key}
                        checked={(formData.hazardousProperties as any)[key]}
                        onCheckedChange={(checked) => updateNestedField("hazardousProperties", key, checked)}
                      />
                      <Label htmlFor={key} className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 6. Déchet POP (PFAS) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    6
                  </div>
                  Déchet POP (PFAS)
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isPop"
                        checked={formData.isPop}
                        onCheckedChange={(checked) => updateField("isPop", checked)}
                      />
                      <Label htmlFor="isPop">OUI - Ce déchet contient des substances POP/PFAS</Label>
                    </div>
                  </div>
                  
                  {formData.isPop && (
                    <div>
                      <Label htmlFor="popSubstances">Précisez les substances *</Label>
                      <Textarea
                        id="popSubstances"
                        value={formData.popSubstances}
                        onChange={(e) => updateField("popSubstances", e.target.value)}
                        placeholder="Listez les substances POP/PFAS présentes..."
                        required={formData.isPop}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* 7. Absence d'information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    7
                  </div>
                  Absence d'information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lackOfInformation"
                      checked={formData.lackOfInformation}
                      onCheckedChange={(checked) => updateField("lackOfInformation", checked)}
                    />
                    <Label htmlFor="lackOfInformation">☑ Absence d'information sur le déchet</Label>
                  </div>
                  
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Ne peuvent être admis :</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Substances radioactives</li>
                        <li>DASRI sauf exception</li>
                        <li>PCB/PCT (polychlorobiphényles / terphényles)</li>
                        <li>Tétrachlorure de carbone</li>
                        <li>Explosifs</li>
                        <li>Amiante libre</li>
                        <li>Acide picrique / fluorhydrique</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <Separator />

              {/* 8. Transport */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    8
                  </div>
                  Transport
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Responsable du transport *</Label>
                    <RadioGroup 
                      value={formData.transportResponsible} 
                      onValueChange={(value) => updateField("transportResponsible", value)}
                      className="flex space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="client" id="client" />
                        <Label htmlFor="client">Client</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="remondis" id="remondis" />
                        <Label htmlFor="remondis">Remondis</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="others" id="others" />
                        <Label htmlFor="others">Autres</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dangerClass">Classe de danger</Label>
                      <Input
                        id="dangerClass"
                        value={formData.dangerClass}
                        onChange={(e) => updateField("dangerClass", e.target.value)}
                        placeholder="ex: 2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="unCode">Code UN</Label>
                      <Input
                        id="unCode"
                        value={formData.unCode}
                        onChange={(e) => updateField("unCode", e.target.value)}
                        placeholder="ex: 1950"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="packagingGroup">Groupe d'emballage</Label>
                      <Input
                        id="packagingGroup"
                        value={formData.packagingGroup}
                        onChange={(e) => updateField("packagingGroup", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="transportDesignation">Désignation transport</Label>
                      <Input
                        id="transportDesignation"
                        value={formData.transportDesignation}
                        onChange={(e) => updateField("transportDesignation", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* RGPD */}
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rgpdConsent"
                    checked={formData.rgpdConsent}
                    onCheckedChange={(checked) => updateField("rgpdConsent", checked)}
                    required
                  />
                  <Label htmlFor="rgpdConsent" className="text-sm">
                    J'accepte que mes données personnelles soient traitées conformément à la réglementation RGPD pour le traitement de cette demande. *
                  </Label>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
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