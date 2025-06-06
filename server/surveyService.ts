import { storage } from './storage';
import { sendGridService } from './sendgridService';
import { type Order, type User, type InsertSatisfactionSurvey } from '@shared/schema';

export class SurveyService {
  // Créer et envoyer un questionnaire de satisfaction 1 semaine après livraison
  async scheduleSatisfactionSurvey(orderId: number): Promise<void> {
    try {
      const order = await storage.getOrder(orderId);
      if (!order || !order.userId) {
        console.log(`Commande ${orderId} non trouvée ou sans utilisateur`);
        return;
      }

      const user = await storage.getUserById(order.userId);
      if (!user) {
        console.log(`Utilisateur non trouvé pour la commande ${orderId}`);
        return;
      }

      // Vérifier s'il n'y a pas déjà un questionnaire pour cette commande
      const existingSurveys = await storage.getSatisfactionSurveysByOrder(orderId);
      if (existingSurveys.length > 0) {
        console.log(`Questionnaire déjà existant pour la commande ${orderId}`);
        return;
      }

      // Générer un token unique pour le questionnaire
      const token = require('crypto').randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Expire dans 30 jours

      // Créer le questionnaire
      const survey = await storage.createSatisfactionSurvey({
        orderId: order.id,
        userId: user.id,
        token,
        expiresAt,
        emailSent: false,
        completed: false,
      });

      // Programmer l'envoi pour 1 semaine après livraison
      const deliveryDate = new Date(order.createdAt);
      const sendDate = new Date(deliveryDate);
      sendDate.setDate(sendDate.getDate() + 7); // Envoyer 1 semaine après

      // Si la date d'envoi est dans le passé ou aujourd'hui, envoyer immédiatement
      const now = new Date();
      if (sendDate <= now) {
        await this.sendSatisfactionSurvey(survey.id);
      } else {
        // Programmer l'envoi (dans un vrai système, utiliser un job scheduler)
        console.log(`Questionnaire programmé pour le ${sendDate.toLocaleDateString('fr-FR')} pour la commande ${orderId}`);
      }

    } catch (error) {
      console.error('Erreur lors de la programmation du questionnaire:', error);
    }
  }

  // Envoyer le questionnaire par email
  async sendSatisfactionSurvey(surveyId: number): Promise<boolean> {
    try {
      const survey = await storage.getSatisfactionSurveyById(surveyId);
      if (!survey) {
        console.error(`Questionnaire ${surveyId} non trouvé`);
        return false;
      }

      if (survey.emailSent) {
        console.log(`Questionnaire ${surveyId} déjà envoyé`);
        return true;
      }

      const order = await storage.getOrder(survey.orderId);
      const user = await storage.getUserById(survey.userId);

      if (!order || !user) {
        console.error(`Données manquantes pour le questionnaire ${surveyId}`);
        return false;
      }

      // Créer l'URL du questionnaire
      const surveyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/questionnaire/${survey.token}`;

      // Envoyer l'email
      const emailSent = await sendGridService.sendSatisfactionSurvey(
        user.email,
        {
          firstName: user.firstName,
          lastName: user.lastName,
        },
        {
          orderNumber: order.orderNumber,
          orderDate: order.createdAt,
        },
        surveyUrl
      );

      if (emailSent) {
        // Marquer comme envoyé
        await storage.updateSatisfactionSurvey(survey.id, {
          emailSent: true,
          emailSentAt: new Date(),
        });
        
        console.log(`Questionnaire de satisfaction envoyé avec succès pour la commande ${order.orderNumber}`);
        return true;
      } else {
        console.error(`Échec de l'envoi du questionnaire pour la commande ${order.orderNumber}`);
        return false;
      }

    } catch (error) {
      console.error('Erreur lors de l\'envoi du questionnaire:', error);
      return false;
    }
  }

  // Traiter automatiquement les commandes livrées il y a 1 semaine
  async processWeekOldDeliveries(): Promise<void> {
    try {
      // Date d'il y a exactement 7 jours
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const weekAgoEnd = new Date(weekAgo);
      weekAgoEnd.setHours(23, 59, 59, 999);

      // Récupérer toutes les commandes livrées il y a une semaine
      const orders = await storage.getOrdersByDateRange(weekAgo, weekAgoEnd);
      const deliveredOrders = orders.filter(order => order.status === 'delivered' || order.status === 'livre');

      console.log(`Traitement de ${deliveredOrders.length} commandes livrées il y a 1 semaine`);

      for (const order of deliveredOrders) {
        await this.scheduleSatisfactionSurvey(order.id);
      }

    } catch (error) {
      console.error('Erreur lors du traitement des livraisons d\'il y a 1 semaine:', error);
    }
  }

  // Fonction à appeler périodiquement (quotidiennement) pour envoyer les questionnaires
  async dailySurveyCheck(): Promise<void> {
    console.log('Vérification quotidienne des questionnaires de satisfaction...');
    await this.processWeekOldDeliveries();
  }
}

export const surveyService = new SurveyService();