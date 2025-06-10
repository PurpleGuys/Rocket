import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FidDetailModal from "@/components/admin/FidDetailModal";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Download, 
  AlertTriangle,
  Search,
  Filter,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Fid {
  id: number;
  userId: number;
  orderId?: number;
  clientCompanyName: string;
  clientContactName: string;
  clientEmail: string;
  wasteName: string;
  nomenclatureCode: string;
  status: 'pending' | 'validated' | 'rejected' | 'modified';
  validatedBy?: number;
  validatedAt?: string;
  rejectionReason?: string;
  adminComments?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  validatedByUser?: {
    firstName: string;
    lastName: string;
  };
}

export default function AdminFids() {
  const { toast } = useToast();
  const [selectedFid, setSelectedFid] = useState<Fid | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch FIDs
  const { data: fids = [], isLoading } = useQuery({
    queryKey: ["/api/admin/fids", filterStatus, searchTerm],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/fids");
      return response.json();
    },
  });

  const openDetailModal = (fid: Fid) => {
    setSelectedFid(fid);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedFid(null);
    setIsDetailModalOpen(false);
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
      case 'modified':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
          <Edit className="h-3 w-3 mr-1" />
          Modifiée
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const exportToPdf = async (fidId: number) => {
    try {
      const response = await apiRequest("GET", `/api/admin/fids/${fidId}/export-pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FID-${fidId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export PDF",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await fetch('/api/export/fids', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fids_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export réussi",
        description: "Le fichier Excel des FIDs a été téléchargé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export Excel des FIDs",
        variant: "destructive",
      });
    }
  };

  const filteredFids = fids.filter((fid: Fid) => {
    const matchesStatus = filterStatus === "all" || fid.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      fid.clientCompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fid.clientContactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fid.wasteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fid.nomenclatureCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des FID...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des FID</h1>
          <p className="text-gray-600">Validation et gestion des Fiches d'Identification des Déchets</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={exportToExcel}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Excel</span>
          </Button>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="validated">Validées</SelectItem>
              <SelectItem value="rejected">Rejetées</SelectItem>
              <SelectItem value="modified">Modifiées</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fiches d'Identification des Déchets ({filteredFids.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFids.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune FID trouvée</p>
              </div>
            ) : (
              filteredFids.map((fid: Fid) => (
                <div
                  key={fid.id}
                  className="p-4 border rounded-lg transition-colors border-gray-200 hover:border-gray-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      FID #{fid.id} - {fid.clientCompanyName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(fid.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <p><strong>Contact:</strong> {fid.clientContactName}</p>
                      <p><strong>Email:</strong> {fid.clientEmail}</p>
                    </div>
                    <div>
                      <p><strong>Déchet:</strong> {fid.wasteName}</p>
                      <p><strong>Code:</strong> {fid.nomenclatureCode}</p>
                    </div>
                    <div>
                      <p><strong>Créée le:</strong> {format(new Date(fid.createdAt), 'dd/MM/yyyy', { locale: fr })}</p>
                      {fid.validatedBy && fid.validatedAt && (
                        <p><strong>Validée le:</strong> {format(new Date(fid.validatedAt), 'dd/MM/yyyy', { locale: fr })}</p>
                      )}
                    </div>
                  </div>

                  {fid.validatedBy && fid.validatedAt && (
                    <div className="mb-3 text-xs text-gray-500">
                      Validée par {fid.validatedByUser?.firstName} {fid.validatedByUser?.lastName} 
                      le {format(new Date(fid.validatedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </div>
                  )}

                  {fid.rejectionReason && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      <strong>Raison du rejet:</strong> {fid.rejectionReason}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetailModal(fid)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportToPdf(fid.id)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>

                    {fid.adminComments && (
                      <div className="text-xs text-gray-500 max-w-xs truncate" title={fid.adminComments}>
                        <strong>Commentaire:</strong> {fid.adminComments}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* FID Detail Modal */}
      {selectedFid && (
        <FidDetailModal
          fid={selectedFid}
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
        />
      )}
    </div>
  );
}