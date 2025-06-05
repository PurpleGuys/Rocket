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
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Mail, FileText, CheckCircle, AlertCircle, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
export function OrderManagement(_a) {
    var _this = this;
    var order = _a.order;
    var _b = useState(false), confirmDeliveryOpen = _b[0], setConfirmDeliveryOpen = _b[1];
    var _c = useState(''), confirmedDate = _c[0], setConfirmedDate = _c[1];
    var _d = useState(''), adminNotes = _d[0], setAdminNotes = _d[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var confirmDeliveryMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest('PUT', "/api/admin/orders/".concat(order.id, "/confirm-delivery"), data)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Date confirmée",
                description: "La date de livraison a été confirmée et l'e-mail de validation envoyé.",
            });
            setConfirmDeliveryOpen(false);
            setConfirmedDate('');
            setAdminNotes('');
            queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
        },
        onError: function (error) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de la confirmation de la date",
                variant: "destructive",
            });
        },
    });
    var resendConfirmationMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest('POST', "/api/admin/orders/".concat(order.id, "/resend-confirmation"))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "E-mail envoyé",
                description: "L'e-mail de confirmation a été renvoyé avec succès.",
            });
        },
        onError: function (error) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de l'envoi de l'e-mail",
                variant: "destructive",
            });
        },
    });
    var handleConfirmDelivery = function () {
        if (!confirmedDate) {
            toast({
                title: "Erreur",
                description: "Veuillez sélectionner une date de livraison",
                variant: "destructive",
            });
            return;
        }
        confirmDeliveryMutation.mutate({ confirmedDate: confirmedDate, adminNotes: adminNotes });
    };
    var getStatusBadge = function (status) {
        var statusConfig = {
            pending: { label: "En attente", variant: "secondary", icon: Clock },
            confirmed: { label: "Confirmé", variant: "default", icon: CheckCircle },
            delivered: { label: "Livré", variant: "default", icon: CheckCircle },
            completed: { label: "Terminé", variant: "default", icon: CheckCircle },
            cancelled: { label: "Annulé", variant: "destructive", icon: AlertCircle },
        };
        var config = statusConfig[status] || statusConfig.pending;
        var Icon = config.icon;
        return (<Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3"/>
        {config.label}
      </Badge>);
    };
    var formatDate = function (date) {
        if (!date)
            return "Non définie";
        var dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    return (<div className="space-y-4">
      {/* En-tête de la commande */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
          <p className="text-sm text-muted-foreground">
            {order.customerFirstName} {order.customerLastName} • {order.customerEmail}
          </p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <Separator />

      {/* Informations de livraison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4"/>
            Date estimée
          </Label>
          <p className="text-sm">{formatDate(order.estimatedDeliveryDate)}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4"/>
            Date confirmée
          </Label>
          <p className="text-sm">
            {order.confirmedDeliveryDate ? formatDate(order.confirmedDeliveryDate) : "Non confirmée"}
          </p>
        </div>
      </div>

      {/* Statut des e-mails */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4"/>
          <span className="text-sm">E-mail de confirmation:</span>
          <Badge variant={order.confirmationEmailSent ? "default" : "secondary"}>
            {order.confirmationEmailSent ? "Envoyé" : "Non envoyé"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4"/>
          <span className="text-sm">E-mail de validation:</span>
          <Badge variant={order.validationEmailSent ? "default" : "secondary"}>
            {order.validationEmailSent ? "Envoyé" : "Non envoyé"}
          </Badge>
        </div>
      </div>

      {/* Notes administrateur */}
      {order.adminNotes && (<div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4"/>
            Notes administrateur
          </Label>
          <p className="text-sm bg-muted p-2 rounded">{order.adminNotes}</p>
        </div>)}

      {/* Validation par admin */}
      {order.adminValidatedBy && order.adminValidatedAt && (<div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4"/>
            Validé par
          </Label>
          <p className="text-sm">
            Admin ID: {order.adminValidatedBy} • {formatDate(order.adminValidatedAt)}
          </p>
        </div>)}

      <Separator />

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {order.status === 'pending' && (<Dialog open={confirmDeliveryOpen} onOpenChange={setConfirmDeliveryOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Calendar className="h-4 w-4 mr-2"/>
                Confirmer la livraison
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer la date de livraison</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="confirmedDate">Date et heure de livraison</Label>
                  <Input id="confirmedDate" type="datetime-local" value={confirmedDate} onChange={function (e) { return setConfirmedDate(e.target.value); }}/>
                </div>
                <div>
                  <Label htmlFor="adminNotes">Notes pour le client (optionnel)</Label>
                  <Textarea id="adminNotes" placeholder="Instructions spéciales, informations importantes..." value={adminNotes} onChange={function (e) { return setAdminNotes(e.target.value); }}/>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={function () { return setConfirmDeliveryOpen(false); }}>
                    Annuler
                  </Button>
                  <Button onClick={handleConfirmDelivery} disabled={confirmDeliveryMutation.isPending}>
                    {confirmDeliveryMutation.isPending ? "Confirmation..." : "Confirmer et envoyer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>)}

        <Button variant="outline" size="sm" onClick={function () { return resendConfirmationMutation.mutate(); }} disabled={resendConfirmationMutation.isPending}>
          <Mail className="h-4 w-4 mr-2"/>
          {resendConfirmationMutation.isPending ? "Envoi..." : "Renvoyer confirmation"}
        </Button>
      </div>
    </div>);
}
