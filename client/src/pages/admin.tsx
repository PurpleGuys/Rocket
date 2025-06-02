import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  ShoppingCart, 
  Euro, 
  Truck, 
  Users, 
  TrendingUp, 
  Package,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Order, Service, User, WasteType, RentalPricing, TransportPricing, TreatmentPricing, CompanyActivities } from "@shared/schema";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Vérification des droits admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Requêtes pour récupérer toutes les données
  const { data: stats, isLoading: statsLoading } = useQuery<{
    todayOrders: number;
    monthlyRevenue: string;
    rentedDumpsters: number;
    activeCustomers: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: wasteTypes = [] } = useQuery<WasteType[]>({
    queryKey: ["/api/admin/waste-types"],
  });

  const { data: rentalPricing = [] } = useQuery<(RentalPricing & { service: Service })[]>({
    queryKey: ["/api/admin/rental-pricing"],
  });

  const { data: transportPricing } = useQuery<TransportPricing>({
    queryKey: ["/api/admin/transport-pricing"],
  });

  const { data: treatmentPricing = [] } = useQuery<(TreatmentPricing & { wasteType: WasteType })[]>({
    queryKey: ["/api/admin/treatment-pricing"],
  });

  const { data: companyActivities } = useQuery<CompanyActivities>({
    queryKey: ["/api/admin/company-activities"],
  });

  // Statistiques calculées
  const todayOrders = orders.filter(order => {
    const today = new Date().toDateString();
    return new Date(order.createdAt).toDateString() === today;
  });

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const completedOrders = orders.filter(order => order.status === 'completed');
  const recentOrders = orders.slice(0, 10);

  // Mutation pour mettre à jour le statut des commandes
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      await apiRequest('PATCH', `/api/admin/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la commande a été modifié avec succès",
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "En attente", variant: "default" as const, icon: Clock },
      confirmed: { label: "Confirmée", variant: "secondary" as const, icon: CheckCircle },
      delivered: { label: "Livrée", variant: "default" as const, icon: Truck },
      collected: { label: "Collectée", variant: "default" as const, icon: Package },
      completed: { label: "Terminée", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Annulée", variant: "destructive" as const, icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
          <p className="text-gray-600 mb-4">Vous n'avez pas les droits pour accéder à cette page.</p>
          <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-red-700">Remondis DD</h2>
            <p className="text-sm text-gray-600">Administration</p>
          </div>
          
          <nav className="mt-6">
            <div className="px-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                PANNEAU ADMIN
              </h3>
              <ul className="space-y-1">
                {[
                  { id: "dashboard", label: "Tableau de bord", icon: TrendingUp },
                  { id: "orders", label: "Commandes", icon: ShoppingCart },
                  { id: "users", label: "Utilisateurs", icon: Users },
                  { id: "pricing", label: "Tarification", icon: Euro },
                  { id: "settings", label: "Paramètres", icon: Settings },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? "bg-red-100 text-red-700 border-r-2 border-red-500"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        {tab.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="px-4 mt-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                NAVIGATION
              </h3>
              <ul className="space-y-1">
                <li>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/')}
                    className="w-full justify-start text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowLeft className="mr-3 h-4 w-4" />
                    Retour au site
                  </Button>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Panneau d'Administration</h1>
                <p className="text-gray-600">Gestion complète de votre activité</p>
              </div>
              <div className="text-sm text-gray-600">
                Connecté en tant que <span className="font-semibold text-red-600">{user?.firstName} {user?.lastName}</span>
              </div>
            </div>
          </div>

          {/* Contenu des onglets */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Statistiques principales */}
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
                    {todayOrders.length} nouvelles commandes
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
                    {formatPrice(stats?.monthlyRevenue || '0')}
                  </div>
                  <p className="text-xs text-gray-600">
                    Ce mois-ci
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
                    Ce mois-ci
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Commandes récentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-red-600" />
                  Commandes Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium">Commande #{order.orderNumber}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('fr-FR')} - {formatPrice(order.totalTTC)}
                              </p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTab("orders")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Aucune commande récente</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Commandes</h2>
              <div className="flex gap-2">
                <Badge variant="outline">{orders.length} commandes au total</Badge>
                <Badge variant="secondary">{pendingOrders.length} en attente</Badge>
                <Badge variant="default">{completedOrders.length} terminées</Badge>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commande
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              #{order.orderNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.customerFirstName} {order.customerLastName}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">Service {order.serviceId}</div>
                            <div className="text-sm text-gray-500">{order.wasteTypes?.[0] || 'Non spécifié'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(order.totalTTC)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              {order.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: 'confirmed' })}
                                  disabled={updateOrderStatus.isPending}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {order.status === 'confirmed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: 'delivered' })}
                                  disabled={updateOrderStatus.isPending}
                                >
                                  <Truck className="h-4 w-4" />
                                </Button>
                              )}
                              {order.status === 'delivered' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: 'collected' })}
                                  disabled={updateOrderStatus.isPending}
                                >
                                  <Package className="h-4 w-4" />
                                </Button>
                              )}
                              {order.status === 'collected' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: 'completed' })}
                                  disabled={updateOrderStatus.isPending}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
              <Badge variant="outline">{users.length} utilisateurs</Badge>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date d'inscription
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                  <span className="text-red-600 font-medium">
                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                              {user.role === 'admin' ? 'Administrateur' : 'Client'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Gestion de la Tarification</h2>

            {/* Tarifs de location */}
            <Card>
              <CardHeader>
                <CardTitle>Tarifs de Location des Bennes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rentalPricing.map((pricing) => (
                    <div key={pricing.serviceId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{pricing.service.name}</h4>
                        <p className="text-sm text-gray-600">
                          Tarif journalier: {formatPrice(pricing.dailyRate)} | 
                          Facturation à partir du jour: {pricing.billingStartDay}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={pricing.isActive ? "default" : "secondary"}>
                          {pricing.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tarifs de transport */}
            {transportPricing && (
              <Card>
                <CardHeader>
                  <CardTitle>Tarifs de Transport</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prix par kilomètre</Label>
                      <div className="text-2xl font-bold text-red-600">
                        {formatPrice(transportPricing.pricePerKm)}/km
                      </div>
                    </div>
                    <div>
                      <Label>Tarif minimum</Label>
                      <div className="text-2xl font-bold text-red-600">
                        {formatPrice(transportPricing.minimumFlatRate)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tarifs de traitement */}
            <Card>
              <CardHeader>
                <CardTitle>Tarifs de Traitement des Déchets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {treatmentPricing.map((pricing) => (
                    <div key={pricing.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{pricing.wasteType.name}</h4>
                        <p className="text-sm text-gray-600">
                          Type: {pricing.treatmentType} | Code: {pricing.treatmentCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          {formatPrice(pricing.pricePerTon)}/tonne
                        </div>
                        <Badge variant={pricing.isActive ? "default" : "secondary"}>
                          {pricing.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Paramètres de l'Entreprise</h2>

            {companyActivities && (
              <Card>
                <CardHeader>
                  <CardTitle>Activités de l'Entreprise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Services proposés</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Badge variant={companyActivities.collecteBenne ? "default" : "secondary"}>
                            {companyActivities.collecteBenne ? "✓" : "✗"} Collecte de bennes
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <Badge variant={companyActivities.collecteBac ? "default" : "secondary"}>
                            {companyActivities.collecteBac ? "✓" : "✗"} Collecte de bacs
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <Badge variant={companyActivities.transitionEnergetique ? "default" : "secondary"}>
                            {companyActivities.transitionEnergetique ? "✓" : "✗"} Transition énergétique
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Site industriel</h4>
                      <div className="text-sm text-gray-600">
                        <p>{companyActivities.industrialSiteAddress}</p>
                        <p>{companyActivities.industrialSitePostalCode} {companyActivities.industrialSiteCity}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Types de Déchets Acceptés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {wasteTypes.map((wasteType) => (
                    <div key={wasteType.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{wasteType.name}</span>
                        <Badge variant={wasteType.isActive ? "default" : "secondary"}>
                          {wasteType.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      {wasteType.description && (
                        <p className="text-sm text-gray-600 mt-1">{wasteType.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}