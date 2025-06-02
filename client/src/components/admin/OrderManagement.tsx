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
import type { Order } from "@shared/schema";

interface OrderManagementProps {
  order: Order;
}

export function OrderManagement({ order }: OrderManagementProps) {
  const [confirmDeliveryOpen, setConfirmDeliveryOpen] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const confirmDeliveryMutation = useMutation({
    mutationFn: async (data: { confirmedDate: string; adminNotes: string }) => {
      return await apiRequest('PUT', `/api/admin/orders/${order.id}/confirm-delivery`, data);
    },
    onSuccess: () => {
      toast({
        title: "Date confirmée",
        description: "La date de livraison a été confirmée et l'e-mail de validation envoyé.",
      });
      setConfirmDeliveryOpen(false);
      setConfirmedDate('');
      setAdminNotes('');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la confirmation de la date",
        variant: "destructive",
      });
    },
  });

  const resendConfirmationMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/admin/orders/${order.id}/resend-confirmation`);
    },
    onSuccess: () => {
      toast({
        title: "E-mail envoyé",
        description: "L'e-mail de confirmation a été renvoyé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'envoi de l'e-mail",
        variant: "destructive",
      });
    },
  });

  const handleConfirmDelivery = () => {
    if (!confirmedDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date de livraison",
        variant: "destructive",
      });
      return;
    }
    confirmDeliveryMutation.mutate({ confirmedDate, adminNotes });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "En attente", variant: "secondary" as const, icon: Clock },
      confirmed: { label: "Confirmé", variant: "default" as const, icon: CheckCircle },
      delivered: { label: "Livré", variant: "default" as const, icon: CheckCircle },
      completed: { label: "Terminé", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Annulé", variant: "destructive" as const, icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Non définie";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
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
            <Calendar className="h-4 w-4" />
            Date estimée
          </Label>
          <p className="text-sm">{formatDate(order.estimatedDeliveryDate)}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
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
          <Mail className="h-4 w-4" />
          <span className="text-sm">E-mail de confirmation:</span>
          <Badge variant={order.confirmationEmailSent ? "default" : "secondary"}>
            {order.confirmationEmailSent ? "Envoyé" : "Non envoyé"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span className="text-sm">E-mail de validation:</span>
          <Badge variant={order.validationEmailSent ? "default" : "secondary"}>
            {order.validationEmailSent ? "Envoyé" : "Non envoyé"}
          </Badge>
        </div>
      </div>

      {/* Notes administrateur */}
      {order.adminNotes && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notes administrateur
          </Label>
          <p className="text-sm bg-muted p-2 rounded">{order.adminNotes}</p>
        </div>
      )}

      {/* Validation par admin */}
      {order.adminValidatedBy && order.adminValidatedAt && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Validé par
          </Label>
          <p className="text-sm">
            Admin ID: {order.adminValidatedBy} • {formatDate(order.adminValidatedAt)}
          </p>
        </div>
      )}

      <Separator />

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {order.status === 'pending' && (
          <Dialog open={confirmDeliveryOpen} onOpenChange={setConfirmDeliveryOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Calendar className="h-4 w-4 mr-2" />
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
                  <Input
                    id="confirmedDate"
                    type="datetime-local"
                    value={confirmedDate}
                    onChange={(e) => setConfirmedDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="adminNotes">Notes pour le client (optionnel)</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Instructions spéciales, informations importantes..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDeliveryOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleConfirmDelivery}
                    disabled={confirmDeliveryMutation.isPending}
                  >
                    {confirmDeliveryMutation.isPending ? "Confirmation..." : "Confirmer et envoyer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => resendConfirmationMutation.mutate()}
          disabled={resendConfirmationMutation.isPending}
        >
          <Mail className="h-4 w-4 mr-2" />
          {resendConfirmationMutation.isPending ? "Envoi..." : "Renvoyer confirmation"}
        </Button>
      </div>
    </div>
  );
}