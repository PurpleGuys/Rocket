import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Prix de Location</h1>
        <p className="text-gray-600">Configuration des tarifs de location</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Configuration des prix de location...</p>
        </CardContent>
      </Card>
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