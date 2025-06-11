import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { OrderManagement } from "@/components/admin/OrderManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ShoppingCart, 
  Euro, 
  Truck, 
  Users, 
  AlertTriangle,
  Clock,
  Settings,
  FileText,
  Calculator,
  DollarSign,
  Package,
  Info,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  CheckCircle,
  Eye,
  Filter,
  Search,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  CalendarCheck,
  CalendarX,
  Bell,
  BellOff,
  BarChart3,
  Camera,
  Image as ImageIcon,
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown
} from "lucide-react";

// Composant Google Maps pour affichage interactif
function GoogleMapComponent({ clients }: { clients: any[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  // Récupérer la clé API Google Maps depuis le backend
  const { data: mapsConfig } = useQuery({
    queryKey: ['/api/maps/config'],
    retry: false,
    onError: (error: any) => {
      setGeocodingError('Impossible de récupérer la configuration Google Maps');
    }
  });

  useEffect(() => {
    if (!mapsConfig?.apiKey) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsConfig.apiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setGeocodingError('Erreur de chargement de l\'API Google Maps');
    
    if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [mapsConfig]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !clients?.length) return;

    initializeMap();
  }, [isLoaded, clients]);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    // Centre de la France pour l'initialisation
    const map = new google.maps.Map(mapRef.current, {
      zoom: 6,
      center: { lat: 46.603354, lng: 1.888334 }, // Centre de la France
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "poi.business",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "transit",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // Nettoyer les anciens marqueurs
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Créer les marqueurs pour chaque client
    const bounds = new google.maps.LatLngBounds();
    let validLocations = 0;

    for (const client of clients) {
      if (!client.address || !client.city) continue;

      const fullAddress = `${client.address}, ${client.postalCode || ''} ${client.city}, France`;
      
      try {
        const results = await geocodeAddress(fullAddress);
        if (results) {
          const marker = new google.maps.Marker({
            position: results,
            map: map,
            title: client.companyName || `${client.firstName} ${client.lastName}`,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" fill="#ffffff"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(24, 24),
              anchor: new google.maps.Point(12, 24)
            }
          });

          // InfoWindow pour afficher les détails
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-3 max-w-xs">
                <h3 class="font-semibold text-gray-800">${client.companyName || 'Particulier'}</h3>
                <p class="text-sm text-gray-600">${client.firstName} ${client.lastName}</p>
                <p class="text-sm text-gray-500 mt-1">${client.address}</p>
                <p class="text-sm text-gray-500">${client.postalCode || ''} ${client.city}</p>
                ${client.phone ? `<p class="text-sm text-blue-600 mt-1">📞 ${client.phone}</p>` : ''}
                ${client.siret ? `<p class="text-xs text-gray-400 mt-1">SIRET: ${client.siret}</p>` : ''}
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          markersRef.current.push(marker);
          bounds.extend(results);
          validLocations++;
        }
      } catch (error) {
        console.warn('Erreur géocodage pour:', fullAddress, error);
      }
    }

    // Ajuster la vue pour inclure tous les marqueurs
    if (validLocations > 0) {
      if (validLocations === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(12);
      } else {
        map.fitBounds(bounds);
        map.panToBounds(bounds);
      }
    }
  };

  const geocodeAddress = (address: string): Promise<google.maps.LatLng | null> => {
    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].geometry.location);
        } else {
          resolve(null);
        }
      });
    });
  };

  if (geocodingError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MapPin className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Erreur de chargement</h3>
        <p className="text-gray-500">{geocodingError}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Chargement de la carte...</p>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
}

