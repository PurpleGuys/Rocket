import { useState } from "react";
import { useLocation, Link } from "wouter";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

export default function Auth() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login");

  const handleAuthSuccess = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="absolute top-8 left-8">
        <Link href="/">
          <Button 
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-red-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-6">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" 
                alt="REMONDIS" 
                className="h-12 w-auto mx-auto"
              />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Connexion à votre espace
            </h1>
            <p className="text-gray-600 text-sm">
              Gérez vos réservations et suivez vos commandes
            </p>
          </div>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register" | "forgot")}>
                <TabsList className="grid w-full grid-cols-2 rounded-t-lg rounded-b-none h-12">
                  <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-red-600">
                    Connexion
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:text-red-600">
                    Inscription
                  </TabsTrigger>
                </TabsList>

                <div className="p-6">
                  <TabsContent value="login" className="mt-0">
                    <LoginForm
                      onSuccess={handleAuthSuccess}
                      onSwitchToRegister={() => setActiveTab("register")}
                      onForgotPassword={() => setActiveTab("forgot")}
                    />
                  </TabsContent>

                  <TabsContent value="register" className="mt-0">
                    <RegisterForm
                      onSuccess={handleAuthSuccess}
                      onSwitchToLogin={() => setActiveTab("login")}
                    />
                  </TabsContent>

                  <TabsContent value="forgot" className="mt-0">
                    <ForgotPasswordForm
                      onBackToLogin={() => setActiveTab("login")}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Liens légaux */}
          <div className="mt-8 text-center">
            <Separator className="mb-4" />
            <div className="text-xs text-gray-500">
              <p className="mb-2">En vous inscrivant, vous acceptez nos</p>
              <div className="flex flex-wrap justify-center gap-1">
                <Link href="/legal" className="text-red-600 hover:text-red-700 hover:underline">
                  Conditions Générales
                </Link>
                <span>•</span>
                <Link href="/privacy-policy" className="text-red-600 hover:text-red-700 hover:underline">
                  Politique de Confidentialité
                </Link>
                <span>•</span>
                <Link href="/retraction-rights" className="text-red-600 hover:text-red-700 hover:underline">
                  Droit de Rétractation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}