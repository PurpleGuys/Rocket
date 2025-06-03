import sgMail from '@sendgrid/mail';
import type { User, Order } from '@shared/schema';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class SendGridService {
  private isConfigured = false;
  private fromEmail = 'noreply@gmail.com'; // Email générique pour test

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (!apiKey) {
      console.warn('SendGrid API key not configured. Email sending will be disabled.');
      return;
    }

    sgMail.setApiKey(apiKey);
    this.isConfigured = true;
    console.log('SendGrid email service initialized successfully.');
  }

  async sendVerificationEmail(user: User, verificationToken: string): Promise<boolean> {
    if (!this.isConfigured) {
      console.error('SendGrid not configured');
      return false;
    }

    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${verificationToken}`;
      const template = this.generateVerificationTemplate(user, verificationUrl);
      
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      await sgMail.send(msg);
      console.log('Verification email sent to:', user.email);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(user: User, resetToken: string): Promise<boolean> {
    if (!this.isConfigured) {
      console.error('SendGrid not configured');
      return false;
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
      const template = this.generatePasswordResetTemplate(user, resetUrl);
      
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      await sgMail.send(msg);
      console.log('Password reset email sent to:', user.email);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(user: User): Promise<boolean> {
    if (!this.isConfigured) {
      console.error('SendGrid not configured');
      return false;
    }

    try {
      const template = this.generateWelcomeTemplate(user);
      
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      await sgMail.send(msg);
      console.log('Welcome email sent to:', user.email);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  async sendOrderConfirmationEmail(order: Order, user: User): Promise<boolean> {
    if (!this.isConfigured) {
      console.error('SendGrid not configured');
      return false;
    }

    try {
      const template = this.generateOrderConfirmationTemplate(order, user);
      
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      await sgMail.send(msg);
      console.log('Order confirmation email sent to:', user.email);
      return true;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return false;
    }
  }

  private generateVerificationTemplate(user: User, verificationUrl: string): EmailTemplate {
    const subject = 'Vérifiez votre adresse email - REMONDIS France';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vérification d'email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { height: 40px; margin-bottom: 10px; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" alt="REMONDIS" class="logo">
          <h1>Vérification de votre compte</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || 'Cher client'},</h2>
          <p>Merci de vous être inscrit sur notre plateforme REMONDIS France. Pour finaliser votre inscription et accéder à tous nos services de collecte et traitement de déchets, veuillez vérifier votre adresse email.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="button">Vérifier mon email</a>
          </div>
          
          <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${verificationUrl}</p>
          
          <p><strong>Ce lien expirera dans 24 heures.</strong></p>
          
          <p>Si vous n'avez pas créé de compte sur notre plateforme, vous pouvez ignorer cet email.</p>
          
          <p>Cordialement,<br>L'équipe REMONDIS France</p>
        </div>
        <div class="footer">
          <p>REMONDIS France SAS - Zone Industrielle Nord, 60000 Beauvais</p>
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
    Vérification de votre compte REMONDIS France
    
    Bonjour ${user.firstName || 'Cher client'},
    
    Merci de vous être inscrit sur notre plateforme REMONDIS France. Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le lien suivant :
    
    ${verificationUrl}
    
    Ce lien expirera dans 24 heures.
    
    Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
    
    Cordialement,
    L'équipe REMONDIS France
    `;

    return { subject, html, text };
  }

  private generatePasswordResetTemplate(user: User, resetUrl: string): EmailTemplate {
    const subject = 'Réinitialisation de votre mot de passe - REMONDIS France';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation mot de passe</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { height: 40px; margin-bottom: 10px; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
        .warning { background: #fef3cd; border: 1px solid #faebcc; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" alt="REMONDIS" class="logo">
          <h1>Réinitialisation de mot de passe</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || 'Cher client'},</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte REMONDIS France.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
          </div>
          
          <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
          
          <div class="warning">
            <strong>Important :</strong> Ce lien expirera dans 1 heure pour des raisons de sécurité.
          </div>
          
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre mot de passe actuel restera inchangé.</p>
          
          <p>Pour votre sécurité, nous vous recommandons de :</p>
          <ul>
            <li>Choisir un mot de passe fort et unique</li>
            <li>Ne pas partager vos identifiants</li>
            <li>Vous déconnecter après chaque session</li>
          </ul>
          
          <p>Cordialement,<br>L'équipe REMONDIS France</p>
        </div>
        <div class="footer">
          <p>REMONDIS France SAS - Zone Industrielle Nord, 60000 Beauvais</p>
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
    Réinitialisation de votre mot de passe REMONDIS France
    
    Bonjour ${user.firstName || 'Cher client'},
    
    Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien suivant pour définir un nouveau mot de passe :
    
    ${resetUrl}
    
    Ce lien expirera dans 1 heure pour des raisons de sécurité.
    
    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
    
    Cordialement,
    L'équipe REMONDIS France
    `;

    return { subject, html, text };
  }

  private generateWelcomeTemplate(user: User): EmailTemplate {
    const subject = 'Bienvenue chez REMONDIS France !';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenue chez REMONDIS</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { height: 40px; margin-bottom: 10px; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
        .services { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" alt="REMONDIS" class="logo">
          <h1>Bienvenue chez REMONDIS France !</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || 'Cher client'},</h2>
          <p>Félicitations ! Votre compte REMONDIS France a été créé avec succès. Nous sommes ravis de vous compter parmi nos clients.</p>
          
          <div class="services">
            <h3>Nos services à votre disposition :</h3>
            <ul>
              <li><strong>Location de bennes</strong> - Différentes tailles selon vos besoins</li>
              <li><strong>Collecte de déchets</strong> - Service régulier ou ponctuel</li>
              <li><strong>Traitement spécialisé</strong> - Déchets dangereux et non dangereux</li>
              <li><strong>Conseil environnemental</strong> - Optimisation de votre gestion des déchets</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard" class="button">Accéder à mon espace</a>
          </div>
          
          <p>Votre espace client vous permet de :</p>
          <ul>
            <li>Commander nos services en ligne</li>
            <li>Suivre vos commandes en temps réel</li>
            <li>Consulter vos factures</li>
            <li>Gérer vos abonnements</li>
          </ul>
          
          <p>Notre équipe reste à votre disposition pour toute question. N'hésitez pas à nous contacter.</p>
          
          <p>Cordialement,<br>L'équipe REMONDIS France</p>
        </div>
        <div class="footer">
          <p>REMONDIS France SAS - Zone Industrielle Nord, 60000 Beauvais</p>
          <p>Téléphone : 03 44 XX XX XX | Email : contact@remondis.fr</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
    Bienvenue chez REMONDIS France !
    
    Bonjour ${user.firstName || 'Cher client'},
    
    Félicitations ! Votre compte REMONDIS France a été créé avec succès.
    
    Nos services à votre disposition :
    - Location de bennes
    - Collecte de déchets
    - Traitement spécialisé
    - Conseil environnemental
    
    Accédez à votre espace client : ${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard
    
    Cordialement,
    L'équipe REMONDIS France
    `;

    return { subject, html, text };
  }

  private generateOrderConfirmationTemplate(order: Order, user: User): EmailTemplate {
    const subject = `Confirmation de commande #${order.orderNumber} - REMONDIS France`;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de commande</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { height: 40px; margin-bottom: 10px; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .order-details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" alt="REMONDIS" class="logo">
          <h1>Commande confirmée</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || 'Cher client'},</h2>
          <p>Nous avons bien reçu votre commande et nous vous en remercions.</p>
          
          <div class="order-details">
            <h3>Détails de votre commande</h3>
            <p><strong>Numéro de commande :</strong> ${order.orderNumber}</p>
            <p><strong>Date de commande :</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
            <p><strong>Montant total :</strong> ${order.totalAmount}€</p>
            <p><strong>Statut :</strong> En attente de traitement</p>
          </div>
          
          <p>Votre commande sera traitée dans les plus brefs délais. Vous recevrez une confirmation de livraison dès que votre commande sera validée par nos équipes.</p>
          
          <p>Vous pouvez suivre l'état de votre commande depuis votre espace client.</p>
          
          <p>Cordialement,<br>L'équipe REMONDIS France</p>
        </div>
        <div class="footer">
          <p>REMONDIS France SAS - Zone Industrielle Nord, 60000 Beauvais</p>
          <p>Téléphone : 03 44 XX XX XX | Email : contact@remondis.fr</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
    Confirmation de commande #${order.orderNumber} - REMONDIS France
    
    Bonjour ${user.firstName || 'Cher client'},
    
    Nous avons bien reçu votre commande.
    
    Détails :
    - Numéro : ${order.orderNumber}
    - Date : ${new Date(order.createdAt).toLocaleDateString('fr-FR')}
    - Montant : ${order.totalAmount}€
    - Statut : En attente de traitement
    
    Vous recevrez une confirmation de livraison dès validation.
    
    Cordialement,
    L'équipe REMONDIS France
    `;

    return { subject, html, text };
  }
}

export const sendGridService = new SendGridService();