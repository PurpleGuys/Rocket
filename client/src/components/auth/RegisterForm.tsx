import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  accountType: z.enum(["particulier", "professionnel"]),
  // Champs professionnels (conditionnels)
  companyName: z.string().optional(),
  siret: z.string().optional(),
  tvaNumber: z.string().optional(),
  apeCode: z.string().optional(),
  // Consentements
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions générales"
  }),
  acceptPrivacy: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter la politique de confidentialité"
  }),
  marketingConsent: z.boolean().optional(),
}).refine((data) => {
  // Validation conditionnelle pour les professionnels
  if (data.accountType === "professionnel") {
    return data.companyName && data.companyName.length >= 2 && 
           data.siret && data.siret.length === 14 &&
           data.tvaNumber && data.tvaNumber.length >= 11 &&
           data.apeCode && data.apeCode.length >= 4;
  }
  return true;
}, {
  message: "Les champs nom de l'entreprise, SIRET, numéro de TVA et code APE sont obligatoires pour les professionnels",
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
      tvaNumber: "",
      apeCode: "",
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
        isCompany: data.accountType === "professionnel",
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
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Créer un compte</CardTitle>
        <CardDescription className="text-center">
          Rejoignez REMONDIS France pour vos besoins en gestion des déchets
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Type de compte */}
            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de compte</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre type de compte" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="particulier">Particulier</SelectItem>
                      <SelectItem value="professionnel">Entreprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Informations personnelles */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Prénom" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Nom" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Champs professionnels conditionnels */}
            {accountType === "professionnel" && (
              <>
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'entreprise *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input placeholder="Nom de votre entreprise" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="siret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro SIRET *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="12345678901234" 
                            className="pl-10" 
                            maxLength={14}
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">14 chiffres sans espaces</p>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tvaNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de TVA intracommunautaire *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="FR12345678901" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">Format: FR + 11 chiffres</p>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apeCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code APE *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="3811Z" 
                            className="pl-10" 
                            maxLength={5}
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">Code activité principale (4 chiffres + 1 lettre)</p>
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="jean.dupont@email.com"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="tel" 
                        placeholder="0123456789" 
                        className="pl-10" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">
                    Au moins 8 caractères avec une majuscule, une minuscule et un chiffre
                  </p>
                </FormItem>
              )}
            />

            {/* Consentements obligatoires */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        J'accepte les{" "}
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-red-600 hover:text-red-700"
                          onClick={() => window.open("/legal", "_blank")}
                        >
                          Conditions Générales de Vente
                        </Button>{" "}
                        *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptPrivacy"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        J'accepte la{" "}
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-red-600 hover:text-red-700"
                          onClick={() => window.open("/privacy-policy", "_blank")}
                        >
                          Politique de Confidentialité
                        </Button>{" "}
                        *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketingConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        J'accepte de recevoir des communications marketing
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Création..." : "Créer mon compte"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm text-red-600 hover:text-red-500"
                onClick={onSwitchToLogin}
              >
                Déjà un compte ? Se connecter
              </Button>
            </div>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}