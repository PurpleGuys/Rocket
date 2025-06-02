import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  X
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Composant principal du dashboard
function DashboardHome() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
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
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commandes Aujourd'hui</CardTitle>
                <ShoppingCart className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {stats?.todayOrders || 0}
                </div>
                <p className="text-xs text-gray-600">
                  +2.1% par rapport à hier
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
                <Euro className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {stats?.monthlyRevenue || '0'} €
                </div>
                <p className="text-xs text-gray-600">
                  +4.3% ce mois-ci
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bennes Louées</CardTitle>
                <Truck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {stats?.rentedDumpsters || 0}
                </div>
                <p className="text-xs text-gray-600">
                  En cours de location
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {stats?.activeCustomers || 0}
                </div>
                <p className="text-xs text-gray-600">
                  +12% ce mois-ci
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
                <CardDescription>Dernières commandes et livraisons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Livraison benne 8m³</p>
                      <p className="text-xs text-gray-500">123 Rue de la Paix, Paris - Il y a 2h</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nouvelle commande</p>
                      <p className="text-xs text-gray-500">Benne 12m³ - Déchets verts - Il y a 4h</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Récupération programmée</p>
                      <p className="text-xs text-gray-500">456 Avenue Victor Hugo - Demain 9h</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Alertes Système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-orange-800">Stock faible</p>
                      <p className="text-xs text-orange-600">Bennes 8m³ - 3 restantes</p>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      Urgent
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Maintenance prévue</p>
                      <p className="text-xs text-blue-600">Camion #45 - Demain 14h</p>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      Info
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  Mes Commandes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">
                  {userOrders?.length || 0}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Commandes passées
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  En Cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">
                  {userOrders?.filter((order: any) => order.status === 'active')?.length || 0}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Locations actives
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  Déchets Traités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">
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
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Truck className="h-5 w-5 text-green-600" />
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
                          className={order.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
        <p className="text-gray-600">Gérez vos commandes et réservations</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Historique des commandes à venir...</p>
        </CardContent>
      </Card>
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
  const [formData, setFormData] = useState<{[key: number]: {dailyRate: string, billingStartDay: string}}>({});
  const [showAddModal, setShowAddModal] = useState(false);
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
    mutate: async (data: {serviceId: number, dailyRate: string, billingStartDay: number}) => {
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
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
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
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Prix journalier
          </button>
          <button
            onClick={() => setActiveTab("package")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "package"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Prix forfaitaire
          </button>
        </nav>
      </div>

      {activeTab === "daily" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
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
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Truck className="h-5 w-5 text-green-600" />
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
                                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        <td className="py-4 px-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSave(service.id)}
                                disabled={updatePricingMutation.isPending}
                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
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

      {activeTab === "package" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Prix Forfaitaire
            </CardTitle>
            <CardDescription>
              Configuration des forfaits (fonctionnalité à venir)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Gestion des forfaits</p>
              <p className="text-sm text-gray-400">
                Cette fonctionnalité sera disponible prochainement
              </p>
            </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
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
                  ? 'border-[#00B8A2] text-[#00B8A2]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tarification kilométrique
            </button>
            <button
              onClick={() => setActiveTab('immediate')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'immediate'
                  ? 'border-[#00B8A2] text-[#00B8A2]'
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:border-transparent pr-12"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:border-transparent pr-8"
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
                    className="px-6 py-2 bg-[#00B8A2] text-white rounded-md hover:bg-[#009688] focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:border-transparent pr-12"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 text-sm">€/h</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className={`h-3 w-3 rounded-full ${
                    transportPricing?.immediateLoadingEnabled ? 'bg-green-500' : 'bg-red-500'
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
                    className="px-6 py-2 bg-[#00B8A2] text-white rounded-md hover:bg-[#009688] focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
    onSuccess: () => {
      toast({
        title: "Matière créée",
        description: "Le nouveau type de matière a été ajouté avec succès.",
      });
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
      const response = await apiRequest("POST", "/api/admin/treatment-pricing", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tarif configuré",
        description: "Le tarif de traitement a été sauvegardé avec succès.",
      });
      setShowAddForm(false);
      setSelectedWasteType(null);
      refetch();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le tarif de traitement.",
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
    
    createTreatmentPricingMutation.mutate({
      wasteTypeId: parseInt(formData.get('wasteTypeId')?.toString() || '0'),
      pricePerTon: formData.get('pricePerTon')?.toString() || '0',
      treatmentType: formData.get('treatmentType')?.toString() || '',
      treatmentCode: formData.get('treatmentCode')?.toString() || '',
      outletAddress: formData.get('outletAddress')?.toString() || '',
      isManualTreatment: formData.get('isManualTreatment') === 'true',
      isActive: true
    });
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
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-[#00B8A2] text-white rounded-md hover:bg-[#009688] focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:ring-offset-2"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Ajouter une matière
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Nouvelle matière</h3>
              <form onSubmit={handleAddWasteType} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la matière *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:border-transparent"
                      placeholder="Ex: Gravats, Bois, Métaux..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:border-transparent"
                      placeholder="Description détaillée (optionnel)"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createWasteTypeMutation.isPending}
                    className="px-4 py-2 bg-[#00B8A2] text-white rounded-md hover:bg-[#009688] disabled:opacity-50"
                  >
                    {createWasteTypeMutation.isPending ? 'Création...' : 'Créer la matière'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wasteTypes && wasteTypes.length > 0 ? (
              wasteTypes.map((wasteType: any) => {
                const existingPricing = treatmentPricing?.find((p: any) => p.wasteTypeId === wasteType.id);
                return (
                  <div key={wasteType.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{wasteType.name}</h4>
                    {wasteType.description && (
                      <p className="text-sm text-gray-600 mt-1">{wasteType.description}</p>
                    )}
                    
                    {existingPricing ? (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Prix/tonne:</span>
                          <span className="font-medium">{existingPricing.pricePerTon} €</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Code:</span>
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{existingPricing.treatmentCode}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Type:</span>
                          <span className="text-sm">{existingPricing.treatmentType}</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedWasteType(wasteType.id)}
                        className="mt-4 w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100"
                      >
                        Configurer le tarif
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                Aucun type de matière configuré. Commencez par ajouter une matière.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de configuration des tarifs */}
      {selectedWasteType && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration du tarif de traitement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTreatmentPricing} className="space-y-6">
              <input type="hidden" name="wasteTypeId" value={selectedWasteType} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix par tonne (€) *
                  </label>
                  <input
                    type="number"
                    name="pricePerTon"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de traitement *
                  </label>
                  <input
                    type="text"
                    name="treatmentType"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:border-transparent"
                    placeholder="Ex: Recyclage, Incinération, Compostage, Valorisation énergétique..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code exutoire *
                  </label>
                  <select
                    name="treatmentCode"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:border-transparent"
                  >
                    <option value="">Sélectionner un code</option>
                    {OUTLET_CODES.map((outlet) => (
                      <option key={outlet.code} value={outlet.code}>
                        {outlet.code} - {outlet.description.substring(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse exutoire
                </label>
                <textarea
                  name="outletAddress"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:border-transparent"
                  placeholder="Adresse complète du site de traitement (optionnel)"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWasteType(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createTreatmentPricingMutation.isPending}
                  className="px-4 py-2 bg-[#00B8A2] text-white rounded-md hover:bg-[#009688] disabled:opacity-50"
                >
                  {createTreatmentPricingMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder le tarif'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
                    <span className="font-mono bg-green-50 text-green-700 px-2 py-1 rounded mr-2">{outlet.code}</span>
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

function LegalDocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Documents Légaux</h1>
        <p className="text-gray-600">Gestion des documents juridiques</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Documents légaux à venir...</p>
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

      // Calcul du prix de traitement (simulation basique)
      let treatmentCost = 0;
      if (wasteWeight > 0 && treatmentPricing?.length > 0) {
        // Prendre le premier tarif disponible pour la démonstration
        const firstTreatment = treatmentPricing[0];
        const pricePerTon = parseFloat(firstTreatment.pricePerTon || '0');
        treatmentCost = wasteWeight * pricePerTon;
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:border-transparent"
                  placeholder="Distance aller simple"
                />
              </div>

              {/* Poids des déchets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poids estimé des déchets (tonnes)
                </label>
                <input
                  type="number"
                  name="wasteWeight"
                  step="0.1"
                  min="0"
                  defaultValue="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:border-transparent"
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
                      className="h-4 w-4 text-[#00B8A2] focus:ring-[#00B8A2] border-gray-300 rounded"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isCalculating}
                className="w-full px-4 py-2 bg-[#00B8A2] text-white rounded-md hover:bg-[#009688] focus:outline-none focus:ring-2 focus:ring-[#00B8A2] focus:ring-offset-2 disabled:opacity-50"
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
                <div className="bg-[#00B8A2] bg-opacity-10 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00B8A2]">
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

            <div className="bg-green-50 p-3 rounded">
              <div className="font-medium text-green-900">Services</div>
              <div className="text-green-700">
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

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "orders":
        return <OrdersPage />;
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
      case "legal-documents":
        return <LegalDocumentsPage />;
      case "price-simulator":
        return <PriceSimulatorPage />;
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
            <h2 className="text-xl font-bold text-green-700">Remondis</h2>
            <p className="text-sm text-gray-600">Panneau d'administration</p>
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
                        ? "bg-green-100 text-green-700 border-r-2 border-green-500"
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
                        ? "bg-green-100 text-green-700 border-r-2 border-green-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Truck className="mr-3 h-4 w-4" />
                    Mes Commandes
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("configuration")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "configuration"
                        ? "bg-green-100 text-green-700 border-r-2 border-green-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Ma Configuration
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("activities")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "activities"
                        ? "bg-green-100 text-green-700 border-r-2 border-green-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Clock className="mr-3 h-4 w-4" />
                    Mes Activités
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
                    onClick={() => setCurrentPage("rental-pricing")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "rental-pricing"
                        ? "bg-green-100 text-green-700 border-r-2 border-green-500"
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
                        ? "bg-green-100 text-green-700 border-r-2 border-green-500"
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
                        ? "bg-green-100 text-green-700 border-r-2 border-green-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Package className="mr-3 h-4 w-4" />
                    Prix de Traitement
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("legal-documents")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "legal-documents"
                        ? "bg-green-100 text-green-700 border-r-2 border-green-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FileText className="mr-3 h-4 w-4" />
                    Documents Légaux
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("price-simulator")}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === "price-simulator"
                        ? "bg-green-100 text-green-700 border-r-2 border-green-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Calculator className="mr-3 h-4 w-4" />
                    Simulateur de Prix
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