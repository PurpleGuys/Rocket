var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
export function useAuth() {
    var _a = useQuery({
        queryKey: ["/api/auth/me"],
        retry: false, // Never retry auth requests
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchInterval: false,
        enabled: true,
    }), user = _a.data, isLoading = _a.isLoading, error = _a.error;
    return {
        user: user,
        isLoading: isLoading,
        isAuthenticated: !!user,
        error: error,
    };
}
export function useLogin() {
    var _this = this;
    var queryClient = useQueryClient();
    var toast = useToast().toast;
    return useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/auth/login", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            // Store tokens
            if (data.token) {
                localStorage.setItem("auth_token", data.token);
            }
            if (data.sessionToken) {
                localStorage.setItem("session_token", data.sessionToken);
            }
            // Update cache with user data
            queryClient.setQueryData(["/api/auth/me"], data.user);
            toast({
                title: "Connexion réussie",
                description: data.message || "Bienvenue !",
            });
        },
        onError: function (error) {
            var _a, _b;
            // Check if it's an unverified account error
            if (((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('403')) && ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('non vérifié'))) {
                toast({
                    title: "Compte non vérifié",
                    description: "Vérifiez votre email pour activer votre compte",
                    variant: "destructive",
                });
            }
            else {
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
    var _this = this;
    var toast = useToast().toast;
    return useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/auth/register", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            toast({
                title: "Inscription réussie",
                description: data.message || "Votre compte a été créé avec succès",
            });
        },
        onError: function (error) {
            toast({
                title: "Erreur d'inscription",
                description: error.message || "Échec de la création du compte",
                variant: "destructive",
            });
        },
    });
}
export function useLogout() {
    var _this = this;
    var queryClient = useQueryClient();
    var toast = useToast().toast;
    return useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var sessionToken, headers, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionToken = localStorage.getItem("session_token");
                        headers = {};
                        if (sessionToken) {
                            headers["x-session-token"] = sessionToken;
                        }
                        return [4 /*yield*/, apiRequest("POST", "/api/auth/logout", {})];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
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
        onError: function (error) {
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
    var _this = this;
    var queryClient = useQueryClient();
    var toast = useToast().toast;
    return useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("PATCH", "/api/auth/profile", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            queryClient.setQueryData(["/api/auth/me"], data.user);
            queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
            toast({
                title: "Profil mis à jour",
                description: data.message || "Votre profil a été mis à jour avec succès",
            });
        },
        onError: function (error) {
            toast({
                title: "Erreur de mise à jour",
                description: error.message || "Échec de la mise à jour du profil",
                variant: "destructive",
            });
        },
    });
}
export function useChangePassword() {
    var _this = this;
    var toast = useToast().toast;
    return useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/auth/change-password", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            toast({
                title: "Mot de passe modifié",
                description: data.message || "Votre mot de passe a été modifié avec succès",
            });
        },
        onError: function (error) {
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
    var _this = this;
    var queryClient = useQueryClient();
    var toast = useToast().toast;
    return useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("DELETE", "/api/auth/sessions")];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            // Clear tokens and cache
            localStorage.removeItem("auth_token");
            localStorage.removeItem("session_token");
            queryClient.clear();
            toast({
                title: "Déconnexion globale",
                description: data.message || "Vous avez été déconnecté de tous les appareils",
            });
        },
        onError: function (error) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de la déconnexion",
                variant: "destructive",
            });
        },
    });
}
export function useVerifyEmail() {
    var _this = this;
    var toast = useToast().toast;
    return useMutation({
        mutationFn: function (token) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/auth/verify-email", { token: token })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            toast({
                title: "Email vérifié",
                description: data.message || "Votre email a été vérifié avec succès",
            });
        },
        onError: function (error) {
            toast({
                title: "Erreur de vérification",
                description: error.message || "Échec de la vérification de l'email",
                variant: "destructive",
            });
        },
    });
}
export function useResendVerification() {
    var _this = this;
    var toast = useToast().toast;
    return useMutation({
        mutationFn: function (email) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/auth/resend-verification", { email: email })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            toast({
                title: "Email renvoyé",
                description: data.message || "L'email de vérification a été renvoyé avec succès",
            });
        },
        onError: function (error) {
            toast({
                title: "Erreur",
                description: error.message || "Échec du renvoi de l'email de vérification",
                variant: "destructive",
            });
        },
    });
}
