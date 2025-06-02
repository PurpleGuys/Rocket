import nodemailer from 'nodemailer';
import { storage } from './storage';
import type { Order, InsertEmailLog, InsertAuditLog } from '@shared/schema';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Check if email configuration is available
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailHost || !emailUser || !emailPass) {
      console.warn('Email configuration incomplete. Email sending will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: emailHost,
      port: parseInt(emailPort || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  async sendConfirmationEmail(order: Order): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    try {
      const template = this.generateConfirmationTemplate(order);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: order.customerEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      const result = await this.transporter.sendMail(mailOptions);

      // Log the email
      await this.logEmail({
        orderId: order.id,
        emailType: 'confirmation',
        recipientEmail: order.customerEmail,
        subject: template.subject,
        emailContent: template.html,
        status: 'sent',
        sentBy: null,
      });

      // Update order confirmation status
      await storage.updateOrderEmailStatus(order.id, { confirmationEmailSent: true });

      console.log('Confirmation email sent:', result.messageId);
      return true;

    } catch (error: any) {
      console.error('Error sending confirmation email:', error);

      // Log the failed email
      await this.logEmail({
        orderId: order.id,
        emailType: 'confirmation',
        recipientEmail: order.customerEmail,
        subject: 'Confirmation de commande',
        status: 'failed',
        errorMessage: error.message,
        sentBy: null,
      });

      return false;
    }
  }

  async sendValidationEmail(order: Order, adminUserId: number): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    try {
      const template = this.generateValidationTemplate(order);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: order.customerEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      const result = await this.transporter.sendMail(mailOptions);

      // Log the email
      await this.logEmail({
        orderId: order.id,
        emailType: 'validation',
        recipientEmail: order.customerEmail,
        subject: template.subject,
        emailContent: template.html,
        status: 'sent',
        sentBy: adminUserId,
      });

      // Update order validation status
      await storage.updateOrderEmailStatus(order.id, { validationEmailSent: true });

      console.log('Validation email sent:', result.messageId);
      return true;

    } catch (error: any) {
      console.error('Error sending validation email:', error);

      // Log the failed email
      await this.logEmail({
        orderId: order.id,
        emailType: 'validation',
        recipientEmail: order.customerEmail,
        subject: 'Confirmation de livraison',
        status: 'failed',
        errorMessage: error.message,
        sentBy: adminUserId,
      });

      return false;
    }
  }

  private generateConfirmationTemplate(order: Order): EmailTemplate {
    const customerName = `${order.customerFirstName} ${order.customerLastName}`;
    const deliveryAddress = `${order.deliveryStreet}, ${order.deliveryPostalCode} ${order.deliveryCity}`;
    const estimatedDate = order.estimatedDeliveryDate 
      ? new Date(order.estimatedDeliveryDate).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'À confirmer';

    const subject = `Confirmation de commande ${order.orderNumber} - Remondis`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #FF0000; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .order-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REMONDIS</h1>
          <h2>Confirmation de commande</h2>
        </div>
        
        <div class="content">
          <p>Bonjour ${customerName},</p>
          
          <p>Nous vous remercions pour votre commande. Voici le récapitulatif :</p>
          
          <div class="order-details">
            <h3>Détails de la commande</h3>
            <p><strong>Numéro de commande :</strong> ${order.orderNumber}</p>
            <p><strong>Date de commande :</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
            <p><strong>Service :</strong> Benne ${order.serviceId}</p>
            <p><strong>Types de déchets :</strong> ${order.wasteTypes?.join(', ') || 'Non spécifié'}</p>
            <p><strong>Adresse de livraison :</strong> ${deliveryAddress}</p>
            <p><strong>Montant total :</strong> ${order.totalTTC}€ TTC</p>
            <p><strong>Date de livraison prévue :</strong> ${estimatedDate}</p>
          </div>
          
          <p>Notre équipe va examiner votre demande et vous confirmera la date définitive de livraison dans les plus brefs délais.</p>
          
          <p>Pour toute question, n'hésitez pas à nous contacter.</p>
          
          <p>Cordialement,<br>L'équipe REMONDIS</p>
        </div>
        
        <div class="footer">
          <p>REMONDIS - Gestion professionnelle des déchets</p>
          <p>Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      REMONDIS - Confirmation de commande
      
      Bonjour ${customerName},
      
      Nous vous remercions pour votre commande ${order.orderNumber}.
      
      Détails :
      - Date de commande : ${new Date(order.createdAt).toLocaleDateString('fr-FR')}
      - Service : Benne ${order.serviceId}
      - Types de déchets : ${order.wasteTypes?.join(', ') || 'Non spécifié'}
      - Adresse : ${deliveryAddress}
      - Montant : ${order.totalTTC}€ TTC
      - Livraison prévue : ${estimatedDate}
      
      Notre équipe va examiner votre demande et vous confirmera la date définitive.
      
      Cordialement,
      L'équipe REMONDIS
    `;

    return { subject, html, text };
  }

  private generateValidationTemplate(order: Order): EmailTemplate {
    const customerName = `${order.customerFirstName} ${order.customerLastName}`;
    const deliveryAddress = `${order.deliveryStreet}, ${order.deliveryPostalCode} ${order.deliveryCity}`;
    const confirmedDate = order.confirmedDeliveryDate 
      ? new Date(order.confirmedDeliveryDate).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'À définir';

    const subject = `Date de livraison confirmée - Commande ${order.orderNumber}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #FF0000; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .highlight { background-color: #e8f5e8; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }
          .order-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REMONDIS</h1>
          <h2>Date de livraison confirmée</h2>
        </div>
        
        <div class="content">
          <p>Bonjour ${customerName},</p>
          
          <div class="highlight">
            <h3>Votre livraison est programmée !</h3>
            <p><strong>Date et heure de livraison :</strong> ${confirmedDate}</p>
          </div>
          
          <p>Votre commande ${order.orderNumber} sera livrée à l'adresse suivante :</p>
          <p><strong>${deliveryAddress}</strong></p>
          
          <div class="order-details">
            <h3>Rappel de votre commande</h3>
            <p><strong>Service :</strong> Benne ${order.serviceId}</p>
            <p><strong>Types de déchets :</strong> ${order.wasteTypes?.join(', ') || 'Non spécifié'}</p>
            <p><strong>Montant :</strong> ${order.totalTTC}€ TTC</p>
          </div>
          
          <p><strong>Conseils pour la livraison :</strong></p>
          <ul>
            <li>Assurez-vous que l'accès soit libre pour notre camion</li>
            <li>Une personne doit être présente pour réceptionner la benne</li>
            <li>Préparez vos déchets conformément aux types sélectionnés</li>
          </ul>
          
          <p>Pour toute question ou modification, contactez-nous rapidement.</p>
          
          <p>Cordialement,<br>L'équipe REMONDIS</p>
        </div>
        
        <div class="footer">
          <p>REMONDIS - Gestion professionnelle des déchets</p>
          <p>Pour nous contacter : contact@remondis.fr</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      REMONDIS - Date de livraison confirmée
      
      Bonjour ${customerName},
      
      Votre commande ${order.orderNumber} sera livrée le ${confirmedDate}.
      
      Adresse de livraison : ${deliveryAddress}
      
      Rappel :
      - Service : Benne ${order.serviceId}
      - Types de déchets : ${order.wasteTypes?.join(', ') || 'Non spécifié'}
      - Montant : ${order.totalTTC}€ TTC
      
      Assurez-vous que l'accès soit libre et qu'une personne soit présente.
      
      Cordialement,
      L'équipe REMONDIS
    `;

    return { subject, html, text };
  }

  private async logEmail(emailLog: InsertEmailLog): Promise<void> {
    try {
      await storage.createEmailLog(emailLog);
    } catch (error) {
      console.error('Error logging email:', error);
    }
  }

  async logAuditAction(auditLog: InsertAuditLog): Promise<void> {
    try {
      await storage.createAuditLog(auditLog);
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  }
}

export const emailService = new EmailService();