import { useState } from "react";
import { useLocation } from "wouter";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Auth() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login");

  const handleAuthSuccess = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-6">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" 
              alt="REMONDIS" 
              className="h-16 w-auto mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            REMONDIS France
          </h1>
          <p className="text-gray-600">
            Gestion professionnelle des déchets
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register" | "forgot")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="register">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setActiveTab("register")}
              onForgotPassword={() => setActiveTab("forgot")}
            />
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setActiveTab("login")}
            />
          </TabsContent>

          <TabsContent value="forgot" className="mt-6">
            <ForgotPasswordForm
              onBackToLogin={() => setActiveTab("login")}
            />
          </TabsContent>
        </Tabs>

        {/* Liens légaux */}
        <div className="mt-8 text-center">
          <Separator className="mb-4" />
          <div className="space-y-2 text-sm text-gray-600">
            <p>En vous inscrivant, vous acceptez nos :</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => navigate("/legal")}
                className="text-red-600 hover:text-red-700 p-0 h-auto"
              >
                Conditions Générales de Vente
              </Button>
              <span>•</span>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => navigate("/privacy-policy")}
                className="text-red-600 hover:text-red-700 p-0 h-auto"
              >
                Politique de Confidentialité
              </Button>
            </div>
            <div className="flex justify-center">
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => navigate("/retraction-rights")}
                className="text-red-600 hover:text-red-700 p-0 h-auto"
              >
                Droit de Rétractation
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            En vous connectant, vous acceptez nos{" "}
            <a href="#" className="text-red-600 hover:underline">
              conditions d'utilisation
            </a>{" "}
            et notre{" "}
            <a href="#" className="text-red-600 hover:underline">
              politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}