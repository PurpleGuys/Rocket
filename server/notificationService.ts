import { db } from './db.js';
import { users, orders, abandonedCheckouts, inactivityNotifications } from '../shared/schema.js';
import { sendGridService } from './sendgridService.js';
import { eq, lt, and, isNull, desc, or } from 'drizzle-orm';
import type { InsertAbandonedCheckout, InsertInactivityNotification } from '../shared/schema.js';

export class NotificationService {
  private static readonly INACTIVITY_THRESHOLD_DAYS = 30;
  private static readonly REMONDIS_SALES_EMAIL = process.env.REMONDIS_SALES_EMAIL || 'commercial@remondis.fr';

  /**
   * Vérifie et envoie des notifications pour les utilisateurs inactifs depuis 1 mois
   */
  static async checkAndNotifyInactiveUsers(): Promise<void> {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - this.INACTIVITY_THRESHOLD_DAYS);

      // Trouver les utilisateurs inactifs avec notifications activées
      const inactiveUsers = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.isActive, true),
            eq(users.notifyOnInactivity, true),
            lt(users.lastLogin, oneMonthAgo),
            // Vérifier qu'on n'a pas déjà envoyé de notification récemment
            or(
              isNull(users.lastInactivityNotification),
              lt(users.lastInactivityNotification, oneMonthAgo)
            )
          )
        );

      for (const user of inactiveUsers) {
        await this.sendInactivityNotificationToSales(user);
      }

      console.log(`Processed ${inactiveUsers.length} inactive users for notifications`);
    } catch (error) {
      console.error('Error checking inactive users:', error);
    }
  }

  /**
   * Envoie une notification d'inactivité utilisateur à l'équipe commerciale
   */
  private static async sendInactivityNotificationToSales(user: any): Promise<void> {
    try {
      // Récupérer l'historique des commandes du client
      const userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, user.id))
        .orderBy(desc(orders.createdAt));

      const orderHistory = {
        totalOrders: userOrders.length,
        lastOrderDate: userOrders.length > 0 ? userOrders[0].createdAt : null,
        totalAmount: userOrders.reduce((sum, order) => sum + parseFloat(order.deliveryPrice || '0'), 0),
        services: Array.from(new Set(userOrders.map(order => `${order.serviceType || 'Service'} - ${order.deliveryCity || 'Ville'}`).filter(Boolean)))
      };

      // Créer l'enregistrement de notification
      const notificationData: InsertInactivityNotification = {
        userId: user.id,
        lastLoginDate: user.lastLogin,
        orderHistory,
        notificationSent: true,
        notificationSentAt: new Date()
      };

      await db.insert(inactivityNotifications).values(notificationData);

      // Envoyer l'email à l'équipe commerciale
      const emailSuccess = await sendGridService.sendInactiveUserNotification(
        user,
        orderHistory,
        this.REMONDIS_SALES_EMAIL
      );

      if (emailSuccess) {
        // Mettre à jour la date de dernière notification sur l'utilisateur
        await db
          .update(users)
          .set({ lastInactivityNotification: new Date() })
          .where(eq(users.id, user.id));

        console.log(`Inactivity notification sent for user ${user.email}`);
      }
    } catch (error) {
      console.error(`Error sending inactivity notification for user ${user.id}:`, error);
    }
  }

  /**
   * Enregistre une commande abandonnée lors du tunnel de paiement
   */
  static async recordAbandonedCheckout(checkoutData: InsertAbandonedCheckout): Promise<void> {
    try {
      // Insérer l'enregistrement de commande abandonnée
      const [abandonedCheckout] = await db
        .insert(abandonedCheckouts)
        .values(checkoutData)
        .returning();

      // Envoyer immédiatement la notification à l'équipe commerciale
      await this.sendAbandonedCheckoutNotificationToSales(abandonedCheckout);

      console.log(`Abandoned checkout recorded and notification sent for ${checkoutData.customerEmail}`);
    } catch (error) {
      console.error('Error recording abandoned checkout:', error);
    }
  }

  /**
   * Envoie une notification de commande abandonnée à l'équipe commerciale
   */
  private static async sendAbandonedCheckoutNotificationToSales(abandonedCheckout: any): Promise<void> {
    try {
      const emailSuccess = await sendGridService.sendAbandonedCheckoutNotification(
        abandonedCheckout,
        this.REMONDIS_SALES_EMAIL
      );

      if (emailSuccess) {
        // Marquer la notification comme envoyée
        await db
          .update(abandonedCheckouts)
          .set({ 
            notificationSent: true,
            notificationSentAt: new Date()
          })
          .where(eq(abandonedCheckouts.id, abandonedCheckout.id));

        console.log(`Abandoned checkout notification sent for ${abandonedCheckout.customerEmail}`);
      }
    } catch (error) {
      console.error(`Error sending abandoned checkout notification:`, error);
    }
  }

  /**
   * Lance une tâche périodique pour vérifier les utilisateurs inactifs (à appeler via cron)
   */
  static async runInactivityCheck(): Promise<void> {
    console.log('Running inactivity check...');
    await this.checkAndNotifyInactiveUsers();
  }
}

