import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginUser, loginSchema } from "@shared/schema";
import { useLogin, useResendVerification } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister, onForgotPassword }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [lastFailedEmail, setLastFailedEmail] = useState("");
  const loginMutation = useLogin();
  const resendVerificationMutation = useResendVerification();

  const form = useForm<LoginUser>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginUser) => {
    try {
      await loginMutation.mutateAsync(data);
      onSuccess?.();
    } catch (error: any) {
      // Check if it's an unverified account error
      if (error.message?.includes('403') && error.message?.includes('non vérifié')) {
        setLastFailedEmail(data.email);
        setShowResendVerification(true);
      }
    }
  };

  const handleResendVerification = async () => {
    if (lastFailedEmail) {
      await resendVerificationMutation.mutateAsync(lastFailedEmail);
      setShowResendVerification(false);
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                className="pl-10"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              {...form.register("rememberMe")}
            />
            <Label htmlFor="rememberMe" className="text-sm">
              Se souvenir de moi
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Connexion..." : "Se connecter"}
          </Button>

          {showResendVerification && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-800">
                  Compte non vérifié
                </span>
              </div>
              <p className="text-sm text-orange-700 mb-3">
                Votre compte n'est pas encore vérifié. Vérifiez votre boîte email ou cliquez ci-dessous pour renvoyer l'email de vérification.
              </p>
              <Button
                type="button"
                onClick={handleResendVerification}
                disabled={resendVerificationMutation.isPending}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                size="sm"
              >
                {resendVerificationMutation.isPending ? "Envoi..." : "Renvoyer l'email de vérification"}
              </Button>
            </div>
          )}

          <div className="text-center space-y-2">
            <Button
              type="button"
              variant="link"
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={onForgotPassword}
            >
              Mot de passe oublié ?
            </Button>
            
            {onSwitchToRegister && (
              <p className="text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-red-600 hover:text-red-700"
                  onClick={onSwitchToRegister}
                >
                  Créer un compte
                </Button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}