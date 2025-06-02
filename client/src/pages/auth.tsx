import { useState } from "react";
import { useLocation } from "wouter";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Auth() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const handleAuthSuccess = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Remondis
          </h1>
          <p className="text-gray-600">
            Location de bennes professionnelle
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="register">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setActiveTab("register")}
            />
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setActiveTab("login")}
            />
          </TabsContent>
        </Tabs>

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