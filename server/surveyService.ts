import { storage } from './storage';
import { sendGridService } from './sendgridService';
import crypto from 'crypto';
import type { Order, User, SatisfactionSurvey } from '@shared/schema';

class SurveyService {
  // Créer un questionnaire de satisfaction pour une commande
  async createSurveyForOrder(order: Order, user: User): Promise<SatisfactionSurvey> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expire dans 30 jours

    const survey = await storage.createSatisfactionSurvey({
      orderId: order.id,
      userId: user.id,
      token,
      expiresAt,
      emailSent: false,
      completed: false,
    });

    return survey;
  }

  // Envoyer l'email de questionnaire de satisfaction
  async sendSurveyEmail(survey: SatisfactionSurvey, order: Order, user: User): Promise<boolean> {
    try {
      const surveyUrl = `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/questionnaire/${survey.token}`;
      
      const emailSent = await sendGridService.sendSatisfactionSurveyEmail(
        user.email,
        {
          firstName: user.firstName,
          lastName: user.lastName,
          orderNumber: order.orderNumber,
          surveyUrl,
          expiryDate: survey.expiresAt,
        }
      );

      if (emailSent) {
        await storage.updateSatisfactionSurvey(survey.id, {
          emailSent: true,
          emailSentAt: new Date(),
        });

        // Créer une notification pour le suivi
        await storage.createSurveyNotification({
          surveyId: survey.id,
          reminderSent: false,
          reminderCount: 0,
        });
      }

      return emailSent;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du questionnaire de satisfaction:', error);
      return false;
    }
  }

  // Traiter les commandes prêtes pour les questionnaires de satisfaction
  async processOrdersForSurveys(): Promise<void> {
    try {
      const ordersReady = await storage.getOrdersReadyForSurvey();
      
      for (const order of ordersReady) {
        if (!order.userId) continue;
        
        const user = await storage.getUserById(order.userId);
        if (!user) continue;

        // Créer le questionnaire
        const survey = await this.createSurveyForOrder(order, user);
        
        // Envoyer l'email
        await this.sendSurveyEmail(survey, order, user);
        
        console.log(`Questionnaire de satisfaction envoyé pour la commande ${order.orderNumber}`);
      }
    } catch (error) {
      console.error('Erreur lors du traitement des questionnaires de satisfaction:', error);
    }
  }

  // Envoyer un rappel pour un questionnaire non complété
  async sendSurveyReminder(surveyId: number): Promise<boolean> {
    try {
      const survey = await storage.getSatisfactionSurvey(surveyId);
      if (!survey || survey.completed || survey.expiresAt < new Date()) {
        return false;
      }

      const user = await storage.getUserById(survey.userId);
      if (!user) return false;

      const order = await storage.getOrder(survey.orderId);
      if (!order) return false;

      const surveyUrl = `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/questionnaire/${survey.token}`;
      
      const emailSent = await sendGridService.sendSatisfactionSurveyReminder(
        user.email,
        {
          firstName: user.firstName,
          lastName: user.lastName,
          orderNumber: order.orderNumber,
          surveyUrl,
          expiryDate: survey.expiresAt,
        }
      );

      if (emailSent) {
        await storage.updateSurveyNotification(surveyId, {
          reminderSent: true,
          reminderSentAt: new Date(),
          reminderCount: 1,
        });
      }

      return emailSent;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rappel de questionnaire:', error);
      return false;
    }
  }

  // Valider et soumettre les réponses du questionnaire
  async submitSurveyResponse(token: string, responses: {
    overallSatisfaction: number;
    serviceQuality: number;
    deliveryTiming: number;
    pickupTiming: number;
    customerService: number;
    valueForMoney: number;
    positiveComments?: string;
    negativeComments?: string;
    suggestions?: string;
    npsScore: number;
    wouldUseAgain: boolean;
    wouldRecommend: boolean;
    ipAddress?: string;
    userAgent?: string;
    responseTimeSeconds?: number;
  }): Promise<SatisfactionSurvey | null> {
    try {
      const survey = await storage.getSatisfactionSurveyByToken(token);
      
      if (!survey || survey.completed || survey.expiresAt < new Date()) {
        return null;
      }

      const updatedSurvey = await storage.updateSatisfactionSurvey(survey.id, {
        ...responses,
        completed: true,
        completedAt: new Date(),
      });

      console.log(`Questionnaire de satisfaction complété pour la commande ${survey.orderId}`);
      return updatedSurvey || null;
    } catch (error) {
      console.error('Erreur lors de la soumission du questionnaire:', error);
      return null;
    }
  }

  // Obtenir les statistiques des questionnaires
  async getSurveyStats(): Promise<{
    totalSurveys: number;
    completedSurveys: number;
    completionRate: number;
    averageNPS: number;
    averageOverallSatisfaction: number;
    wouldRecommendRate: number;
    wouldUseAgainRate: number;
  }> {
    try {
      const surveys = await storage.getSatisfactionSurveys();
      const completed = surveys.filter(s => s.completed);
      
      const totalSurveys = surveys.length;
      const completedSurveys = completed.length;
      const completionRate = totalSurveys > 0 ? (completedSurveys / totalSurveys) * 100 : 0;
      
      const averageNPS = completed.length > 0 
        ? completed.reduce((sum, s) => sum + (s.npsScore || 0), 0) / completed.length 
        : 0;
      
      const averageOverallSatisfaction = completed.length > 0
        ? completed.reduce((sum, s) => sum + (s.overallSatisfaction || 0), 0) / completed.length
        : 0;
      
      const wouldRecommendRate = completed.length > 0
        ? (completed.filter(s => s.wouldRecommend).length / completed.length) * 100
        : 0;
      
      const wouldUseAgainRate = completed.length > 0
        ? (completed.filter(s => s.wouldUseAgain).length / completed.length) * 100
        : 0;

      return {
        totalSurveys,
        completedSurveys,
        completionRate,
        averageNPS,
        averageOverallSatisfaction,
        wouldRecommendRate,
        wouldUseAgainRate,
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        totalSurveys: 0,
        completedSurveys: 0,
        completionRate: 0,
        averageNPS: 0,
        averageOverallSatisfaction: 0,
        wouldRecommendRate: 0,
        wouldUseAgainRate: 0,
      };
    }
  }
}

export const surveyService = new SurveyService();