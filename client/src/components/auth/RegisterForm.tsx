import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, Lock, Mail, User, Phone, Building, FileText } from "lucide-react";

// Schema de validation pour l'inscription
const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  accountType: z.enum(["particulier", "entreprise"]),
  // Champs entreprise (conditionnels)
  companyName: z.string().optional(),
  siret: z.string().optional(),
  // Consentements
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions générales"
  }),
  acceptPrivacy: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter la politique de confidentialité"
  }),
  marketingConsent: z.boolean().optional(),
}).refine((data) => {
  // Validation conditionnelle pour les entreprises
  if (data.accountType === "entreprise") {
    return data.companyName && data.companyName.length >= 2 && 
           data.siret && data.siret.length === 14;
  }
  return true;
}, {
  message: "Les champs nom de l'entreprise et SIRET sont obligatoires pour les entreprises",
  path: ["companyName"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      postalCode: "",
      city: "",
      accountType: "particulier",
      companyName: "",
      siret: "",
      acceptTerms: false,
      acceptPrivacy: false,
      marketingConsent: false,
    },
  });

  const accountType = form.watch("accountType");

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      return apiRequest("POST", "/api/auth/register", {
        ...data,
        isCompany: data.accountType === "entreprise",
      });
    },
    onSuccess: () => {
      toast({
        title: "Inscription réussie",
        description: "Un email de vérification a été envoyé à votre adresse.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Créer un compte</CardTitle>
        <CardDescription className="text-center">
          Rejoignez Remondis pour vos besoins en location de bennes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  placeholder="Jean"
                  className="pl-10"
                  {...form.register("firstName")}
                />
              </div>
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  placeholder="Dupont"
                  className="pl-10"
                  {...form.register("lastName")}
                />
              </div>
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="jean.dupont@email.com"
                className="pl-10"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="06 12 34 56 78"
                className="pl-10"
                {...form.register("phone")}
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Entreprise (optionnel)</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="companyName"
                placeholder="Nom de votre entreprise"
                className="pl-10"
                {...form.register("companyName")}
              />
            </div>
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
            <p className="text-xs text-muted-foreground">
              Minimum 8 caractères avec majuscules, minuscules et chiffres
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="marketingConsent"
              {...form.register("marketingConsent")}
            />
            <Label htmlFor="marketingConsent" className="text-sm">
              J'accepte de recevoir des informations commerciales par email
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Création..." : "Créer mon compte"}
          </Button>

          {onSwitchToLogin && (
            <p className="text-sm text-muted-foreground text-center">
              Déjà un compte ?{" "}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-red-600 hover:text-red-700"
                onClick={onSwitchToLogin}
              >
                Se connecter
              </Button>
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}