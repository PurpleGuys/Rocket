import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Save, 
  X, 
  Upload, 
  FileText, 
  Image, 
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Plus
} from "lucide-react";
import { useDropzone } from "react-dropzone";

interface FidDetailModalProps {
  fid: any;
  isOpen: boolean;
  onClose: () => void;
}

interface FileUpload {
  file: File;
  preview: string;
  type: 'sample' | 'fds';
}

export default function FidDetailModal({ fid, isOpen, onClose }: FidDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedFid, setEditedFid] = useState(fid);
  const [validationComment, setValidationComment] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[], fileType: 'sample' | 'fds') => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: fileType
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps: getSampleRootProps, getInputProps: getSampleInputProps, isDragActive: isSampleDragActive } = useDropzone({
    onDrop: (files) => onDrop(files, 'sample'),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: true
  });

  const { getRootProps: getFdsRootProps, getInputProps: getFdsInputProps, isDragActive: isFdsDragActive } = useDropzone({
    onDrop: (files) => onDrop(files, 'fds'),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: true
  });

  // Update FID mutation
  const updateFidMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/admin/fids/${fid.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fids"] });
      setIsEditing(false);
      toast({
        title: "FID mise à jour",
        description: "Les informations ont été mises à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    },
  });

  // Validate FID mutation
  const validateFidMutation = useMutation({
    mutationFn: async ({ status, comment }: { status: 'validated' | 'rejected'; comment?: string }) => {
      const response = await apiRequest("PUT", `/api/admin/fids/${fid.id}/validate`, {
        status,
        adminComments: comment
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fids"] });
      setValidationComment("");
      toast({
        title: "FID mise à jour",
        description: "Le statut de la FID a été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la validation",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateFidMutation.mutate(editedFid);
  };

  const handleValidate = (status: 'validated' | 'rejected') => {
    validateFidMutation.mutate({ status, comment: validationComment });
  };

  const updateField = (field: string, value: any) => {
    setEditedFid((prev: any) => ({ ...prev, [field]: value }));
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <AlertTriangle className="h-3 w-3 mr-1" />
          En attente
        </Badge>;
      case 'validated':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Validée
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Rejetée
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!fid) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">FID #{fid.id} - {fid.clientCompanyName}</DialogTitle>
              <div className="flex items-center space-x-2 mt-2">
                {getStatusBadge(fid.status)}
                <span className="text-sm text-gray-500">
                  Créée le {new Date(fid.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={updateFidMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Modifier
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Informations générales</TabsTrigger>
            <TabsTrigger value="waste">Caractérisation des déchets</TabsTrigger>
            <TabsTrigger value="files">Documents</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="clientCompanyName">Nom de l'entreprise</Label>
                    <Input
                      id="clientCompanyName"
                      value={isEditing ? editedFid.clientCompanyName : fid.clientCompanyName}
                      onChange={(e) => updateField('clientCompanyName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientContactName">Nom du contact</Label>
                    <Input
                      id="clientContactName"
                      value={isEditing ? editedFid.clientContactName : fid.clientContactName}
                      onChange={(e) => updateField('clientContactName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={isEditing ? editedFid.clientEmail : fid.clientEmail}
                      onChange={(e) => updateField('clientEmail', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Téléphone</Label>
                    <Input
                      id="clientPhone"
                      value={isEditing ? editedFid.clientPhone : fid.clientPhone}
                      onChange={(e) => updateField('clientPhone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientAddress">Adresse</Label>
                    <Textarea
                      id="clientAddress"
                      value={isEditing ? editedFid.clientAddress : fid.clientAddress}
                      onChange={(e) => updateField('clientAddress', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientSiret">SIRET</Label>
                    <Input
                      id="clientSiret"
                      value={isEditing ? editedFid.clientSiret : fid.clientSiret}
                      onChange={(e) => updateField('clientSiret', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientActivity">Activité</Label>
                    <Input
                      id="clientActivity"
                      value={isEditing ? editedFid.clientActivity : fid.clientActivity}
                      onChange={(e) => updateField('clientActivity', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Producer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations producteur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fid.sameAsClient ? (
                    <p className="text-sm text-gray-600 italic">
                      Les informations producteur sont identiques au client
                    </p>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="producerCompanyName">Nom de l'entreprise</Label>
                        <Input
                          id="producerCompanyName"
                          value={isEditing ? editedFid.producerCompanyName : fid.producerCompanyName}
                          onChange={(e) => updateField('producerCompanyName', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="producerContactName">Nom du contact</Label>
                        <Input
                          id="producerContactName"
                          value={isEditing ? editedFid.producerContactName : fid.producerContactName}
                          onChange={(e) => updateField('producerContactName', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="producerAddress">Adresse</Label>
                        <Textarea
                          id="producerAddress"
                          value={isEditing ? editedFid.producerAddress : fid.producerAddress}
                          onChange={(e) => updateField('producerAddress', e.target.value)}
                          disabled={!isEditing}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="producerSiret">SIRET</Label>
                        <Input
                          id="producerSiret"
                          value={isEditing ? editedFid.producerSiret : fid.producerSiret}
                          onChange={(e) => updateField('producerSiret', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="waste" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Caractérisation des déchets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wasteName">Nom du déchet</Label>
                    <Input
                      id="wasteName"
                      value={isEditing ? editedFid.wasteName : fid.wasteName}
                      onChange={(e) => updateField('wasteName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nomenclatureCode">Code nomenclature</Label>
                    <Input
                      id="nomenclatureCode"
                      value={isEditing ? editedFid.nomenclatureCode : fid.nomenclatureCode}
                      onChange={(e) => updateField('nomenclatureCode', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="annualQuantity">Quantité annuelle</Label>
                    <Input
                      id="annualQuantity"
                      value={isEditing ? editedFid.annualQuantity : fid.annualQuantity}
                      onChange={(e) => updateField('annualQuantity', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="collectionFrequency">Fréquence de collecte</Label>
                    <Input
                      id="collectionFrequency"
                      value={isEditing ? editedFid.collectionFrequency : fid.collectionFrequency}
                      onChange={(e) => updateField('collectionFrequency', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Constituants principaux</Label>
                  <div className="mt-2">
                    {fid.constituents && Array.isArray(fid.constituents) ? (
                      <div className="space-y-2">
                        {fid.constituents.map((constituent: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <span className="font-medium">{constituent.name}</span>
                            <span className="text-gray-600">: {constituent.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Aucun constituant défini</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Conditionnement</Label>
                  <div className="mt-2">
                    {fid.packaging && Array.isArray(fid.packaging) ? (
                      <div className="flex flex-wrap gap-2">
                        {fid.packaging.map((pack: string, index: number) => (
                          <Badge key={index} variant="outline">{pack}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Aucun conditionnement défini</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Non-admissible section */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-red-600 mb-3">Ne peuvent être admis :</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Déchets radioactifs</li>
                      <li>• Déchets explosifs ou instables</li>
                      <li>• Déchets médicaux et pharmaceutiques</li>
                      <li>• Déchets d'amiante</li>
                      <li>• Déchets contenant des PCB/PCT</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sample Files */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Échantillon</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    {...getSampleRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isSampleDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getSampleInputProps()} />
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {isSampleDragActive 
                        ? 'Déposez les fichiers ici...' 
                        : 'Glissez-déposez ou cliquez pour ajouter des échantillons'
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG acceptés</p>
                  </div>
                  
                  {uploadedFiles.filter(f => f.type === 'sample').length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.filter(f => f.type === 'sample').map((fileUpload, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            {fileUpload.file.type.includes('image') ? (
                              <Image className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            <span className="text-sm">{fileUpload.file.name}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* FDS Files */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">FDS (Fiche de Données de Sécurité)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    {...getFdsRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isFdsDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getFdsInputProps()} />
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {isFdsDragActive 
                        ? 'Déposez les fichiers ici...' 
                        : 'Glissez-déposez ou cliquez pour ajouter des FDS'
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG acceptés</p>
                  </div>
                  
                  {uploadedFiles.filter(f => f.type === 'fds').length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.filter(f => f.type === 'fds').map((fileUpload, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            {fileUpload.file.type.includes('image') ? (
                              <Image className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            <span className="text-sm">{fileUpload.file.name}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validation administrative</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {fid.adminComments && (
                  <div>
                    <Label>Commentaires administrateur</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded">
                      <p className="text-sm">{fid.adminComments}</p>
                    </div>
                  </div>
                )}

                {fid.rejectionReason && (
                  <div>
                    <Label>Raison du rejet</Label>
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-700">{fid.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {fid.status === 'pending' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="validationComment">Commentaire (optionnel)</Label>
                      <Textarea
                        id="validationComment"
                        value={validationComment}
                        onChange={(e) => setValidationComment(e.target.value)}
                        placeholder="Ajouter un commentaire sur cette FID..."
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        onClick={() => handleValidate('validated')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={validateFidMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Valider la FID
                      </Button>
                      <Button
                        onClick={() => handleValidate('rejected')}
                        variant="destructive"
                        className="flex-1"
                        disabled={validateFidMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter la FID
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      // Export to PDF functionality
                      window.open(`/api/admin/fids/${fid.id}/export-pdf`, '_blank');
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter en PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}