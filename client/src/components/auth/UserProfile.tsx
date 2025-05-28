import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateUser, updateUserSchema, ChangePassword, changePasswordSchema } from "@shared/schema";
import { useAuth, useUpdateProfile, useChangePassword, useLogout, useLogoutAllDevices, useUserSessions } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Building, Lock, Shield, LogOut, Smartphone } from "lucide-react";

export default function UserProfile() {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const logoutMutation = useLogout();
  const logoutAllDevicesMutation = useLogoutAllDevices();
  const { data: sessions } = useUserSessions();

  const profileForm = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      companyName: user?.companyName || "",
      address: user?.address || "",
      city: user?.city || "",
      postalCode: user?.postalCode || "",
    },
  });

  const passwordForm = useForm<ChangePassword>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onUpdateProfile = async (data: UpdateUser) => {
    try {
      await updateProfileMutation.mutateAsync(data);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const onChangePassword = async (data: ChangePassword) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      passwordForm.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleLogoutAllDevices = () => {
    logoutAllDevicesMutation.mutate();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles et votre sécurité</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Mettez à jour vos informations de profil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        {...profileForm.register("firstName")}
                      />
                      {profileForm.formState.errors.firstName && (
                        <p className="text-sm text-red-600">{profileForm.formState.errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        {...profileForm.register("lastName")}
                      />
                      {profileForm.formState.errors.lastName && (
                        <p className="text-sm text-red-600">{profileForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        {...profileForm.register("email")}
                      />
                    </div>
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-10"
                        {...profileForm.register("phone")}
                      />
                    </div>
                    {profileForm.formState.errors.phone && (
                      <p className="text-sm text-red-600">{profileForm.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName">Entreprise</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        className="pl-10"
                        {...profileForm.register("companyName")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        {...profileForm.register("address")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        {...profileForm.register("city")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input
                        id="postalCode"
                        {...profileForm.register("postalCode")}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Mise à jour..." : "Mettre à jour le profil"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Changer le mot de passe
                  </CardTitle>
                  <CardDescription>
                    Assurez-vous d'utiliser un mot de passe fort et unique
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        {...passwordForm.register("currentPassword")}
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...passwordForm.register("newPassword")}
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...passwordForm.register("confirmPassword")}
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? "Modification..." : "Changer le mot de passe"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Statut du compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Email vérifié</span>
                    <Badge variant={user.isVerified ? "default" : "secondary"}>
                      {user.isVerified ? "Vérifié" : "Non vérifié"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Compte actif</span>
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Rôle</span>
                    <Badge variant="outline">
                      {user.role === "admin" ? "Administrateur" : "Client"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Sessions actives
                </CardTitle>
                <CardDescription>
                  Gérez vos connexions sur différents appareils
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessions && sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{session.userAgent || "Appareil inconnu"}</p>
                          <p className="text-sm text-muted-foreground">
                            IP: {session.ipAddress || "Non disponible"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Créée le: {new Date(session.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucune session active trouvée</p>
                )}

                <Separator />

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {logoutMutation.isPending ? "Déconnexion..." : "Se déconnecter"}
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={handleLogoutAllDevices}
                    disabled={logoutAllDevicesMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    {logoutAllDevicesMutation.isPending ? "Déconnexion..." : "Déconnecter tous les appareils"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}