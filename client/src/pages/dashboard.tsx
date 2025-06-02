import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
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
  Package
} from "lucide-react";

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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Prix de Transport</h1>
        <p className="text-gray-600">Configuration des tarifs de transport</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Configuration des prix de transport...</p>
        </CardContent>
      </Card>
    </div>
  );
}

function TreatmentPricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Prix de Traitement</h1>
        <p className="text-gray-600">Configuration des tarifs de traitement</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Configuration des prix de traitement...</p>
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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Simulateur de Prix</h1>
        <p className="text-gray-600">Outil de simulation tarifaire</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Simulateur de prix à venir...</p>
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