import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Settings, 
  Activity, 
  Euro, 
  Truck, 
  Recycle, 
  FileText, 
  Calculator,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut
} from "lucide-react";
import { useAuth, useLogout } from "@/hooks/useAuth";

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Vue d'ensemble"
  },
  {
    title: "Mes Commandes",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    description: "Historique des commandes"
  },
  {
    title: "Ma Configuration",
    href: "/dashboard/config",
    icon: Settings,
    description: "Paramètres généraux",
    submenu: [
      { title: "Profil", href: "/dashboard/config/profile" },
      { title: "Sécurité", href: "/dashboard/config/security" },
      { title: "Notifications", href: "/dashboard/config/notifications" }
    ]
  },
  {
    title: "Mes Activités",
    href: "/dashboard/activities",
    icon: Activity,
    description: "Journal d'activités"
  }
];

const adminItems = [
  {
    title: "Prix de Location",
    href: "/dashboard/pricing/rental",
    icon: Euro,
    description: "Tarifs de location"
  },
  {
    title: "Prix de Transport",
    href: "/dashboard/pricing/transport",
    icon: Truck,
    description: "Tarifs de transport"
  },
  {
    title: "Prix de Traitement",
    href: "/dashboard/pricing/treatment",
    icon: Recycle,
    description: "Tarifs de traitement"
  },
  {
    title: "Documents Légaux",
    href: "/dashboard/legal",
    icon: FileText,
    description: "Documents et conformité"
  },
  {
    title: "Simulateur de Prix",
    href: "/dashboard/simulator",
    icon: Calculator,
    description: "Outil de simulation"
  }
];

export default function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const isAdmin = user?.role === 'admin';

  const handleMenuClick = (item: any) => {
    if (item.submenu) {
      setExpandedMenu(expandedMenu === item.href ? null : item.href);
    } else {
      navigate(item.href);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={cn(
      "relative flex h-screen flex-col border-r bg-white transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" 
              alt="Remondis" 
              className="h-8 w-auto"
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-700 font-semibold text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role === 'admin' ? 'Administrateur' : 'Client'}
              </p>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {/* Main Navigation */}
          {navigationItems.map((item) => (
            <div key={item.href}>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  collapsed && "justify-center px-2",
                  location === item.href && "bg-green-100 text-green-700 hover:bg-green-200"
                )}
                onClick={() => handleMenuClick(item)}
              >
                <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                {!collapsed && <span>{item.title}</span>}
                {!collapsed && item.submenu && expandedMenu === item.href && (
                  <ChevronRight className="ml-auto h-3 w-3 rotate-90 transition-transform" />
                )}
                {!collapsed && item.submenu && expandedMenu !== item.href && (
                  <ChevronRight className="ml-auto h-3 w-3 transition-transform" />
                )}
              </Button>
              
              {/* Submenu */}
              {!collapsed && item.submenu && expandedMenu === item.href && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.submenu.map((subItem) => (
                    <Button
                      key={subItem.href}
                      variant={location === subItem.href ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start text-xs",
                        location === subItem.href && "bg-green-50 text-green-600"
                      )}
                      onClick={() => navigate(subItem.href)}
                    >
                      {subItem.title}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <Separator className="my-4" />
              {!collapsed && (
                <div className="px-2 py-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Administration
                  </h3>
                </div>
              )}
              
              {adminItems.map((item) => (
                <Button
                  key={item.href}
                  variant={location === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed && "justify-center px-2",
                    location === item.href && "bg-green-100 text-green-700 hover:bg-green-200"
                  )}
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                  {!collapsed && <span>{item.title}</span>}
                </Button>
              ))}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-gray-600 hover:text-gray-900",
            collapsed && "justify-center px-2"
          )}
          onClick={() => navigate("/")}
        >
          <Home className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && <span>Accueil</span>}
        </Button>
        
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
            collapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && <span>Déconnexion</span>}
        </Button>
      </div>
    </div>
  );
}