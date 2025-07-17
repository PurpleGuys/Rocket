import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LoginUser, InsertUser, User, ChangePassword, UpdateUser } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false, // Never retry auth requests
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
    enabled: true,
    // Prevent unhandled promise rejections
    throwOnError: false,
    // Handle errors gracefully
    onError: (error: any) => {
      // Only log non-authentication errors
      if (!error.message?.includes('401') && !error.message?.includes('403')) {
        console.error('Auth error:', error);
      }
    },
  });

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: LoginUser) => {
      const response = await apiRequest("/api/auth/login", "POST", data);
      return response;
    },
    onSuccess: (data) => {
      // Store tokens
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      if (data.sessionToken) {
        localStorage.setItem("session_token", data.sessionToken);
      }
      
      // Update cache with user data and invalidate to trigger refetch
      queryClient.setQueryData(["/api/auth/me"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Connexion réussie",
        description: data.message || "Bienvenue !",
      });
    },
    onError: (error: any) => {
      // Check if it's an unverified account error
      if (error.message?.includes('403') && error.message?.includes('non vérifié')) {
        toast({
          title: "Compte non vérifié",
          description: "Vérifiez votre email pour activer votre compte",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur de connexion",
          description: error.message || "Échec de la connexion",
          variant: "destructive",
        });
      }
    },
  });
}

export function useRegister() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertUser) => {
      const response = await apiRequest("/api/auth/register", "POST", data);
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Inscription réussie",
        description: data.message || "Votre compte a été créé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Échec de la création du compte",
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const sessionToken = localStorage.getItem("session_token");
      const headers: Record<string, string> = {};
      
      if (sessionToken) {
        headers["x-session-token"] = sessionToken;
      }
      
      const response = await apiRequest("/api/auth/logout", "POST", {});
      return response;
    },
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem("auth_token");
      localStorage.removeItem("session_token");
      
      // Clear user cache
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    },
    onError: (error: any) => {
      // Even if logout fails, clear local storage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("session_token");
      queryClient.clear();
      
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté",
      });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateUser) => {
      const response = await apiRequest("/api/auth/profile", "PATCH", data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Profil mis à jour",
        description: data.message || "Votre profil a été mis à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de mise à jour",
        description: error.message || "Échec de la mise à jour du profil",
        variant: "destructive",
      });
    },
  });
}

export function useChangePassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ChangePassword) => {
      const response = await apiRequest("/api/auth/change-password", "POST", data);
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Mot de passe modifié",
        description: data.message || "Votre mot de passe a été modifié avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de modification",
        description: error.message || "Échec de la modification du mot de passe",
        variant: "destructive",
      });
    },
  });
}

export function useUserSessions() {
  return useQuery({
    queryKey: ["/api/auth/sessions"],
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useLogoutAllDevices() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/auth/sessions", "DELETE");
      return response;
    },
    onSuccess: (data) => {
      // Clear tokens and cache
      localStorage.removeItem("auth_token");
      localStorage.removeItem("session_token");
      queryClient.clear();
      
      toast({
        title: "Déconnexion globale",
        description: data.message || "Vous avez été déconnecté de tous les appareils",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la déconnexion",
        variant: "destructive",
      });
    },
  });
}

export function useVerifyEmail() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest("/api/auth/verify-email", "POST", { token });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Email vérifié",
        description: data.message || "Votre email a été vérifié avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de vérification",
        description: error.message || "Échec de la vérification de l'email",
        variant: "destructive",
      });
    },
  });
}

export function useResendVerification() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("/api/auth/resend-verification", "POST", { email });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Email renvoyé",
        description: data.message || "L'email de vérification a été renvoyé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Échec du renvoi de l'email de vérification",
        variant: "destructive",
      });
    },
  });
}