// Composant de carte géographique des clients
function ClientMapPage() {
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { toast } = useToast();

  // Récupérer tous les utilisateurs avec leurs adresses
  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    select: (data) => (data || []).filter((user: any) => 
      user.address && user.city && user.role === 'user'
    )
  });

  // Initialiser la carte
  useEffect(() => {
    if (typeof window !== 'undefined' && clients?.length > 0) {
      loadGoogleMaps();
    }
  }, [clients]);

  const loadGoogleMaps = () => {
    // Pour l'instant, utiliser une carte simple avec les adresses listées
    // L'intégration Google Maps nécessitera une clé API
    setIsMapLoaded(true);
  };

  const getClientStats = () => {
    const totalClients = clients?.length || 0;
    const citiesCount = new Set(clients?.map((c: any) => c.city)).size;
    const companiesCount = clients?.filter((c: any) => c.companyName).length;
    
    return { totalClients, citiesCount, companiesCount };
  };

  const { totalClients, citiesCount, companiesCount } = getClientStats();

  // Grouper les clients par ville
  const clientsByCity = clients?.reduce((acc: any, client: any) => {
    const city = client.city;
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(client);
    return acc;
  }, {}) || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600" />
            Répartition Géographique des Clients
          </CardTitle>
          <CardDescription>
            Visualisation des adresses d'entreprises de vos clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Clients</p>
                  <p className="text-2xl font-bold text-blue-700">{totalClients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Villes Couvertes</p>
                  <p className="text-2xl font-bold text-green-700">{citiesCount}</p>
                </div>
                <MapPin className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Entreprises</p>
                  <p className="text-2xl font-bold text-purple-700">{companiesCount}</p>
                </div>
                <Settings className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Zone de carte interactive Google Maps */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" />
                Carte Interactive des Clients
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Localisation géographique des entreprises clientes
              </p>
            </div>
            <div 
              id="google-map"
              className="w-full h-96 bg-gray-100 flex items-center justify-center"
            >
              {clients && clients.length > 0 ? (
                <GoogleMapComponent clients={clients} />
              ) : (
                <div className="text-center">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucune adresse client disponible pour la cartographie</p>
                </div>
              )}
            </div>
          </div>

          {/* Liste des clients par ville */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Répartition par Ville</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(clientsByCity).map(([city, cityClients]: [string, any]) => (
                <Card key={city} className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {city}
                      <Badge variant="secondary">{cityClients.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {cityClients.slice(0, 3).map((client: any) => (
                        <div key={client.id} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="font-medium">{client.companyName || `${client.firstName} ${client.lastName}`}</div>
                            <div className="text-gray-500 text-xs">{client.address}</div>
                          </div>
                        </div>
                      ))}
                      {cityClients.length > 3 && (
                        <div className="text-xs text-gray-500 mt-2">
                          +{cityClients.length - 3} autres clients
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste détaillée des clients */}
      <Card>
        <CardHeader>
          <CardTitle>Liste Détaillée des Adresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Adresse Complète</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients?.map((client: any) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="font-medium">{client.firstName} {client.lastName}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </TableCell>
                    <TableCell>
                      {client.companyName ? (
                        <div>
                          <div className="font-medium">{client.companyName}</div>
                          {client.siret && (
                            <div className="text-sm text-gray-500">SIRET: {client.siret}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Particulier</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{client.address}</div>
                        <div className="text-sm text-gray-500">
                          {client.postalCode} {client.city}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant de gestion complète des utilisateurs
function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Récupérer tous les utilisateurs
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/users'],
    select: (data) => data || []
  });

  // Mutation pour créer un utilisateur
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/admin/users", userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur a été créé avec succès.",
      });
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'utilisateur.",
        variant: "destructive",
      });
    }
  });

  // Mutation pour mettre à jour un utilisateur
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: number; userData: any }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}`, userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur mis à jour",
        description: "Les informations de l'utilisateur ont été mises à jour.",
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'utilisateur.",
        variant: "destructive",
      });
    }
  });

  // Mutation pour vérifier manuellement un utilisateur
  const verifyUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/verify`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur vérifié",
        description: "L'utilisateur a été vérifié manuellement.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de vérifier l'utilisateur.",
        variant: "destructive",
      });
    }
  });

  // Mutation pour supprimer un utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      });
    }
  });

  // Mutation pour gérer les notifications d'inactivité
  const toggleNotificationMutation = useMutation({
    mutationFn: async ({ userId, enabled }: { userId: number; enabled: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/notifications`, {
        notifyOnInactivity: enabled
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres de notification ont été modifiés.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier les paramètres de notification.",
        variant: "destructive",
      });
    }
  });

  // Filtrer les utilisateurs
  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'verified' && user.isVerified) ||
                         (filterStatus === 'unverified' && !user.isVerified) ||
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'user': return 'Utilisateur';
      default: return role;
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const userData = {
      email: formData.get('email'),
      password: formData.get('password'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
      role: formData.get('role'),
      companyName: formData.get('companyName'),
      siret: formData.get('siret'),
      address: formData.get('address'),
      city: formData.get('city'),
      postalCode: formData.get('postalCode'),
      isVerified: formData.get('isVerified') === 'on',
      isActive: formData.get('isActive') === 'on'
    };
    createUserMutation.mutate(userData);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    const userData = {
      email: formData.get('email'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
      role: formData.get('role'),
      companyName: formData.get('companyName'),
      siret: formData.get('siret'),
      address: formData.get('address'),
      city: formData.get('city'),
      postalCode: formData.get('postalCode'),
      isVerified: formData.get('isVerified') === 'on',
      isActive: formData.get('isActive') === 'on'
    };
    updateUserMutation.mutate({ userId: selectedUser.id, userData });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              Gestion des Utilisateurs
            </CardTitle>
            <CardDescription>
              Gérez tous les comptes utilisateurs - Total: {users?.length || 0} utilisateurs
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                // Export to Excel
                window.open('/api/admin/users/export', '_blank');
              }}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Exporter Excel
            </Button>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un utilisateur
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtres et recherche */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par email, nom, entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Administrateurs</SelectItem>
                <SelectItem value="user">Utilisateurs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="verified">Vérifiés</SelectItem>
                <SelectItem value="unverified">Non vérifiés</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table des utilisateurs */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Notifications</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {user.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                      {user.address && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {user.city}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.companyName ? (
                      <div>
                        <div className="font-medium">{user.companyName}</div>
                        {user.siret && (
                          <div className="text-sm text-gray-500">SIRET: {user.siret}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Particulier</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={user.isVerified ? "default" : "destructive"}>
                        {user.isVerified ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Vérifié
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Non vérifié
                          </>
                        )}
                      </Badge>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? (
                          <>
                            <Unlock className="h-3 w-3 mr-1" />
                            Actif
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            Inactif
                          </>
                        )}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {user.notifyOnInactivity ? (
                          <Bell className="h-4 w-4 text-green-600" />
                        ) : (
                          <BellOff className="h-4 w-4 text-gray-400" />
                        )}
                        <Switch
                          checked={user.notifyOnInactivity || false}
                          onCheckedChange={(checked) => 
                            toggleNotificationMutation.mutate({ 
                              userId: user.id, 
                              enabled: checked 
                            })
                          }
                          disabled={toggleNotificationMutation.isPending}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {user.notifyOnInactivity ? "Activées" : "Désactivées"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!user.isVerified && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyUserMutation.mutate(user.id)}
                          disabled={verifyUserMutation.isPending}
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Vérifier
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.email} ?`)) {
                            deleteUserMutation.mutate(user.id);
                          }
                        }}
                        disabled={deleteUserMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun utilisateur trouvé avec les critères sélectionnés
          </div>
        )}
      </CardContent>

      {/* Dialog de création d'utilisateur */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Créez un nouveau compte utilisateur avec tous les détails nécessaires.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mot de passe *</label>
                <Input name="password" type="password" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom *</label>
                <Input name="firstName" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom *</label>
                <Input name="lastName" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Téléphone</label>
                <Input name="phone" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rôle</label>
                <Select name="role" defaultValue="user">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Informations entreprise</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom de l'entreprise</label>
                  <Input name="companyName" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SIRET</label>
                  <Input name="siret" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Adresse</label>
                <Input name="address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ville</label>
                  <Input name="city" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Code postal</label>
                  <Input name="postalCode" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Paramètres du compte</h4>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" name="isVerified" className="rounded" defaultChecked />
                  <label className="text-sm font-medium">Compte vérifié</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" name="isActive" className="rounded" defaultChecked />
                  <label className="text-sm font-medium">Compte actif</label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? 'Création...' : 'Créer l\'utilisateur'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification d'utilisateur */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur {selectedUser?.email}.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input name="email" type="email" defaultValue={selectedUser.email} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prénom *</label>
                  <Input name="firstName" defaultValue={selectedUser.firstName} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom *</label>
                  <Input name="lastName" defaultValue={selectedUser.lastName} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Téléphone</label>
                  <Input name="phone" defaultValue={selectedUser.phone} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rôle</label>
                  <Select name="role" defaultValue={selectedUser.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Informations entreprise</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom de l'entreprise</label>
                    <Input name="companyName" defaultValue={selectedUser.companyName} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SIRET</label>
                    <Input name="siret" defaultValue={selectedUser.siret} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse</label>
                  <Input name="address" defaultValue={selectedUser.address} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ville</label>
                    <Input name="city" defaultValue={selectedUser.city} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Code postal</label>
                    <Input name="postalCode" defaultValue={selectedUser.postalCode} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Paramètres du compte</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" name="isVerified" className="rounded" defaultChecked={selectedUser.isVerified} />
                    <label className="text-sm font-medium">Compte vérifié</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" name="isActive" className="rounded" defaultChecked={selectedUser.isActive} />
                    <label className="text-sm font-medium">Compte actif</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Composant de gestion des commandes
function OrdersManagementSection({ allOrders }: { allOrders: any }) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { toast } = useToast();

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: number; newStatus: string }) => {
      await apiRequest('PUT', `/api/admin/orders/${orderId}/status`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la commande a été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la commande.",
        variant: "destructive",
      });
    }
  });

  const filteredOrders = allOrders?.filter((order: any) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Livrée';
      case 'confirmed': return 'Confirmée';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-red-600" />
              Gestion des Commandes
            </CardTitle>
            <CardDescription>
              Gérez toutes les commandes de bennes - Total: {allOrders?.length || 0} commandes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtres et recherche */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par numéro, nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmées</SelectItem>
                <SelectItem value="delivered">Livrées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table des commandes */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerFirstName} {order.customerLastName}</p>
                        <p className="text-sm text-gray-500">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{order.deliveryStreet}</p>
                        <p className="text-sm text-gray-500">{order.deliveryPostalCode} {order.deliveryCity}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{order.totalTTC}€</TableCell>
                    <TableCell>
                      <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                        {order.paymentStatus === 'paid' ? 'Payé' : order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Détails de la commande {order.orderNumber}</DialogTitle>
                            </DialogHeader>
                            <OrderDetailsModal order={order} onStatusUpdate={updateOrderStatusMutation} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingCart className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">
                        {searchTerm || filterStatus !== 'all' 
                          ? 'Aucune commande ne correspond aux critères de recherche'
                          : 'Aucune commande trouvée'
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant modal des détails de commande
function OrderDetailsModal({ order, onStatusUpdate, isAdmin = false }: { order: any; onStatusUpdate: any; isAdmin?: boolean }) {
  const [newStatus, setNewStatus] = useState(order.status);

  const handleStatusUpdate = () => {
    if (newStatus !== order.status) {
      onStatusUpdate.mutate({ orderId: order.id, newStatus });
    }
  };

  return (
    <div className="space-y-6">
      {/* Informations client */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Informations Client</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Nom:</span> {order.customerFirstName} {order.customerLastName}</p>
            <p><span className="font-medium">Email:</span> {order.customerEmail}</p>
            <p><span className="font-medium">Téléphone:</span> {order.customerPhone}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Adresse de Livraison</h3>
          <div className="space-y-2 text-sm">
            <p>{order.deliveryStreet}</p>
            <p>{order.deliveryPostalCode} {order.deliveryCity}</p>
            <p>{order.deliveryCountry}</p>
            {order.deliveryNotes && (
              <p><span className="font-medium">Notes:</span> {order.deliveryNotes}</p>
            )}
          </div>
        </div>
      </div>

      {/* Détails de la commande */}
      <div>
        <h3 className="font-semibold mb-2">Détails de la Commande</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Numéro:</span> {order.orderNumber}</p>
          <p><span className="font-medium">Durée:</span> {order.durationDays} jours</p>
          <p><span className="font-medium">Types de déchets:</span> {order.wasteTypes?.join(', ')}</p>
          <p><span className="font-medium">Date de création:</span> {new Date(order.createdAt).toLocaleString('fr-FR')}</p>
        </div>
      </div>

      {/* Détails financiers */}
      <div>
        <h3 className="font-semibold mb-2">Détails Financiers</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Prix de base:</span> {order.basePrice}€</p>
          <p><span className="font-medium">Prix durée:</span> {order.durationPrice}€</p>
          <p><span className="font-medium">Frais de livraison:</span> {order.deliveryFee}€</p>
          <p><span className="font-medium">Total HT:</span> {order.totalHT}€</p>
          <p><span className="font-medium">TVA:</span> {order.vat}€</p>
          <p className="font-bold"><span className="font-medium">Total TTC:</span> {order.totalTTC}€</p>
        </div>
      </div>

      {/* Gestion du statut - seulement pour admin */}
      {isAdmin && (
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Gestion du Statut</h3>
          <div className="flex items-center gap-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleStatusUpdate}
              disabled={newStatus === order.status || onStatusUpdate.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {onStatusUpdate.isPending ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </div>
        </div>
      )}

      {/* Gestion post-commande - seulement pour admin */}
      {isAdmin && (
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Gestion Post-Commande</h3>
          <OrderManagement order={order} />
        </div>
      )}
    </div>
  );
}

// Composant principal du dashboard
function DashboardHome() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
  });

  const { data: allOrders } = useQuery({
    queryKey: ["/api/admin/orders"],
    enabled: isAdmin,
  });

  const { data: userOrders } = useQuery({
    queryKey: ["/api/orders/my-orders"],
    enabled: !isAdmin,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de bord
        </h1>
        <p className="text-gray-600">
          Bienvenue {user?.firstName}, voici un aperçu de votre activité
        </p>
      </div>

      {isAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commandes Aujourd'hui</CardTitle>
                <ShoppingCart className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">
                  {stats?.todayOrders || 0}
                </div>
                <p className="text-xs text-gray-600">
                  {stats?.ordersGrowth ? (
                    stats.ordersGrowth > 0 ? `+${stats.ordersGrowth}%` : `${stats.ordersGrowth}%`
                  ) : '0%'} par rapport à hier
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
                <Euro className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">
                  {stats?.monthlyRevenue || '0'} €
                </div>
                <p className="text-xs text-gray-600">
                  {stats?.revenueGrowth ? (
                    stats.revenueGrowth > 0 ? `+${stats.revenueGrowth}%` : `${stats.revenueGrowth}%`
                  ) : '0%'} par rapport au mois dernier
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bennes Louées</CardTitle>
                <Truck className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">
                  {stats?.rentedDumpsters || 0}
                </div>
                <p className="text-xs text-gray-600">
                  En cours de location
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
                <Users className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">
                  {stats?.activeCustomers || 0}
                </div>
                <p className="text-xs text-gray-600">
                  +12% ce mois-ci
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Section Gestion des Commandes */}
          <OrdersManagementSection allOrders={allOrders} />


        </div>
      )}

      {!isAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-red-600" />
                  Mes Commandes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-700">
                  {userOrders?.length || 0}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Commandes passées
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-red-600" />
                  En Cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-700">
                  {userOrders?.filter((order: any) => order.status === 'active')?.length || 0}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Locations actives
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-red-600" />
                  Déchets Traités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-700">
                  2.4t
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Déchets recyclés
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Commandes Récentes</CardTitle>
              <CardDescription>
                Vos dernières réservations de bennes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userOrders && userOrders.length > 0 ? (
                <div className="space-y-4">
                  {userOrders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Truck className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Commande #{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={order.status === 'completed' ? 'default' : 'secondary'}
                          className={order.status === 'completed' ? 'bg-red-100 text-red-700' : ''}
                        >
                          {order.status === 'completed' ? 'Terminée' : 
                           order.status === 'active' ? 'En cours' : 
                           order.status === 'pending' ? 'En attente' : order.status}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          {order.totalPrice} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune commande pour le moment</p>
                  <p className="text-sm text-gray-400">
                    Commencez par réserver votre première benne
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}



// Composants pour les différentes pages du dashboard
function OrdersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { toast } = useToast();

  // Charger toutes les commandes selon le rôle
  const { data: allOrders, isLoading } = useQuery({
    queryKey: isAdmin ? ["/api/admin/orders"] : ["/api/orders/my-orders"],
    enabled: !!user,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: number; newStatus: string }) => {
      await apiRequest('PUT', `/api/admin/orders/${orderId}/status`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la commande a été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la commande.",
        variant: "destructive",
      });
    }
  });

  // Filtrage et recherche
  const filteredOrders = allOrders?.filter((order: any) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
    const matchesSearch = !searchTerm || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryCity?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPayment && matchesSearch;
  }) || [];

  // Tri
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date_asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'amount_desc':
        return parseFloat(b.totalTTC) - parseFloat(a.totalTTC);
      case 'amount_asc':
        return parseFloat(a.totalTTC) - parseFloat(b.totalTTC);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  // Pagination
  const totalItems = sortedOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Livrée';
      case 'confirmed': return 'Confirmée';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getPaymentColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Toutes les Commandes' : 'Mes Commandes'}
          </h1>
          <p className="text-gray-600">
            Historique complet - {totalItems} commande{totalItems > 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Filtres et contrôles */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Recherche */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher commande, client, ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtre par statut */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmées</SelectItem>
                <SelectItem value="delivered">Livrées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtre par paiement */}
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger>
                <SelectValue placeholder="Paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les paiements</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
              </SelectContent>
            </Select>

            {/* Tri */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Plus récent</SelectItem>
                <SelectItem value="date_asc">Plus ancien</SelectItem>
                <SelectItem value="amount_desc">Montant élevé</SelectItem>
                <SelectItem value="amount_asc">Montant faible</SelectItem>
                <SelectItem value="status">Statut</SelectItem>
              </SelectContent>
            </Select>

            {/* Pagination */}
            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(parseInt(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 par page</SelectItem>
                <SelectItem value="25">25 par page</SelectItem>
                <SelectItem value="50">50 par page</SelectItem>
                <SelectItem value="100">100 par page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {filteredOrders.filter(o => o.paymentStatus === 'paid').length}
            </div>
            <p className="text-sm text-gray-600">Commandes payées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredOrders.filter(o => o.status === 'delivered').length}
            </div>
            <p className="text-sm text-gray-600">Bennes livrées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredOrders.reduce((sum, o) => sum + parseFloat(o.totalTTC || 0), 0).toFixed(2)}€
            </div>
            <p className="text-sm text-gray-600">Chiffre d'affaires</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(filteredOrders.map(o => o.customerEmail)).size}
            </div>
            <p className="text-sm text-gray-600">Clients uniques</p>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des commandes */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.customerFirstName} {order.customerLastName}
                          </p>
                          <p className="text-sm text-gray-500">{order.customerEmail}</p>
                          {order.customerPhone && (
                            <p className="text-sm text-gray-500">{order.customerPhone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{order.deliveryStreet}</p>
                          <p className="text-sm text-gray-500">
                            {order.deliveryPostalCode} {order.deliveryCity}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">Service #{order.serviceId}</p>
                          <p className="text-sm text-gray-500">
                            {order.durationDays} jour{order.durationDays > 1 ? 's' : ''}
                          </p>
                          {order.wasteTypes && order.wasteTypes.length > 0 && (
                            <p className="text-sm text-gray-500">
                              {order.wasteTypes.join(', ')}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold">{order.totalTTC}€</p>
                          <p className="text-sm text-gray-500">TTC</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentColor(order.paymentStatus)}>
                          {order.paymentStatus === 'paid' ? 'Payé' : 
                           order.paymentStatus === 'pending' ? 'En attente' :
                           order.paymentStatus === 'failed' ? 'Échoué' : order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Détails de la commande {order.orderNumber}
                                </DialogTitle>
                              </DialogHeader>
                              <OrderDetailsModal 
                                order={order} 
                                onStatusUpdate={updateOrderStatusMutation}
                                isAdmin={isAdmin}
                              />
                            </DialogContent>
                          </Dialog>
                          
                          {/* Boutons de gestion des dates de livraison */}
                          {order.status === 'pending' && order.deliveryDate && (
                            <>
                              <DeliveryDateConfirmDialog 
                                order={order}
                                onSuccess={() => {
                                  queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
                                  toast({
                                    title: "Date confirmée",
                                    description: "La date de livraison a été confirmée et l'email envoyé au client.",
                                  });
                                }}
                              />
                              <DeliveryDateModifyDialog 
                                order={order}
                                onSuccess={() => {
                                  queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
                                  toast({
                                    title: "Proposition envoyée",
                                    description: "La nouvelle date a été proposée au client par email.",
                                  });
                                }}
                              />
                            </>
                          )}
                          
                          {/* Bouton de suppression */}
                          {isAdmin && (
                            <DeleteOrderDialog 
                              order={order}
                              onSuccess={() => {
                                queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
                                queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
                                toast({
                                  title: "Commande supprimée",
                                  description: "La commande a été supprimée avec succès.",
                                });
                              }}
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">
                          {searchTerm || filterStatus !== 'all' || filterPayment !== 'all'
                            ? 'Aucune commande ne correspond aux critères de recherche'
                            : 'Aucune commande trouvée'
                          }
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, totalItems)} sur {totalItems} commandes
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={pageNum === currentPage ? "bg-red-600 hover:bg-red-700" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ConfigurationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ma Configuration</h1>
        <p className="text-gray-600">Paramètres du compte et préférences</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Informations personnelles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Mot de passe et authentification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Préférences de notification</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mes Activités</h1>
        <p className="text-gray-600">Journal d'activité de votre compte</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Journal d'activité à venir...</p>
        </CardContent>
      </Card>
    </div>
  );
}

function RentalPricingPage() {
  const [activeTab, setActiveTab] = useState("daily");
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{[key: number]: {dailyRate: string, billingStartDay: string, maxTonnage: string}}>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedServiceForPhotos, setSelectedServiceForPhotos] = useState<any>(null);
  const [newServiceForm, setNewServiceForm] = useState({
    name: "",
    volume: "",
    basePrice: "",
    description: "",
    maxWeight: "",
    wasteTypes: [] as string[],
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: rentalPricing, refetch: refetchPricing } = useQuery({
    queryKey: ["/api/admin/rental-pricing"],
  });

  const updatePricingMutation = {
    mutate: async (data: {serviceId: number, dailyRate: string, billingStartDay: number, maxTonnage: string}) => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch("/api/admin/rental-pricing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            serviceId: data.serviceId,
            dailyRate: data.dailyRate,
            billingStartDay: data.billingStartDay,
            maxTonnage: data.maxTonnage,
            isActive: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        refetchPricing();
        setEditingRowId(null);
        setFormData({});
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
      }
    },
    isPending: false,
  };

  const handleEdit = (serviceId: number) => {
    const existingPricing = rentalPricing?.find((p: any) => p.serviceId === serviceId);
    setEditingRowId(serviceId);
    setFormData({
      ...formData,
      [serviceId]: {
        dailyRate: existingPricing?.dailyRate || "0",
        billingStartDay: existingPricing?.billingStartDay?.toString() || "0",
        maxTonnage: existingPricing?.maxTonnage || "0",
      }
    });
  };

  const handleSave = (serviceId: number) => {
    const data = formData[serviceId];
    if (data) {
      updatePricingMutation.mutate({
        serviceId,
        dailyRate: data.dailyRate,
        billingStartDay: parseInt(data.billingStartDay),
        maxTonnage: data.maxTonnage,
      });
    }
  };

  const handleCancel = () => {
    setEditingRowId(null);
    setFormData({});
  };

  const updateFormField = (serviceId: number, field: string, value: string) => {
    setFormData({
      ...formData,
      [serviceId]: {
        ...formData[serviceId],
        [field]: value,
      }
    });
  };

  const getCurrentPricing = (serviceId: number) => {
    return rentalPricing?.find((p: any) => p.serviceId === serviceId);
  };

  const addServiceMutation = {
    mutate: async (serviceData: any) => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch("/api/admin/services", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(serviceData),
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        // Refresh services list
        const servicesResponse = await fetch("/api/services");
        if (servicesResponse.ok) {
          window.location.reload(); // Simple refresh for now
        }

        setShowAddModal(false);
        setNewServiceForm({
          name: "",
          volume: "",
          basePrice: "",
          description: "",
          maxWeight: "",
          wasteTypes: [],
        });
      } catch (error) {
        console.error("Erreur lors de l'ajout:", error);
      }
    },
    isPending: false,
  };

  const deleteServiceMutation = {
    mutate: async (serviceId: number) => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`/api/admin/services/${serviceId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        window.location.reload(); // Simple refresh for now
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    },
    isPending: false,
  };

  const deletePricingMutation = {
    mutate: async (serviceId: number) => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`/api/admin/rental-pricing/${serviceId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        refetchPricing();
      } catch (error) {
        console.error("Erreur lors de la suppression du tarif:", error);
      }
    },
    isPending: false,
  };

  const handleAddService = () => {
    const serviceData = {
      name: newServiceForm.name,
      volume: parseInt(newServiceForm.volume),
      basePrice: newServiceForm.basePrice,
      description: newServiceForm.description,
      maxWeight: parseInt(newServiceForm.maxWeight) || null,
      wasteTypes: newServiceForm.wasteTypes,
      isActive: true,
    };

    addServiceMutation.mutate(serviceData);
  };

  const handleDeleteService = (serviceId: number, serviceName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la benne "${serviceName}" ? Cette action est irréversible.`)) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  const handleDeletePricing = (serviceId: number, serviceName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le tarif pour "${serviceName}" ?`)) {
      deletePricingMutation.mutate(serviceId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prix de Location</h1>
          <p className="text-gray-600">Configuration des tarifs de location par équipement</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Ajouter une benne
        </button>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("daily")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "daily"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Prix journalier
          </button>

        </nav>
      </div>

      {activeTab === "daily" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              Tarifs Journaliers
            </CardTitle>
            <CardDescription>
              Définissez les prix de location quotidiens pour chaque type d'équipement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Équipement</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Prix / Jour
                      <div className="group relative inline-block ml-2">
                        <span className="text-gray-400 cursor-help">ⓘ</span>
                        <div className="invisible group-hover:visible absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          Tarif appliqué par jour de location (€/jour)
                        </div>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Début de Facturation
                      <div className="group relative inline-block ml-2">
                        <span className="text-gray-400 cursor-help">ⓘ</span>
                        <div className="invisible group-hover:visible absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          Jour à partir duquel le tarif est appliqué (0 = dès le premier jour)
                        </div>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Tonnage Max
                      <div className="group relative inline-block ml-2">
                        <span className="text-gray-400 cursor-help">ⓘ</span>
                        <div className="invisible group-hover:visible absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          Capacité maximale en tonnes pour le calcul des coûts de traitement
                        </div>
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services?.map((service: any) => {
                    const isEditing = editingRowId === service.id;
                    const currentPricing = getCurrentPricing(service.id);
                    const currentForm = formData[service.id];

                    return (
                      <tr key={service.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <Truck className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{service.name}</p>
                              <p className="text-sm text-gray-500">{service.volume}m³</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={currentForm?.dailyRate || ""}
                                onChange={(e) => updateFormField(service.id, "dailyRate", e.target.value)}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="0.00"
                              />
                              <span className="text-gray-500">€/jour</span>
                            </div>
                          ) : (
                            <span className="text-gray-900">
                              {currentPricing ? `${currentPricing.dailyRate} €/jour` : "-"}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={currentForm?.billingStartDay || ""}
                                onChange={(e) => updateFormField(service.id, "billingStartDay", e.target.value)}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="0"
                              />
                              <span className="text-gray-500">jour(s)</span>
                            </div>
                          ) : (
                            <span className="text-gray-900">
                              {currentPricing ? `${currentPricing.billingStartDay} jour(s)` : "-"}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={currentForm?.maxTonnage || ""}
                                onChange={(e) => updateFormField(service.id, "maxTonnage", e.target.value)}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="0.0"
                              />
                              <span className="text-gray-500">tonnes</span>
                            </div>
                          ) : (
                            <span className="text-gray-900">
                              {currentPricing ? `${currentPricing.maxTonnage} tonnes` : "-"}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSave(service.id)}
                                disabled={updatePricingMutation.isPending}
                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                              >
                                {updatePricingMutation.isPending ? "..." : "Valider"}
                              </button>
                              <button
                                onClick={handleCancel}
                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(service.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => setSelectedServiceForPhotos(service)}
                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                                title="Gérer les photos"
                              >
                                Photos
                              </button>
                              {currentPricing && (
                                <button
                                  onClick={() => handleDeletePricing(service.id, service.name)}
                                  className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                                  title="Supprimer le tarif"
                                >
                                  Suppr. tarif
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteService(service.id, service.name)}
                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                                title="Supprimer la benne"
                              >
                                Suppr. benne
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {services && services.length === 0 && (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun équipement disponible</p>
                <p className="text-sm text-gray-400">
                  Ajoutez des équipements pour configurer les tarifs
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}



      {/* Modale d'ajout de benne */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ajouter une nouvelle benne</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la benne
                </label>
                <input
                  type="text"
                  value={newServiceForm.name}
                  onChange={(e) => setNewServiceForm({...newServiceForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ex: Benne 20m³"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume (m³)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newServiceForm.volume}
                  onChange={(e) => setNewServiceForm({...newServiceForm, volume: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ex: 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix de base (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newServiceForm.basePrice}
                  onChange={(e) => setNewServiceForm({...newServiceForm, basePrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ex: 350.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newServiceForm.description}
                  onChange={(e) => setNewServiceForm({...newServiceForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ex: Idéale pour gros travaux de construction"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poids maximum (tonnes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newServiceForm.maxWeight}
                  onChange={(e) => setNewServiceForm({...newServiceForm, maxWeight: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ex: 10"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewServiceForm({
                    name: "",
                    volume: "",
                    basePrice: "",
                    description: "",
                    maxWeight: "",
                    wasteTypes: [],
                  });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={handleAddService}
                disabled={!newServiceForm.name || !newServiceForm.volume || !newServiceForm.basePrice}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de gestion des photos */}
      {selectedServiceForPhotos && (
        <PhotoManagementModal
          service={selectedServiceForPhotos}
          onClose={() => setSelectedServiceForPhotos(null)}
        />
      )}
    </div>
  );
}

function TransportPricingPage() {
  const [activeTab, setActiveTab] = useState<'kilometric' | 'immediate'>('kilometric');
  const { toast } = useToast();

  // Récupérer les tarifs de transport actuels
  const { data: transportPricing, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/transport-pricing'],
    select: (data) => data || {
      pricePerKm: "0",
      minimumFlatRate: "0", 
      hourlyRate: "0",
      immediateLoadingEnabled: true
    }
  });

  // Mutation pour mettre à jour les tarifs
  const updatePricingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/admin/transport-pricing", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tarifs mis à jour",
        description: "Les tarifs de transport ont été sauvegardés avec succès.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les tarifs de transport.",
        variant: "destructive",
      });
    },
  });

  const handleKilometricSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updatePricingMutation.mutate({
      pricePerKm: formData.get('pricePerKm')?.toString() || "0",
      minimumFlatRate: formData.get('minimumFlatRate')?.toString() || "0",
      hourlyRate: transportPricing?.hourlyRate || "0",
      immediateLoadingEnabled: transportPricing?.immediateLoadingEnabled
    });
  };

  const handleImmediateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const hourlyRate = formData.get('hourlyRate')?.toString() || "0";
    
    updatePricingMutation.mutate({
      pricePerKm: transportPricing?.pricePerKm || "0",
      minimumFlatRate: transportPricing?.minimumFlatRate || "0",
      hourlyRate,
      immediateLoadingEnabled: hourlyRate !== "0" && hourlyRate !== "0.00"
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prix de Transport</h1>
          <p className="text-gray-600">Configuration des tarifs de transport</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prix de Transport</h1>
          <p className="text-gray-600">Configuration des tarifs de transport et chargement</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Info className="h-4 w-4" />
          <span>API gratuite pour calcul de distances</span>
        </div>
      </div>

      {/* Onglets */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('kilometric')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'kilometric'
                  ? 'border-[rgb(220, 38, 38)] text-[rgb(220, 38, 38)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tarification kilométrique
            </button>
            <button
              onClick={() => setActiveTab('immediate')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'immediate'
                  ? 'border-[rgb(220, 38, 38)] text-[rgb(220, 38, 38)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Chargement immédiat
            </button>
          </nav>
        </div>

        <CardContent className="p-6">
          {activeTab === 'kilometric' && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Tarification kilométrique</p>
                  <p>Configurez le prix par kilomètre pour les trajets aller-retour depuis votre site d'activité. Un prix forfaitaire minimum peut être appliqué.</p>
                </div>
              </div>

              <form onSubmit={handleKilometricSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix par kilomètre (aller-retour)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="pricePerKm"
                        step="0.01"
                        min="0"
                        defaultValue={transportPricing?.pricePerKm || "0"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(220, 38, 38)] focus:border-transparent pr-12"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 text-sm">€/km</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix forfaitaire minimum
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="minimumFlatRate"
                        step="0.01"
                        min="0"
                        defaultValue={transportPricing?.minimumFlatRate || "0"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(220, 38, 38)] focus:border-transparent pr-8"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 text-sm">€</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updatePricingMutation.isPending}
                    className="px-6 py-2 bg-[rgb(220, 38, 38)] text-white rounded-md hover:bg-[rgb(185, 28, 28)] focus:outline-none focus:ring-2 focus:ring-[rgb(220, 38, 38)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatePricingMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder les tarifs'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'immediate' && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                <Info className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="text-sm text-orange-700">
                  <p className="font-medium">Chargement immédiat</p>
                  <p>Configurez le tarif horaire appliqué pour chaque heure de présence du véhicule chez le client. Facturation minimale d'une heure. Cette option est automatiquement désactivée si le prix horaire est fixé à 0 €.</p>
                </div>
              </div>

              <form onSubmit={handleImmediateSubmit} className="space-y-6">
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix horaire
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="hourlyRate"
                      step="0.01"
                      min="0"
                      defaultValue={transportPricing?.hourlyRate || "0"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(220, 38, 38)] focus:border-transparent pr-12"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 text-sm">€/h</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className={`h-3 w-3 rounded-full ${
                    transportPricing?.immediateLoadingEnabled ? 'bg-red-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-700">
                    <strong>Statut:</strong> {transportPricing?.immediateLoadingEnabled ? 'Activé' : 'Désactivé'}
                    {!transportPricing?.immediateLoadingEnabled && ' (prix horaire = 0 €)'}
                  </span>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updatePricingMutation.isPending}
                    className="px-6 py-2 bg-[rgb(220, 38, 38)] text-white rounded-md hover:bg-[rgb(185, 28, 28)] focus:outline-none focus:ring-2 focus:ring-[rgb(220, 38, 38)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatePricingMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder les tarifs'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TreatmentPricingPage() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedWasteType, setSelectedWasteType] = useState<number | null>(null);
  const [selectedWasteTypeName, setSelectedWasteTypeName] = useState<string>('');
  const [editingPricing, setEditingPricing] = useState<any>(null);

  // Codes exutoires disponibles selon le cahier des charges
  const OUTLET_CODES = [
    // Codes D (Élimination)
    { code: "D1", description: "Dépôt sur ou dans le sol (par exemple, mise en décharge)" },
    { code: "D2", description: "Traitement en milieu terrestre (par exemple, biodégradation de déchets liquides ou de boues dans les sols)" },
    { code: "D3", description: "Injection en profondeur (par exemple, injection de déchets pompables dans des puits, des dômes de sel ou des failles géologiques naturelles)" },
    { code: "D4", description: "Lagunage (par exemple, déversement de déchets liquides ou de boues dans des puits, des étangs ou des bassins)" },
    { code: "D5", description: "Mise en décharge spécialement aménagée (par exemple, placement dans des alvéoles étanches séparées, recouvertes et isolées les unes des autres et de l'environnement)" },
    { code: "D6", description: "Rejet dans le milieu aquatique, sauf l'immersion" },
    { code: "D7", description: "Immersion, y compris enfouissement dans le sous-sol marin" },
    { code: "D8", description: "Traitement biologique non spécifié ailleurs, aboutissant à des composés ou à des mélanges qui sont éliminés selon un des procédés numérotés D 1 à D 12" },
    { code: "D9", description: "Traitement physico-chimique non spécifié ailleurs, aboutissant à des composés ou à des mélanges qui sont éliminés selon l'un des procédés numérotés D 1 à D 12" },
    { code: "D10", description: "Incinération à terre" },
    { code: "D11", description: "Incinération en mer" },
    { code: "D12", description: "Stockage permanent (par exemple, placement de conteneurs dans une mine)" },
    { code: "D13", description: "Regroupement ou mélange préalablement à l'une des opérations numérotées D 1 à D 12" },
    { code: "D14", description: "Reconditionnement préalablement à l'une des opérations numérotées D 1 à D 13" },
    { code: "D15", description: "Stockage préalablement à l'une des opérations numérotées D 1 à D 14 (à l'exclusion du stockage temporaire, avant collecte, sur le site de production des déchets)" },
    // Codes R (Valorisation)
    { code: "R1", description: "Utilisation principale comme combustible ou autre moyen de produire de l'énergie" },
    { code: "R2", description: "Récupération ou régénération des solvants" },
    { code: "R3", description: "Recyclage ou récupération des substances organiques qui ne sont pas utilisées comme solvants (y compris les opérations de compostage et autres transformations biologiques)" },
    { code: "R4", description: "Recyclage ou récupération des métaux et des composés métalliques" },
    { code: "R5", description: "Recyclage ou récupération d'autres matières inorganiques" },
    { code: "R6", description: "Régénération des acides ou des bases" },
    { code: "R7", description: "Récupération des produits servant à capter les polluants" },
    { code: "R8", description: "Récupération des produits provenant des catalyseurs" },
    { code: "R9", description: "Régénération ou autres réemplois des huiles" },
    { code: "R10", description: "Epandage sur le sol au profit de l'agriculture ou de l'écologie" },
    { code: "R11", description: "Utilisation de déchets résiduels obtenus à partir de l'une des opérations numérotées R1 à R10" },
    { code: "R12", description: "Echange de déchets en vue de les soumettre à l'une des opérations numérotées R1 à R11" },
  ];

  // Récupérer les activités de l'entreprise
  const { data: companyActivities } = useQuery({
    queryKey: ['/api/admin/company-activities'],
    select: (data) => data || null
  });

  // Récupérer les types de déchets
  const { data: wasteTypes, refetch: refetchWasteTypes } = useQuery({
    queryKey: ['/api/admin/waste-types'],
    select: (data) => data || []
  });

  // Récupérer les tarifs de traitement
  const { data: treatmentPricing, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/treatment-pricing'],
    select: (data) => data || []
  });

  // Mutation pour créer un type de déchet
  const createWasteTypeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/waste-types", data);
      return response.json();
    },
    onSuccess: (createdWasteType) => {
      // Configurer automatiquement le formulaire avec le nouveau type créé
      setSelectedWasteType(createdWasteType.id);
      setShowAddForm(true);
      refetchWasteTypes();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le type de matière.",
        variant: "destructive",
      });
    },
  });

  // Mutation pour créer/mettre à jour un tarif de traitement
  const createTreatmentPricingMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Données envoyées pour création:", data);
      const response = await apiRequest("POST", "/api/admin/treatment-pricing", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Tarif créé avec succès:", data);
      toast({
        title: "Tarif configuré",
        description: "Le tarif de traitement a été sauvegardé avec succès.",
      });
      setShowAddForm(false);
      setSelectedWasteType(null);
      setSelectedWasteTypeName('');
      setEditingPricing(null);
      refetch();
    },
    onError: (error: any) => {
      console.error("Erreur lors de la création du tarif:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Impossible de sauvegarder le tarif de traitement.",
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour un tarif de traitement
  const updateTreatmentPricingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/admin/treatment-pricing/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tarif modifié",
        description: "Le tarif de traitement a été modifié avec succès.",
      });
      setShowAddForm(false);
      setSelectedWasteType(null);
      setSelectedWasteTypeName('');
      setEditingPricing(null);
      refetch();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le tarif de traitement.",
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer un tarif de traitement
  const deleteTreatmentPricingMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/treatment-pricing/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tarif supprimé",
        description: "Le tarif de traitement a été supprimé avec succès.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le tarif de traitement.",
        variant: "destructive",
      });
    },
  });

  const handleAddWasteType = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createWasteTypeMutation.mutate({
      name: formData.get('name')?.toString() || '',
      description: formData.get('description')?.toString() || '',
      isActive: true
    });
  };

  const handleAddTreatmentPricing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Trouver l'ID du type de déchet basé sur le nom
    let wasteTypeId = selectedWasteType;
    
    if (!wasteTypeId) {
      // Chercher le type de déchet par nom
      const dbWasteType = wasteTypes?.find((wt: any) => wt.name === selectedWasteTypeName);
      if (dbWasteType) {
        wasteTypeId = dbWasteType.id;
      } else {
        toast({
          title: "Erreur",
          description: "Type de matière non trouvé. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }
    }
    
    const pricingData = {
      wasteTypeId: wasteTypeId,
      pricePerTon: formData.get('pricePerTon')?.toString() || '0',
      treatmentType: formData.get('treatmentType')?.toString() || '',
      treatmentCode: formData.get('treatmentCode')?.toString() || '',
      outletAddress: formData.get('outletAddress')?.toString() || '',
      isManualTreatment: false,
      isActive: true
    };

    if (editingPricing) {
      // Mode édition - utiliser PUT
      updateTreatmentPricingMutation.mutate({
        id: editingPricing.id,
        ...pricingData
      });
    } else {
      // Mode création - utiliser POST
      createTreatmentPricingMutation.mutate(pricingData);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prix de Traitement</h1>
          <p className="text-gray-600">Configuration des tarifs de traitement par matière</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prix de Traitement</h1>
          <p className="text-gray-600">Configuration des tarifs par tonne pour chaque matière sélectionnée</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Info className="h-4 w-4" />
          <span>Codes D1-D15 et R1-R12 disponibles</span>
        </div>
      </div>

      {/* Section des types de déchets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Types de matières</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Sauvegarder toutes les configurations
                  const configuredWasteTypes = companyActivities?.wasteTypes || [];
                  const configuredCount = configuredWasteTypes.filter((wasteTypeName: string) => {
                    const dbWasteType = wasteTypes?.find((wt: any) => wt.name === wasteTypeName);
                    return dbWasteType && treatmentPricing?.find((p: any) => p.wasteTypeId === dbWasteType.id);
                  }).length;
                  
                  toast({
                    title: "Configuration enregistrée",
                    description: `${configuredCount} tarif(s) de traitement configuré(s) et sauvegardé(s).`,
                  });
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Save className="h-4 w-4 inline mr-2" />
                Sauvegarder
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-[rgb(220, 38, 38)] text-white rounded-md hover:bg-[rgb(185, 28, 28)] focus:outline-none focus:ring-2 focus:ring-[rgb(220, 38, 38)] focus:ring-offset-2"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Ajouter une matière
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Les matières sélectionnées dans "Mes activités" apparaissent automatiquement ici pour configuration des tarifs.
          </p>

          {(() => {
            const configuredWasteTypes = companyActivities?.wasteTypes || [];
            
            if (configuredWasteTypes.length === 0) {
              return (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-yellow-800 font-medium">Aucune matière sélectionnée</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Configurez vos activités dans "Mes activités" pour sélectionner les matières à traiter.
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {configuredWasteTypes.map((wasteTypeName: string) => {
                  const dbWasteType = wasteTypes?.find((wt: any) => wt.name === wasteTypeName);
                  const existingPricing = dbWasteType ? treatmentPricing?.find((p: any) => p.wasteTypeId === dbWasteType.id) : null;
                  
                  return (
                    <Card key={wasteTypeName} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{wasteTypeName}</CardTitle>
                          {existingPricing ? (
                            <Badge className="bg-green-100 text-green-800 border-green-300">Configuré</Badge>
                          ) : (
                            <Badge variant="secondary">À configurer</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          
                          // Créer le waste type si nécessaire
                          if (!dbWasteType) {
                            createWasteTypeMutation.mutate({
                              name: wasteTypeName,
                              description: `Matière de "Mes activités"`
                            });
                            return;
                          }
                          
                          const pricingData = {
                            wasteTypeId: dbWasteType.id,
                            pricePerTon: formData.get('pricePerTon')?.toString() || '0',
                            treatmentType: formData.get('treatmentType')?.toString() || '',
                            treatmentCode: formData.get('treatmentCode')?.toString() || '',
                            outletAddress: '',
                            isManualTreatment: false,
                            isActive: true
                          };

                          if (existingPricing) {
                            updateTreatmentPricingMutation.mutate({
                              id: existingPricing.id,
                              ...pricingData
                            });
                          } else {
                            createTreatmentPricingMutation.mutate(pricingData);
                          }
                        }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Prix par tonne (€)
                            </label>
                            <input
                              type="number"
                              name="pricePerTon"
                              step="0.01"
                              min="0"
                              required
                              defaultValue={existingPricing?.pricePerTon || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              placeholder="0.00"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type de traitement
                            </label>
                            <input
                              type="text"
                              name="treatmentType"
                              required
                              defaultValue={existingPricing?.treatmentType || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              placeholder="Ex: Recyclage, Incinération..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Code de traitement
                            </label>
                            <select
                              name="treatmentCode"
                              required
                              defaultValue={existingPricing?.treatmentCode || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                              <option value="">Sélectionner un code</option>
                              {OUTLET_CODES.map((outlet) => (
                                <option key={outlet.code} value={outlet.code}>
                                  {outlet.code} - {outlet.description.substring(0, 30)}...
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-3 flex justify-end">
                            <button
                              type="submit"
                              disabled={createTreatmentPricingMutation.isPending || updateTreatmentPricingMutation.isPending || createWasteTypeMutation.isPending}
                              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
                            >
                              {(createTreatmentPricingMutation.isPending || updateTreatmentPricingMutation.isPending) 
                                ? 'Sauvegarde...' 
                                : existingPricing 
                                  ? 'Mettre à jour' 
                                  : 'Configurer'
                              }
                            </button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
        </CardContent>
      </Card>



      {/* Aide contextuelle pour les codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Codes exutoires disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Codes D (Élimination)</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {OUTLET_CODES.filter(c => c.code.startsWith('D')).map((outlet) => (
                  <div key={outlet.code} className="text-sm">
                    <span className="font-mono bg-red-50 text-red-700 px-2 py-1 rounded mr-2">{outlet.code}</span>
                    <span className="text-gray-600">{outlet.description}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Codes R (Valorisation)</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {OUTLET_CODES.filter(c => c.code.startsWith('R')).map((outlet) => (
                  <div key={outlet.code} className="text-sm">
                    <span className="font-mono bg-red-50 text-red-700 px-2 py-1 rounded mr-2">{outlet.code}</span>
                    <span className="text-gray-600">{outlet.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



function PriceSimulatorPage() {
  const { toast } = useToast();
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Récupérer les données nécessaires pour les calculs
  const { data: services } = useQuery({
    queryKey: ['/api/services'],
    select: (data) => data || []
  });

  const { data: rentalPricing } = useQuery({
    queryKey: ['/api/admin/rental-pricing'],
    select: (data) => data || []
  });

  const { data: transportPricing } = useQuery({
    queryKey: ['/api/admin/transport-pricing'],
    select: (data) => data || {
      pricePerKm: "0",
      minimumFlatRate: "0",
      hourlyRate: "0",
      immediateLoadingEnabled: false
    }
  });

  const { data: treatmentPricing } = useQuery({
    queryKey: ['/api/admin/treatment-pricing'],
    select: (data) => data || []
  });

  const { data: wasteTypes } = useQuery({
    queryKey: ['/api/admin/waste-types'],
    select: (data) => data || []
  });

  const handleSimulation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCalculating(true);
    
    const formData = new FormData(e.currentTarget);
    const serviceId = parseInt(formData.get('serviceId')?.toString() || '0');
    const durationDays = parseInt(formData.get('durationDays')?.toString() || '1');
    const distance = parseFloat(formData.get('distance')?.toString() || '0');
    const wasteWeight = parseFloat(formData.get('wasteWeight')?.toString() || '0');
    const immediateLoading = formData.get('immediateLoading') === 'true';
    const immediateLoadingHours = parseFloat(formData.get('immediateLoadingHours')?.toString() || '1');

    try {
      // Calcul du prix de location
      const selectedService = services?.find((s: any) => s.id === serviceId);
      const servicePricing = rentalPricing?.find((p: any) => p.service?.id === serviceId);
      
      let rentalCost = 0;
      if (selectedService && servicePricing) {
        const dailyRate = parseFloat(servicePricing.dailyRate || '0');
        const billingStartDay = parseInt(servicePricing.billingStartDay || '0');
        const billableDays = Math.max(0, durationDays - billingStartDay);
        rentalCost = dailyRate * billableDays;
      }

      // Calcul du prix de transport
      let transportCost = 0;
      if (distance > 0) {
        const pricePerKm = parseFloat(transportPricing?.pricePerKm || '0');
        const minimumFlatRate = parseFloat(transportPricing?.minimumFlatRate || '0');
        const calculatedTransportCost = distance * pricePerKm * 2; // Aller-retour
        transportCost = Math.max(calculatedTransportCost, minimumFlatRate);
      }

      // Calcul du chargement immédiat
      let immediateLoadingCost = 0;
      if (immediateLoading && transportPricing?.immediateLoadingEnabled) {
        const hourlyRate = parseFloat(transportPricing?.hourlyRate || '0');
        immediateLoadingCost = hourlyRate * immediateLoadingHours;
      }

      // Calcul du prix de traitement avec types de déchets
      let treatmentCost = 0;
      const selectedWasteTypes = formData.getAll('wasteTypes');
      
      if (wasteWeight > 0 && selectedWasteTypes.length > 0 && treatmentPricing) {
        const wasteInTons = wasteWeight / 1000; // Conversion kg vers tonnes
        
        for (const wasteTypeId of selectedWasteTypes) {
          const pricing = treatmentPricing.find((p: any) => p.wasteType?.id === parseInt(wasteTypeId.toString()));
          if (pricing) {
            const pricePerTon = parseFloat(pricing.pricePerTon || '0');
            treatmentCost += wasteInTons * pricePerTon;
          }
        }
      }

      const totalCost = rentalCost + transportCost + immediateLoadingCost + treatmentCost;

      setSimulationResults({
        service: selectedService,
        durationDays,
        distance,
        wasteWeight,
        breakdown: {
          rental: rentalCost,
          transport: transportCost,
          immediateLoading: immediateLoadingCost,
          treatment: treatmentCost,
          total: totalCost
        },
        details: {
          servicePricing,
          transportPricing,
          immediateLoadingHours: immediateLoading ? immediateLoadingHours : 0
        }
      });

      toast({
        title: "Simulation calculée",
        description: `Prix total estimé: ${totalCost.toFixed(2)} €`,
      });

    } catch (error) {
      toast({
        title: "Erreur de calcul",
        description: "Impossible de calculer la simulation de prix.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulateur de Prix</h1>
          <p className="text-gray-600">Simulation et calcul automatique des tarifs complets</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calculator className="h-4 w-4" />
          <span>Calculs en temps réel</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire de simulation */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de simulation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSimulation} className="space-y-6">
              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service/Équipement *
                </label>
                <select
                  name="serviceId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(220, 38, 38)] focus:border-transparent"
                >
                  <option value="">Sélectionner un service</option>
                  {services?.map((service: any) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.volume}m³
                    </option>
                  ))}
                </select>
              </div>

              {/* Durée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée de location (jours) *
                </label>
                <input
                  type="number"
                  name="durationDays"
                  min="1"
                  defaultValue="7"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(220, 38, 38)] focus:border-transparent"
                />
              </div>

              {/* Distance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance de transport (km)
                </label>
                <input
                  type="number"
                  name="distance"
                  step="0.1"
                  min="0"
                  defaultValue="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(220, 38, 38)] focus:border-transparent"
                  placeholder="Distance aller simple"
                />
              </div>

              {/* Types de déchets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Types de déchets acceptés
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {wasteTypes?.map((wasteType: any) => (
                    <div key={wasteType.id} className="flex items-center">
                      <input
                        type="checkbox"
                        name="wasteTypes"
                        value={wasteType.id}
                        className="h-4 w-4 text-[rgb(220, 38, 38)] focus:ring-[rgb(220, 38, 38)] border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        {wasteType.name}
                        {wasteType.description && (
                          <span className="text-gray-500 text-xs block">{wasteType.description}</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Poids des déchets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poids estimé des déchets (kg)
                </label>
                <input
                  type="number"
                  name="wasteWeight"
                  step="10"
                  min="0"
                  defaultValue="2000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(220, 38, 38)] focus:border-transparent"
                />
              </div>

              {/* Chargement immédiat */}
              {transportPricing?.immediateLoadingEnabled && (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="immediateLoading"
                      value="true"
                      className="h-4 w-4 text-[rgb(220, 38, 38)] focus:ring-[rgb(220, 38, 38)] border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Chargement immédiat
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heures de présence du véhicule
                    </label>
                    <input
                      type="number"
                      name="immediateLoadingHours"
                      step="0.5"
                      min="1"
                      defaultValue="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(220, 38, 38)] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isCalculating}
                className="w-full px-4 py-2 bg-[rgb(220, 38, 38)] text-white rounded-md hover:bg-[rgb(185, 28, 28)] focus:outline-none focus:ring-2 focus:ring-[rgb(220, 38, 38)] focus:ring-offset-2 disabled:opacity-50"
              >
                {isCalculating ? 'Calcul en cours...' : 'Calculer le prix'}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Résultats de simulation */}
        <Card>
          <CardHeader>
            <CardTitle>Résultats de la simulation</CardTitle>
          </CardHeader>
          <CardContent>
            {simulationResults ? (
              <div className="space-y-6">
                {/* Résumé */}
                <div className="bg-[rgb(220, 38, 38)] bg-opacity-10 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[rgb(220, 38, 38)]">
                      {simulationResults.breakdown.total.toFixed(2)} €
                    </div>
                    <div className="text-sm text-gray-600">Prix total estimé</div>
                  </div>
                </div>

                {/* Détail des coûts */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Détail des coûts</h4>
                  
                  {simulationResults.breakdown.rental > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">
                        Location ({simulationResults.durationDays} jours)
                      </span>
                      <span className="font-medium">{simulationResults.breakdown.rental.toFixed(2)} €</span>
                    </div>
                  )}

                  {simulationResults.breakdown.transport > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">
                        Transport ({simulationResults.distance} km aller-retour)
                      </span>
                      <span className="font-medium">{simulationResults.breakdown.transport.toFixed(2)} €</span>
                    </div>
                  )}

                  {simulationResults.breakdown.immediateLoading > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">
                        Chargement immédiat ({simulationResults.details.immediateLoadingHours}h)
                      </span>
                      <span className="font-medium">{simulationResults.breakdown.immediateLoading.toFixed(2)} €</span>
                    </div>
                  )}

                  {simulationResults.breakdown.treatment > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">
                        Traitement ({simulationResults.wasteWeight} tonnes)
                      </span>
                      <span className="font-medium">{simulationResults.breakdown.treatment.toFixed(2)} €</span>
                    </div>
                  )}
                </div>

                {/* Informations sur le service */}
                {simulationResults.service && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Service sélectionné</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Nom:</strong> {simulationResults.service.name}</div>
                      <div><strong>Volume:</strong> {simulationResults.service.volume}m³</div>
                      {simulationResults.service.description && (
                        <div><strong>Description:</strong> {simulationResults.service.description}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes importantes */}
                <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded">
                  <strong>Note:</strong> Cette simulation est indicative et basée sur les tarifs actuellement configurés. 
                  Les prix réels peuvent varier selon les conditions spécifiques du projet.
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calculator className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>Remplissez le formulaire pour voir la simulation de prix</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informations tarifaires */}
      <Card>
        <CardHeader>
          <CardTitle>Informations tarifaires actuelles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-medium text-blue-900">Transport</div>
              <div className="text-blue-700">
                {transportPricing?.pricePerKm || '0'} €/km
                {transportPricing?.minimumFlatRate && transportPricing.minimumFlatRate !== '0' && (
                  <div>Min: {transportPricing.minimumFlatRate} €</div>
                )}
              </div>
            </div>

            <div className="bg-red-50 p-3 rounded">
              <div className="font-medium text-red-900">Services</div>
              <div className="text-red-700">
                {services?.length || 0} équipement(s) configuré(s)
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded">
              <div className="font-medium text-purple-900">Traitement</div>
              <div className="text-purple-700">
                {treatmentPricing?.length || 0} tarif(s) configuré(s)
              </div>
            </div>

            <div className="bg-orange-50 p-3 rounded">
              <div className="font-medium text-orange-900">Chargement immédiat</div>
              <div className="text-orange-700">
                {transportPricing?.immediateLoadingEnabled ? 
                  `${transportPricing.hourlyRate} €/h` : 
                  'Désactivé'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MyActivitiesPage() {
  const { toast } = useToast();
  const [activities, setActivities] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Charger les activités existantes
  const { data: existingActivities, refetch } = useQuery({
    queryKey: ['/api/admin/company-activities'],
    select: (data) => data || null
  });

  // Listes des options disponibles
  const wasteTypeOptions = [
    "Papier", "Carton", "Plastique", "Palettes", "Encombrants tout venant", "DIB (Déchet Industriel Banal)",
    "Bois A", "Ferrailles", "Déchets verts", "Textiles", "Biodéchets alimentaires", "Bois B",
    "Déchets de chantiers en mélange", "Gravats en mélange", "Gravats propres inertes", "Platre",
    "Equipement informatique et imprimantes", "Lampes", "Electroménager", "Cartouches d'encre",
    "Chiffons souillés", "Piles et accumulateurs", "DASRI (Déchets activités soins à risque infectieux)",
    "5 flux (papier/carton, métal, plastique, verre et bois)", "7 flux (papier/carton, métal, plastique, verre, bois, gravats et plâtre)",
    "Terre", "Verre", "Déchet Ultime"
  ];

  const equipmentOptions = {
    multibenne: ["6m3", "7m3", "8m3", "10m3"],
    ampliroll: ["3m3", "5m3", "7m3", "10m3", "15m3", "20m3", "30m3", "35m3"],
    caissePalette: ["373L", "650L"],
    rolls: ["500L", "700L", "1100L"],
    contenantAlimentaire: ["100L", "120L", "240L", "400L", "660L", "20L", "40L", "60L", "80L"],
    bac: ["20L", "40L", "60L", "80L", "100L", "120L", "240L", "360L", "450L", "550L", "770L", "1000L", "1100L"],
    bennesFermees: ["15m3", "30m3"]
  };

  // Initialiser avec les données existantes ou des valeurs par défaut
  useEffect(() => {
    const defaultActivities = {
      // Services
      collecteBenne: false,
      collecteBac: false,
      collecteVrac: false,
      collecteBigBag: false,
      collecteSacGravats: false,
      collecteHuileFriture: false,
      collecteDechetsBureaux: false,
      // Types de déchets
      wasteTypes: [],
      // Équipements
      equipmentMultibenne: [],
      equipmentAmpliroll: [],
      equipmentCaissePalette: [],
      equipmentRolls: [],
      equipmentContenantAlimentaire: [],
      equipmentBac: [],
      equipmentBennesFermees: [],
      // Prix forfaitaires
      prixForfaitEnabled: false
    };

    setActivities(existingActivities || defaultActivities);
  }, [existingActivities]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const method = existingActivities ? 'PUT' : 'POST';
      const result = await apiRequest(method, '/api/admin/company-activities', activities);

      if (!result) throw new Error('Erreur lors de la sauvegarde');

      toast({
        title: "Activités sauvegardées",
        description: "La configuration de vos activités a été mise à jour avec succès.",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les activités.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateActivity = (field: string, value: any) => {
    setActivities((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction pour récupérer les suggestions d'adresses
  const fetchAddressSuggestions = async (input: string) => {
    if (input.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input)}`);
      const data = await response.json();
      
      if (data.suggestions) {
        setAddressSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Erreur autocomplétion:', error);
      setAddressSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Fonction pour sélectionner une suggestion d'adresse
  const selectAddressSuggestion = (suggestion: any) => {
    const parts = suggestion.description.split(', ');
    if (parts.length >= 3) {
      const address = parts[0];
      const cityPart = parts[parts.length - 2];
      const postalCodeMatch = cityPart.match(/(\d{5})/);
      const city = cityPart.replace(/\d{5}\s*/, '').trim();
      
      updateActivity('industrialSiteAddress', address);
      updateActivity('industrialSitePostalCode', postalCodeMatch ? postalCodeMatch[1] : '');
      updateActivity('industrialSiteCity', city);
    } else {
      updateActivity('industrialSiteAddress', suggestion.description);
    }
    
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  // Déclencher l'autocomplétion quand l'adresse change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activities?.industrialSiteAddress) {
        fetchAddressSuggestions(activities.industrialSiteAddress);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activities?.industrialSiteAddress]);

  const toggleWasteType = (wasteType: string) => {
    const currentTypes = activities?.wasteTypes || [];
    const newTypes = currentTypes.includes(wasteType)
      ? currentTypes.filter((t: string) => t !== wasteType)
      : [...currentTypes, wasteType];
    updateActivity('wasteTypes', newTypes);
  };

  const toggleEquipment = (category: string, item: string) => {
    const currentItems = activities?.[category] || [];
    const newItems = currentItems.includes(item)
      ? currentItems.filter((i: string) => i !== item)
      : [...currentItems, item];
    updateActivity(category, newItems);
  };

  if (!activities) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[rgb(220, 38, 38)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes activités</h1>
          <p className="text-gray-600">Configurez les activités de votre entreprise</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Mes services</CardTitle>
            <p className="text-sm text-gray-600">
              Définissez les services que vous proposez. Vous pouvez sélectionner plusieurs choix.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'collecteBenne', label: 'Collecte en Benne' },
              { key: 'collecteBac', label: 'Collecte en Bac, Rolls ou Caisse palette' },
              { key: 'collecteVrac', label: 'Collecte en vrac' },
              { key: 'collecteBigBag', label: 'Collecte Big Bag' },
              { key: 'collecteSacGravats', label: 'Collecte sac gravats' },
              { key: 'collecteHuileFriture', label: 'Collecte huile de friture' },
              { key: 'collecteDechetsBureaux', label: 'Collecte de déchets de bureaux' }
            ].map((service) => (
              <div key={service.key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={activities[service.key] || false}
                  onChange={(e) => updateActivity(service.key, e.target.checked)}
                  className="h-4 w-4 text-[rgb(220, 38, 38)] focus:ring-[rgb(220, 38, 38)] border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">{service.label}</label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Types de déchets */}
        <Card>
          <CardHeader>
            <CardTitle>Mes déchets</CardTitle>
            <p className="text-sm text-gray-600">
              Définissez les déchets que vous collectez. Vous pouvez sélectionner plusieurs choix.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wasteTypeOptions.map((wasteType) => (
                  <div key={wasteType} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={activities.wasteTypes?.includes(wasteType) || false}
                      onChange={() => toggleWasteType(wasteType)}
                      className="h-4 w-4 text-[rgb(220, 38, 38)] focus:ring-[rgb(220, 38, 38)] border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700">{wasteType}</label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Équipements */}
        <Card>
          <CardHeader>
            <CardTitle>Mes équipements</CardTitle>
            <p className="text-sm text-gray-600">
              Définissez les équipements que vous utilisez. Vous pouvez sélectionner plusieurs choix.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Benne Multibenne */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Benne (Multibenne)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {equipmentOptions.multibenne.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={activities.equipmentMultibenne?.includes(size) || false}
                      onChange={() => toggleEquipment('equipmentMultibenne', size)}
                      className="h-4 w-4 text-[rgb(220, 38, 38)] focus:ring-[rgb(220, 38, 38)] border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700">{size}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Benne Ampliroll */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Benne (Ampliroll)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {equipmentOptions.ampliroll.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={activities.equipmentAmpliroll?.includes(size) || false}
                      onChange={() => toggleEquipment('equipmentAmpliroll', size)}
                      className="h-4 w-4 text-[rgb(220, 38, 38)] focus:ring-[rgb(220, 38, 38)] border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700">{size}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Caisse Palette */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Caisse Palette</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {equipmentOptions.caissePalette.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={activities.equipmentCaissePalette?.includes(size) || false}
                      onChange={() => toggleEquipment('equipmentCaissePalette', size)}
                      className="h-4 w-4 text-[rgb(220, 38, 38)] focus:ring-[rgb(220, 38, 38)] border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700">{size}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rolls */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Rolls</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {equipmentOptions.rolls.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={activities.equipmentRolls?.includes(size) || false}
                      onChange={() => toggleEquipment('equipmentRolls', size)}
                      className="h-4 w-4 text-[rgb(220, 38, 38)] focus:ring-[rgb(220, 38, 38)] border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700">{size}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Contenant alimentaire */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Contenant alimentaire</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {equipmentOptions.contenantAlimentaire.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={activities.equipmentContenantAlimentaire?.includes(size) || false}
                      onChange={() => toggleEquipment('equipmentContenantAlimentaire', size)}
                      className="h-4 w-4 text-[rgb(220, 38, 38)] focus:ring-[rgb(220, 38, 38)] border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700">{size}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Bac */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Bac</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {equipmentOptions.bac.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={activities.equipmentBac?.includes(size) || false}
                      onChange={() => toggleEquipment('equipmentBac', size)}
                      className="h-4 w-4 text-[rgb(220, 38, 38)] focus:ring-[rgb(220, 38, 38)] border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700">{size}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Bennes Fermées */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Bennes Fermées</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {equipmentOptions.bennesFermees.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={activities.equipmentBennesFermees?.includes(size) || false}
                      onChange={() => toggleEquipment('equipmentBennesFermees', size)}
                      className="h-4 w-4 text-[rgb(220, 38, 38)] focus:ring-[rgb(220, 38, 38)] border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700">{size}</label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prix par forfait */}
        <Card>
          <CardHeader>
            <CardTitle>Prix par forfait</CardTitle>
            <p className="text-sm text-gray-600">
              Souhaitez-vous activer les prix forfaitaires ?
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={activities.prixForfaitEnabled || false}
                onChange={(e) => updateActivity('prixForfaitEnabled', e.target.checked)}
                className="h-4 w-4 text-[rgb(220, 38, 38)] focus:ring-[rgb(220, 38, 38)] border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Activer les prix forfaitaires</label>
            </div>
          </CardContent>
        </Card>

        {/* Adresse du site industriel */}
        <Card>
          <CardHeader>
            <CardTitle>Adresse du site industriel</CardTitle>
            <p className="text-sm text-gray-600">
              Configurez l'adresse de votre site industriel pour le calcul automatique des distances de transport (aller-retour).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={activities.industrialSiteAddress || ''}
                  onChange={(e) => updateActivity('industrialSiteAddress', e.target.value)}
                  onFocus={() => (activities.industrialSiteAddress?.length >= 3) && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="123 Rue de l'Industrie"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                {isLoadingSuggestions && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
                
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => selectAddressSuggestion(suggestion)}
                      >
                        <div className="font-medium text-gray-900">{suggestion.main_text}</div>
                        <div className="text-sm text-gray-500">{suggestion.secondary_text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal *
                </label>
                <input
                  type="text"
                  value={activities.industrialSitePostalCode || ''}
                  onChange={(e) => updateActivity('industrialSitePostalCode', e.target.value)}
                  placeholder="75001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  value={activities.industrialSiteCity || ''}
                  onChange={(e) => updateActivity('industrialSiteCity', e.target.value)}
                  placeholder="Paris"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Calcul automatique des distances
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Cette adresse sera utilisée pour calculer automatiquement la distance aller-retour entre votre site et l'adresse de livraison du client, permettant une tarification transport précise.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BankDepositsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<any>(null);

  const { data: bankDeposits = [] } = useQuery({
    queryKey: ["/api/admin/bank-deposits"],
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: wasteTypes = [] } = useQuery({
    queryKey: ["/api/admin/waste-types"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/bank-deposits", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bank-deposits"] });
      setIsDialogOpen(false);
      toast({
        title: "Empreinte bancaire créée",
        description: "La nouvelle empreinte bancaire a été ajoutée avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PUT", `/api/admin/bank-deposits/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bank-deposits"] });
      setIsDialogOpen(false);
      setEditingDeposit(null);
      toast({
        title: "Empreinte bancaire modifiée",
        description: "L'empreinte bancaire a été mise à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/bank-deposits/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bank-deposits"] });
      toast({
        title: "Empreinte bancaire supprimée",
        description: "L'empreinte bancaire a été supprimée avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      serviceId: Number(formData.get("serviceId")),
      wasteTypeId: Number(formData.get("wasteTypeId")),
      depositAmount: formData.get("depositAmount"),
      description: formData.get("description"),
      isActive: formData.get("isActive") === "on",
    };

    if (editingDeposit) {
      updateMutation.mutate({ id: editingDeposit.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empreintes bancaires</h1>
          <p className="text-gray-600">Gérez les empreintes bancaires par type de benne et de déchet</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle empreinte
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des empreintes bancaires</CardTitle>
          <CardDescription>
            Configuration des montants d'empreinte selon la benne et le type de déchet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Benne</TableHead>
                <TableHead>Type de déchet</TableHead>
                <TableHead>Montant (€)</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankDeposits.map((deposit: any) => (
                <TableRow key={deposit.id}>
                  <TableCell>
                    {services.find((s: any) => s.id === deposit.serviceId)?.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    {wasteTypes.find((w: any) => w.id === deposit.wasteTypeId)?.name || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {Number(deposit.depositAmount).toFixed(2)} €
                  </TableCell>
                  <TableCell>{deposit.description || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={deposit.isActive ? "default" : "secondary"}>
                      {deposit.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingDeposit(deposit);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(deposit.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDeposit ? "Modifier" : "Créer"} une empreinte bancaire
            </DialogTitle>
            <DialogDescription>
              Configurez le montant de l'empreinte bancaire pour une combinaison benne/déchet
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de benne</label>
              <Select name="serviceId" defaultValue={editingDeposit?.serviceId?.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une benne" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service: any) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type de déchet</label>
              <Select name="wasteTypeId" defaultValue={editingDeposit?.wasteTypeId?.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type de déchet" />
                </SelectTrigger>
                <SelectContent>
                  {wasteTypes.map((wasteType: any) => (
                    <SelectItem key={wasteType.id} value={wasteType.id.toString()}>
                      {wasteType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Montant de l'empreinte (€)</label>
              <Input
                name="depositAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={editingDeposit?.depositAmount}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                name="description"
                placeholder="Description de l'empreinte"
                defaultValue={editingDeposit?.description || ""}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isActive"
                className="rounded border-gray-300"
                defaultChecked={editingDeposit?.isActive ?? true}
              />
              <label className="text-sm font-medium">Empreinte active</label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingDeposit(null);
              }}>
                Annuler
              </Button>
              <Button type="submit">
                {editingDeposit ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Composant principal de gestion des questionnaires de satisfaction
function SatisfactionSurveysPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Récupérer tous les questionnaires
  const { data: surveys = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/satisfaction-surveys'],
    select: (data) => data || []
  });

  // Récupérer les statistiques
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/satisfaction-surveys/stats'],
    select: (data) => data || {}
  });

  // Filtrer les questionnaires
  const filteredSurveys = surveys.filter((survey: any) => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'completed' && survey.completed) ||
      (filterStatus === 'pending' && !survey.completed) ||
      (filterStatus === 'expired' && !survey.completed && new Date(survey.expiresAt) < new Date());
    
    const matchesSearch = !searchTerm || 
      survey.orderId?.toString().includes(searchTerm) ||
      survey.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (survey: any) => {
    if (survey.completed) {
      return <Badge className="bg-green-100 text-green-800">Complété</Badge>;
    }
    if (new Date(survey.expiresAt) < new Date()) {
      return <Badge variant="destructive">Expiré</Badge>;
    }
    return <Badge variant="secondary">En attente</Badge>;
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Questionnaires de Satisfaction</h1>
        <p className="text-gray-600">Gérez et analysez les retours clients envoyés 1 semaine après livraison</p>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total questionnaires</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalSurveys || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux de réponse</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completionRate || 0}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageOverallSatisfaction || 0}/5</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">NPS moyen</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageNPS || 0}/10</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par numéro de commande ou nom client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="completed">Complétés</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="expired">Expirés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des questionnaires */}
      <Card>
        <CardHeader>
          <CardTitle>Questionnaires ({filteredSurveys.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSurveys.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun questionnaire trouvé</h3>
              <p className="text-gray-600">
                {filterStatus === 'all' 
                  ? "Aucun questionnaire n'a encore été envoyé"
                  : `Aucun questionnaire ${filterStatus === 'completed' ? 'complété' : filterStatus === 'pending' ? 'en attente' : 'expiré'} trouvé`
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Envoyé le</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Note globale</TableHead>
                    <TableHead>NPS</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSurveys.map((survey: any) => (
                    <TableRow key={survey.id}>
                      <TableCell className="font-medium">
                        #{survey.orderId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{survey.customerName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{survey.customerEmail || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {survey.emailSent && survey.emailSentAt 
                          ? new Date(survey.emailSentAt).toLocaleDateString('fr-FR')
                          : 'Non envoyé'
                        }
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(survey)}
                      </TableCell>
                      <TableCell>
                        {survey.completed && survey.overallSatisfaction 
                          ? getRatingStars(survey.overallSatisfaction)
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {survey.completed && survey.npsScore !== null 
                          ? `${survey.npsScore}/10`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {survey.completed ? (
                            <SurveyDetailsDialog survey={survey} />
                          ) : (
                            <Button variant="outline" size="sm" disabled>
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Composant de dialogue pour afficher les détails d'un questionnaire
function SurveyDetailsDialog({ survey }: { survey: any }) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingDisplay = (rating: number) => {
    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  const getNPSColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du questionnaire - Commande #{survey.orderId}</DialogTitle>
          <DialogDescription>
            Questionnaire complété le {survey.completedAt ? formatDate(survey.completedAt) : 'N/A'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Informations client</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Nom:</span> {survey.customerName || 'N/A'}</p>
                <p><span className="font-medium">Email:</span> {survey.customerEmail || 'N/A'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Métadonnées</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">IP:</span> {survey.ipAddress || 'N/A'}</p>
                <p><span className="font-medium">Navigateur:</span> {survey.userAgent ? survey.userAgent.substring(0, 50) + '...' : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Évaluations par critères */}
          <div>
            <h4 className="font-semibold mb-4">Évaluations détaillées</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Satisfaction globale</span>
                  {getRatingDisplay(survey.overallSatisfaction || 0)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Qualité du service</span>
                  {getRatingDisplay(survey.serviceQuality || 0)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ponctualité livraison</span>
                  {getRatingDisplay(survey.deliveryTiming || 0)}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ponctualité collecte</span>
                  {getRatingDisplay(survey.pickupTiming || 0)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Service client</span>
                  {getRatingDisplay(survey.customerService || 0)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Rapport qualité-prix</span>
                  {getRatingDisplay(survey.valueForMoney || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Score NPS et recommandations */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h5 className="font-semibold mb-2">Score NPS</h5>
              <div className={`text-2xl font-bold ${getNPSColor(survey.npsScore || 0)}`}>
                {survey.npsScore || 0}/10
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h5 className="font-semibold mb-2">Recommanderait</h5>
              <div className={`text-2xl font-bold ${survey.wouldRecommend ? 'text-green-600' : 'text-red-600'}`}>
                {survey.wouldRecommend ? 'Oui' : 'Non'}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h5 className="font-semibold mb-2">Utiliserait à nouveau</h5>
              <div className={`text-2xl font-bold ${survey.wouldUseAgain ? 'text-green-600' : 'text-red-600'}`}>
                {survey.wouldUseAgain ? 'Oui' : 'Non'}
              </div>
            </div>
          </div>

          {/* Commentaires */}
          <div className="space-y-4">
            {survey.positiveComments && (
              <div>
                <h5 className="font-semibold mb-2 text-green-700">Points positifs</h5>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm">{survey.positiveComments}</p>
                </div>
              </div>
            )}

            {survey.negativeComments && (
              <div>
                <h5 className="font-semibold mb-2 text-red-700">Points d'amélioration</h5>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm">{survey.negativeComments}</p>
                </div>
              </div>
            )}

            {survey.suggestions && (
              <div>
                <h5 className="font-semibold mb-2 text-blue-700">Suggestions</h5>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm">{survey.suggestions}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "orders":
        return <OrdersPage />;
      case "users":
        return <UsersManagementPage />;
      case "client-map":
        return <ClientMapPage />;
      case "configuration":
        return <ConfigurationPage />;
      case "activities":
        return <ActivitiesPage />;
      case "rental-pricing":
        return <RentalPricingPage />;
      case "transport-pricing":
        return <TransportPricingPage />;
      case "treatment-pricing":
        return <TreatmentPricingPage />;

      case "price-simulator":
        return <PriceSimulatorPage />;
      case "bank-deposits":
        return <BankDepositsPage />;
      case "my-activities":
        return <MyActivitiesPage />;
      case "satisfaction-surveys":
        return <SatisfactionSurveysPage />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar intégrée */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-700">REMONDIS</h2>
                <p className="text-xs text-gray-500">Espace Client</p>
              </div>
            </div>
          </div>
          
          <nav className="mt-6">
            <div className="px-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                PRINCIPAL
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCurrentPage("dashboard")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "dashboard"
                        ? "bg-red-100 text-red-700 border-r-2 border-red-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <ShoppingCart className="mr-3 h-4 w-4" />
                    Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("orders")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "orders"
                        ? "bg-red-100 text-red-700 border-r-2 border-red-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Truck className="mr-3 h-4 w-4" />
                    Commandes
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => window.location.href = "/admin/fids"}
                    className="w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="mr-3 h-4 w-4" />
                    Gestion des FID
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("users")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "users"
                        ? "bg-red-100 text-red-700 border-r-2 border-red-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Truck className="mr-3 h-4 w-4" />
                    Mes Commandes
                  </button>
                </li>

              </ul>
            </div>

            <div className="px-4 mt-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                ADMINISTRATION
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCurrentPage("users")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "users"
                        ? "bg-red-100 text-red-700 border-r-2 border-red-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Users className="mr-3 h-4 w-4" />
                    Gestion Utilisateurs
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("client-map")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "client-map"
                        ? "bg-red-100 text-red-700 border-r-2 border-red-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <MapPin className="mr-3 h-4 w-4" />
                    Carte des Clients
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("rental-pricing")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "rental-pricing"
                        ? "bg-red-100 text-red-700 border-r-2 border-red-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <DollarSign className="mr-3 h-4 w-4" />
                    Prix de Location
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("transport-pricing")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "transport-pricing"
                        ? "bg-red-100 text-red-700 border-r-2 border-red-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Truck className="mr-3 h-4 w-4" />
                    Prix de Transport
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("treatment-pricing")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "treatment-pricing"
                        ? "bg-red-100 text-red-700 border-r-2 border-red-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Package className="mr-3 h-4 w-4" />
                    Prix de Traitement
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => setCurrentPage("price-simulator")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "price-simulator"
                        ? "bg-red-100 text-red-700 border-r-2 border-red-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Calculator className="mr-3 h-4 w-4" />
                    Simulateur de Prix
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("bank-deposits")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "bank-deposits"
                        ? "bg-red-100 text-red-700 border-r-2 border-red-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Euro className="mr-3 h-4 w-4" />
                    Empreintes bancaires
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("my-activities")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "my-activities"
                        ? "bg-red-100 text-red-700 border-r-2 border-red-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Mes activités
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("satisfaction-surveys")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "satisfaction-surveys"
                        ? "bg-red-100 text-red-700 border-r-2 border-red-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FileText className="mr-3 h-4 w-4" />
                    Questionnaires
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 p-8">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

// Composant de dialogue pour confirmer la date de livraison
function DeliveryDateConfirmDialog({ order, onSuccess }: { order: any; onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const confirmDateMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('PUT', `/api/admin/orders/${order.id}/validate-delivery-date`, {
        confirmedDate: order.deliveryDate
      });
    },
    onSuccess: () => {
      setIsOpen(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de confirmer la date de livraison.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
          <CalendarCheck className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la date de livraison</DialogTitle>
          <DialogDescription>
            Voulez-vous confirmer la date de livraison prévue pour le {new Date(order.deliveryDate).toLocaleDateString('fr-FR')} ?
            Un email de confirmation sera envoyé au client.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={() => confirmDateMutation.mutate()}
            disabled={confirmDateMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {confirmDateMutation.isPending ? "Confirmation..." : "Confirmer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Composant de dialogue pour proposer une nouvelle date de livraison
function DeliveryDateModifyDialog({ order, onSuccess }: { order: any; onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const { toast } = useToast();

  const modifyDateMutation = useMutation({
    mutationFn: async (proposedDate: string) => {
      await apiRequest('PUT', `/api/admin/orders/${order.id}/propose-delivery-date`, {
        proposedDate
      });
    },
    onSuccess: () => {
      setIsOpen(false);
      setNewDate('');
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de proposer la nouvelle date.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!newDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une nouvelle date.",
        variant: "destructive",
      });
      return;
    }
    modifyDateMutation.mutate(newDate);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700">
          <CalendarX className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Proposer une nouvelle date</DialogTitle>
          <DialogDescription>
            Date actuelle : {new Date(order.deliveryDate).toLocaleDateString('fr-FR')}
            <br />
            Proposez une nouvelle date de livraison. Un email sera envoyé au client pour validation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="newDate" className="block text-sm font-medium mb-2">
              Nouvelle date de livraison
            </label>
            <Input
              id="newDate"
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={modifyDateMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {modifyDateMutation.isPending ? "Envoi..." : "Proposer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Composant de dialogue pour supprimer une commande
function DeleteOrderDialog({ order, onSuccess }: { order: any; onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const deleteOrderMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/admin/orders/${order.id}`);
    },
    onSuccess: () => {
      setIsOpen(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la commande.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer la commande</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer définitivement la commande {order.orderNumber} ?
            <br />
            <strong>Cette action est irréversible.</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-red-800">Attention</h4>
              <p className="text-sm text-red-700 mt-1">
                La suppression de cette commande supprimera également :
              </p>
              <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
                <li>Toutes les données de facturation</li>
                <li>L'historique des paiements</li>
                <li>Les notes administratives</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={() => deleteOrderMutation.mutate()}
            disabled={deleteOrderMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteOrderMutation.isPending ? "Suppression..." : "Supprimer définitivement"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Composant de gestion des photos pour les bennes
function PhotoManagementModal({ service, onClose }: { service: any; onClose: () => void }) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Types de photos disponibles
  const photoTypes = [
    { value: 'face', label: 'Vue de face', description: 'Photo frontale de la benne' },
    { value: 'side_right', label: 'Côté droit', description: 'Vue du côté droit' },
    { value: 'side_left', label: 'Côté gauche', description: 'Vue du côté gauche' },
    { value: 'with_person', label: 'Avec personne', description: 'Photo avec une personne pour l\'échelle' },
    { value: 'back', label: 'Vue arrière', description: 'Photo arrière de la benne' }
  ];

  // Récupérer les photos existantes
  const { data: serviceImages, refetch: refetchImages } = useQuery({
    queryKey: [`/api/admin/services/${service.id}/images`],
    enabled: !!service.id
  });

  useEffect(() => {
    if (serviceImages) {
      setPhotos(serviceImages);
    }
  }, [serviceImages]);

  // Gestion de l'upload de fichiers
  const handleFileUpload = async (files: FileList, imageType: string = 'face') => {
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Format non supporté",
            description: `Le fichier ${file.name} n'est pas une image.`,
            variant: "destructive",
          });
          continue;
        }

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Fichier trop volumineux",
            description: `Le fichier ${file.name} dépasse 5MB.`,
            variant: "destructive",
          });
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('imageType', imageType);
        formData.append('serviceId', service.id.toString());

        const response = await fetch('/api/admin/services/images/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Erreur lors de l\'upload');
        }

        const result = await response.json();
        
        toast({
          title: "Photo ajoutée",
          description: `La photo ${file.name} a été ajoutée avec succès.`,
        });
      }

      refetchImages();
    } catch (error) {
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader les photos.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Supprimer une photo
  const deletePhoto = async (photoId: number) => {
    try {
      const response = await fetch(`/api/admin/services/images/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      toast({
        title: "Photo supprimée",
        description: "La photo a été supprimée avec succès.",
      });

      refetchImages();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo.",
        variant: "destructive",
      });
    }
  };

  // Définir comme photo principale
  const setMainPhoto = async (photoId: number) => {
    try {
      const response = await fetch(`/api/admin/services/images/${photoId}/set-main`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      toast({
        title: "Photo principale définie",
        description: "Cette photo est maintenant la photo principale.",
      });

      refetchImages();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de définir la photo principale.",
        variant: "destructive",
      });
    }
  };

  // Gestion du drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gérer les photos</h2>
            <p className="text-gray-600">{service.name} - {service.volume}m³</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Zone d'upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ajouter des photos
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-red-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Glissez-déposez vos photos ici ou
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {uploading ? "Upload en cours..." : "Sélectionner des fichiers"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                Formats supportés: JPG, PNG, WebP (max 5MB par fichier)
              </p>
            </div>
          </div>

          {/* Liste des photos existantes */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Photos actuelles</h3>
            {photos && photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative">
                      <img
                        src={photo.imagePath.startsWith('@assets/') 
                          ? `/src/assets/${photo.imagePath.replace('@assets/', '')}`
                          : photo.imagePath.startsWith('/uploads/') 
                            ? `http://localhost:5000${photo.imagePath}`
                            : `https://via.placeholder.com/400x225/3b82f6/ffffff?text=${encodeURIComponent(photoTypes.find(t => t.value === photo.imageType)?.label || photo.imageType)}`
                        }
                        alt={photo.altText || `Photo ${photo.imageType}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = `https://via.placeholder.com/400x225/dc2626/ffffff?text=${encodeURIComponent('Image non trouvée')}`;
                        }}
                      />
                      {photo.isMain && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                          Principale
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">
                            {photoTypes.find(t => t.value === photo.imageType)?.label || photo.imageType}
                          </p>
                          <p className="text-xs text-gray-500">
                            {photoTypes.find(t => t.value === photo.imageType)?.description}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            {photo.imagePath.split('/').pop()?.split('_')[0] || 'Image uploadée'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!photo.isMain && (
                          <button
                            onClick={() => setMainPhoto(photo.id)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Définir principale
                          </button>
                        )}
                        <button
                          onClick={() => deletePhoto(photo.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune photo pour cette benne</p>
                <p className="text-sm text-gray-400">
                  Ajoutez des photos pour améliorer la présentation
                </p>
              </div>
            )}
          </div>

          {/* Types de photos recommandés */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Types de photos recommandés</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {photoTypes.map((type) => (
                <div key={type.value} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-800">
                    <strong>{type.label}:</strong> {type.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}