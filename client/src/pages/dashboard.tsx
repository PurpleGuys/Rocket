import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/Sidebar";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Euro,
  Activity,
  Truck,
  Recycle,
  AlertTriangle
} from "lucide-react";

function DashboardHome() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Récupération des statistiques du dashboard
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAdmin,
  });

  const { data: userOrders } = useQuery({
    queryKey: ["/api/orders/my-orders"],
    enabled: !isAdmin,
  });

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Bienvenue {user?.firstName}, voici un aperçu de votre activité
          </p>
        </div>

        {/* Admin Dashboard */}
        {isAdmin && (
          <div className="space-y-6">
            {/* Stats Cards */}
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
                    {stats?.monthlyRevenue || "0 €"}
                  </div>
                  <p className="text-xs text-gray-600">
                    +12.5% ce mois-ci
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
                    +5.2% ce mois-ci
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Admin Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Activités Récentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nouvelle commande #12345</p>
                        <p className="text-xs text-gray-500">Il y a 5 minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Livraison planifiée</p>
                        <p className="text-xs text-gray-500">Il y a 15 minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Collecte programmée</p>
                        <p className="text-xs text-gray-500">Il y a 1 heure</p>
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

        {/* User Dashboard */}
        {!isAdmin && (
          <div className="space-y-6">
            {/* User Stats */}
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
                    <Recycle className="h-5 w-5 text-green-600" />
                    Économies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">
                    85%
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Déchets recyclés
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* User Recent Orders */}
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
    </div>
  );
}

// Composants pour les différentes pages du dashboard
function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
        <p className="text-gray-600">Historique et suivi de vos commandes</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Commandes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Aucune commande trouvée pour le moment.</p>
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
        <p className="text-gray-600">Paramètres et préférences du compte</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Informations personnelles</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>Paramètres de sécurité</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Préférences de notification</CardDescription>
          </CardHeader>
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
        <p className="text-gray-600">Journal des activités de votre compte</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Activités récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Aucune activité récente.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Pages d'administration
function RentalPricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Prix de Location</h1>
        <p className="text-gray-600">Gestion des tarifs de location de bennes</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tarifs par type de benne</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Configuration des tarifs en cours de développement.</p>
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
        <p className="text-gray-600">Gestion des tarifs de transport</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Zones de transport</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Configuration des zones tarifaires en cours de développement.</p>
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
        <p className="text-gray-600">Gestion des tarifs de traitement des déchets</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tarifs par type de déchet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Configuration des tarifs en cours de développement.</p>
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
        <p className="text-gray-600">Gestion des documents légaux et de conformité</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Documents disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Aucun document configuré pour le moment.</p>
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
        <p className="text-gray-600">Outil de simulation de tarifs pour les clients</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Paramètres du simulateur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Configuration du simulateur en cours de développement.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="mb-8">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
        </div>
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Switch>
            {/* Routes pour /dashboard */}
            <Route path="/dashboard" component={DashboardHome} />
            <Route path="/dashboard/orders" component={OrdersPage} />
            <Route path="/dashboard/config" component={ConfigurationPage} />
            <Route path="/dashboard/config/*" component={ConfigurationPage} />
            <Route path="/dashboard/activities" component={ActivitiesPage} />
            <Route path="/dashboard/pricing/rental" component={RentalPricingPage} />
            <Route path="/dashboard/pricing/transport" component={TransportPricingPage} />
            <Route path="/dashboard/pricing/treatment" component={TreatmentPricingPage} />
            <Route path="/dashboard/legal" component={LegalDocumentsPage} />
            <Route path="/dashboard/simulator" component={PriceSimulatorPage} />
            
            {/* Routes pour /admin (même contenu) */}
            <Route path="/admin" component={DashboardHome} />
            <Route path="/admin/orders" component={OrdersPage} />
            <Route path="/admin/config" component={ConfigurationPage} />
            <Route path="/admin/config/*" component={ConfigurationPage} />
            <Route path="/admin/activities" component={ActivitiesPage} />
            <Route path="/admin/pricing/rental" component={RentalPricingPage} />
            <Route path="/admin/pricing/transport" component={TransportPricingPage} />
            <Route path="/admin/pricing/treatment" component={TreatmentPricingPage} />
            <Route path="/admin/legal" component={LegalDocumentsPage} />
            <Route path="/admin/simulator" component={PriceSimulatorPage} />
          </Switch>
        </main>
      </div>
    </div>
  );
}