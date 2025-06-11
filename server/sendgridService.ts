import sgMail from '@sendgrid/mail';
import type { User, Order } from '@shared/schema';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class SendGridService {
  private isConfigured = false;
  private fromEmail = process.env.SENDGRID_VERIFIED_SENDER_EMAIL || 'noreply@gmail.com';

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
      // Use Replit domain if available, otherwise fallback to localhost
      const baseUrl = process.env.REPLIT_DOMAINS ? 
        `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 
        'http://localhost:5000';
      const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
      const template = this.generateVerificationTemplate(user, verificationUrl);
      
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      console.log('Attempting to send verification email to:', user.email);
      console.log('From email:', this.fromEmail);
      
      await sgMail.send(msg);
      console.log('Verification email sent successfully to:', user.email);
      return true;
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      console.error('SendGrid error details:', error.response?.body || error.message);
      return false;
    }
  }

  async sendPasswordResetEmail(user: User, resetToken: string): Promise<boolean> {
    if (!this.isConfigured) {
      console.error('SendGrid not configured');
      return false;
    }

    try {
      // Use Replit domain if available, otherwise fallback to localhost
      const baseUrl = process.env.REPLIT_DOMAINS ? 
        `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 
        'http://localhost:5000';
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
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

  async sendDeliveryDateConfirmedEmail(order: Order, user: User): Promise<boolean> {
    if (!this.isConfigured) {
      console.error('SendGrid not configured');
      return false;
    }

    try {
      const template = this.generateDeliveryDateConfirmedTemplate(order, user);
      
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      await sgMail.send(msg);
      console.log('Delivery date confirmed email sent to:', user.email);
      return true;
    } catch (error) {
      console.error('Error sending delivery date confirmed email:', error);
      return false;
    }
  }

  async sendDeliveryDateProposalEmail(order: Order, user: User, validationToken: string): Promise<boolean> {
    if (!this.isConfigured) {
      console.error('SendGrid not configured');
      return false;
    }

    try {
      const template = this.generateDeliveryDateProposalTemplate(order, user, validationToken);
      
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      await sgMail.send(msg);
      console.log('Delivery date proposal email sent to:', user.email);
      return true;
    } catch (error) {
      console.error('Error sending delivery date proposal email:', error);
      return false;
    }
  }

  async sendDeliveryDateAcceptedEmail(order: Order, user: User): Promise<boolean> {
    if (!this.isConfigured) {
      console.error('SendGrid not configured');
      return false;
    }

    try {
      const template = this.generateDeliveryDateAcceptedTemplate(order, user);
      
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      await sgMail.send(msg);
      console.log('Delivery date accepted email sent to:', user.email);
      return true;
    } catch (error) {
      console.error('Error sending delivery date accepted email:', error);
      return false;
    }
  }

  async sendDeliveryDateRejectedEmail(order: Order, user: User): Promise<boolean> {
    if (!this.isConfigured) {
      console.error('SendGrid not configured');
      return false;
    }

    try {
      const template = this.generateDeliveryDateRejectedTemplate(order, user);
      
      const msg = {
        to: user.email,
        from: this.fromEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      await sgMail.send(msg);
      console.log('Delivery date rejected email sent to:', user.email);
      return true;
    } catch (error) {
      console.error('Error sending delivery date rejected email:', error);
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
          <p>Téléphone : 03 44 45 11 58 | Email : contact@remondis.fr</p>
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
            <p><strong>Montant total :</strong> ${order.totalTTC || order.basePrice}€</p>
            <p><strong>Statut :</strong> En attente de traitement</p>
          </div>
          
          <p>Votre commande sera traitée dans les plus brefs délais. Vous recevrez une confirmation de livraison dès que votre commande sera validée par nos équipes.</p>
          
          <p>Vous pouvez suivre l'état de votre commande depuis votre espace client.</p>
          
          <p>Cordialement,<br>L'équipe REMONDIS France</p>
        </div>
        <div class="footer">
          <p>REMONDIS France SAS - Zone Industrielle Nord, 60000 Beauvais</p>
          <p>Téléphone : 03 44 45 11 58 | Email : contact@remondis.fr</p>
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
    - Montant : ${order.totalTTC || order.basePrice}€
    - Statut : En attente de traitement
    
    Vous recevrez une confirmation de livraison dès validation.
    
    Cordialement,
    L'équipe REMONDIS France
    `;

    return { subject, html, text };
  }

  private generateDeliveryDateConfirmedTemplate(order: Order, user: User): EmailTemplate {
    const subject = `Date de livraison confirmée - Commande ${order.orderNumber}`;
    const deliveryDate = new Date(order.deliveryDate!).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Date de livraison confirmée</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .date-box { background: #dcfce7; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Date de livraison confirmée</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || order.customerFirstName},</h2>
          <p>Bonne nouvelle ! La date de livraison de votre commande <strong>${order.orderNumber}</strong> a été confirmée.</p>
          
          <div class="date-box">
            <h3 style="margin: 0; color: #16a34a;">📅 Livraison prévue le</h3>
            <p style="font-size: 20px; font-weight: bold; margin: 10px 0; color: #16a34a;">${deliveryDate}</p>
          </div>
          
          <p>Votre benne sera livrée à l'adresse :</p>
          <p style="background: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626;">
            <strong>${order.deliveryStreet}<br>
            ${order.deliveryPostalCode} ${order.deliveryCity}</strong>
          </p>
          
          <p>Merci de vous assurer qu'une personne soit présente pour réceptionner la benne à la date convenue.</p>
          
          <p>Cordialement,<br>L'équipe REMONDIS France</p>
        </div>
        <div class="footer">
          <p>REMONDIS France - Gestion des déchets professionnelle<br>
          Email : contact@remondis.fr | Téléphone : 03 44 45 11 58</p>
        </div>
      </div>
    </body>
    </html>`;

    const text = `
    Date de livraison confirmée - Commande ${order.orderNumber}
    
    Bonjour ${user.firstName || order.customerFirstName},
    
    Bonne nouvelle ! La date de livraison de votre commande ${order.orderNumber} a été confirmée.
    
    Livraison prévue le : ${deliveryDate}
    
    Adresse de livraison :
    ${order.deliveryStreet}
    ${order.deliveryPostalCode} ${order.deliveryCity}
    
    Merci de vous assurer qu'une personne soit présente pour réceptionner la benne.
    
    Cordialement,
    L'équipe REMONDIS France
    `;

    return { subject, html, text };
  }

  private generateDeliveryDateProposalTemplate(order: Order, user: User, validationToken: string): EmailTemplate {
    const subject = `Nouvelle date de livraison proposée - Commande ${order.orderNumber}`;
    const proposedDate = new Date(order.proposedDeliveryDate!).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const acceptUrl = `${process.env.FRONTEND_URL || 'https://remondis-app.replit.app'}/validate-delivery?token=${validationToken}&action=accept`;
    const rejectUrl = `${process.env.FRONTEND_URL || 'https://remondis-app.replit.app'}/validate-delivery?token=${validationToken}&action=reject`;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouvelle date de livraison proposée</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .date-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: bold; }
        .accept { background: #059669; color: white; }
        .reject { background: #dc2626; color: white; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nouvelle date de livraison proposée</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || order.customerFirstName},</h2>
          <p>Nous vous proposons une nouvelle date de livraison pour votre commande <strong>${order.orderNumber}</strong>.</p>
          
          <div class="date-box">
            <h3 style="margin: 0; color: #f59e0b;">Nouvelle date proposée</h3>
            <p style="font-size: 18px; font-weight: bold; margin: 10px 0; color: #f59e0b;">${proposedDate}</p>
          </div>
          
          <p>Merci de nous indiquer si cette nouvelle date vous convient en cliquant sur l'un des boutons ci-dessous :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" class="button accept">✓ J'accepte cette date</a>
            <a href="${rejectUrl}" class="button reject">✗ Je refuse cette date</a>
          </div>
          
          <p><strong>Détails de la commande :</strong></p>
          <ul>
            <li>Numéro de commande : ${order.orderNumber}</li>
            <li>Adresse de livraison : ${order.deliveryStreet}, ${order.deliveryPostalCode} ${order.deliveryCity}</li>
          </ul>
          
          <p><em>Ce lien expire dans 7 jours. Si vous ne répondez pas d'ici là, vous devrez nous contacter directement.</em></p>
        </div>
        <div class="footer">
          <p>REMONDIS France - Gestion des déchets professionnelle<br>
          Email : contact@remondis.fr | Téléphone : 03 44 45 11 58</p>
        </div>
      </div>
    </body>
    </html>`;

    const text = `
    Nouvelle date de livraison proposée - Commande ${order.orderNumber}
    
    Bonjour ${user.firstName || order.customerFirstName},
    
    Nous vous proposons une nouvelle date de livraison pour votre commande ${order.orderNumber}.
    
    Nouvelle date proposée : ${proposedDate}
    
    Pour accepter cette date : ${acceptUrl}
    Pour refuser cette date : ${rejectUrl}
    
    Ce lien expire dans 7 jours.
    
    Cordialement,
    L'équipe REMONDIS France
    `;

    return { subject, html, text };
  }

  private generateDeliveryDateAcceptedTemplate(order: Order, user: User): EmailTemplate {
    const subject = `Date de livraison acceptée - Commande ${order.orderNumber}`;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Date de livraison acceptée</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .success-box { background: #d1fae5; border: 2px solid #059669; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Date acceptée</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || order.customerFirstName},</h2>
          <p>Merci d'avoir accepté la nouvelle date de livraison pour votre commande <strong>${order.orderNumber}</strong>.</p>
          
          <div class="success-box">
            <h3 style="margin: 0; color: #059669;">Date confirmée</h3>
            <p style="margin: 10px 0;">Votre livraison est maintenant programmée et confirmée.</p>
          </div>
          
          <p>Vous recevrez un email de confirmation final avec tous les détails de livraison.</p>
        </div>
        <div class="footer">
          <p>REMONDIS France - Gestion des déchets professionnelle</p>
        </div>
      </div>
    </body>
    </html>`;

    const text = `
    Date de livraison acceptée - Commande ${order.orderNumber}
    
    Bonjour ${user.firstName || order.customerFirstName},
    
    Merci d'avoir accepté la nouvelle date de livraison pour votre commande ${order.orderNumber}.
    
    Votre livraison est maintenant programmée et confirmée.
    
    Cordialement,
    L'équipe REMONDIS France
    `;

    return { subject, html, text };
  }

  private generateDeliveryDateRejectedTemplate(order: Order, user: User): EmailTemplate {
    const subject = `Date de livraison refusée - Commande ${order.orderNumber}`;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Date de livraison refusée</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .info-box { background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Date refusée</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${user.firstName || order.customerFirstName},</h2>
          <p>Nous avons bien noté que vous avez refusé la date de livraison proposée pour votre commande <strong>${order.orderNumber}</strong>.</p>
          
          <div class="info-box">
            <h3 style="margin: 0; color: #dc2626;">Prochaines étapes</h3>
            <p style="margin: 10px 0;">Notre équipe va vous proposer une nouvelle date de livraison sous 48h.</p>
          </div>
          
          <p>Vous pouvez également nous contacter directement pour discuter d'une date qui vous conviendrait mieux.</p>
          
          <p><strong>Contact :</strong><br>
          Email : contact@remondis.fr<br>
          Téléphone : 03 44 45 11 58</p>
        </div>
        <div class="footer">
          <p>REMONDIS France - Gestion des déchets professionnelle</p>
        </div>
      </div>
    </body>
    </html>`;

    const text = `
    Date de livraison refusée - Commande ${order.orderNumber}
    
    Bonjour ${user.firstName || order.customerFirstName},
    
    Nous avons bien noté que vous avez refusé la date de livraison proposée pour votre commande ${order.orderNumber}.
    
    Notre équipe va vous proposer une nouvelle date de livraison sous 48h.
    
    Contact :
    Email : contact@remondis.fr
    Téléphone : 03 44 45 11 58
    
    Cordialement,
    L'équipe REMONDIS France
    `;

    return { subject, html, text };
  }

  /**
   * Envoie une notification à l'équipe commerciale pour un utilisateur inactif
   */
  async sendInactiveUserNotification(user: any, orderHistory: any, salesEmail: string): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('SendGrid not configured, skipping inactive user notification');
      return false;
    }

    try {
      const template = this.generateInactiveUserNotificationTemplate(user, orderHistory);
      
      await sgMail.send({
        to: salesEmail,
        from: this.fromEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(`Inactive user notification sent to ${salesEmail} for user ${user.email}`);
      return true;
    } catch (error) {
      console.error('Error sending inactive user notification:', error);
      return false;
    }
  }

  /**
   * Envoie une notification à l'équipe commerciale pour une commande abandonnée
   */
  async sendAbandonedCheckoutNotification(abandonedCheckout: any, salesEmail: string): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('SendGrid not configured, skipping abandoned checkout notification');
      return false;
    }

    try {
      const template = this.generateAbandonedCheckoutNotificationTemplate(abandonedCheckout);
      
      await sgMail.send({
        to: salesEmail,
        from: this.fromEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(`Abandoned checkout notification sent to ${salesEmail} for customer ${abandonedCheckout.customerEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending abandoned checkout notification:', error);
      return false;
    }
  }

  /**
   * Template pour notification d'utilisateur inactif
   */
  private generateInactiveUserNotificationTemplate(user: any, orderHistory: any): EmailTemplate {
    const lastLoginFormatted = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais connecté';
    const lastOrderFormatted = orderHistory.lastOrderDate ? new Date(orderHistory.lastOrderDate).toLocaleDateString('fr-FR') : 'Aucune commande';
    
    const subject = `Alerte Client Inactif - ${user.firstName} ${user.lastName}`;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Client Inactif</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .alert-box { background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-box { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .history-box { background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .action-box { background: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Alerte Client Inactif</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <p><strong>Un client n'a pas utilisé nos services depuis plus d'un mois.</strong></p>
          </div>
          
          <div class="info-box">
            <h3>Informations Client :</h3>
            <p><strong>Nom :</strong> ${user.firstName} ${user.lastName}</p>
            <p><strong>Email :</strong> ${user.email}</p>
            <p><strong>Téléphone :</strong> ${user.phone || 'Non renseigné'}</p>
            <p><strong>Entreprise :</strong> ${user.companyName || 'Non renseignée'}</p>
            <p><strong>Dernière connexion :</strong> ${lastLoginFormatted}</p>
          </div>

          <div class="history-box">
            <h3>Historique des commandes :</h3>
            <p><strong>Nombre total de commandes :</strong> ${orderHistory.totalOrders}</p>
            <p><strong>Dernière commande :</strong> ${lastOrderFormatted}</p>
            <p><strong>Montant total :</strong> ${orderHistory.totalAmount.toFixed(2)} €</p>
            ${orderHistory.services.length > 0 ? `<p><strong>Services utilisés :</strong> ${orderHistory.services.join(', ')}</p>` : ''}
          </div>
          
          <div class="action-box">
            <h3>Action recommandée :</h3>
            <p>Nous vous recommandons de contacter ce client pour :</p>
            <ul>
              <li>Vérifier s'il a des besoins actuels</li>
              <li>Lui proposer nos nouveaux services</li>
              <li>Maintenir la relation commerciale</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>Notification automatique - Système de gestion des clients REMONDIS</p>
        </div>
      </div>
    </body>
    </html>`;

    const text = `
    ALERTE CLIENT INACTIF

    Un client n'a pas utilisé nos services depuis plus d'un mois :

    Informations Client :
    Nom : ${user.firstName} ${user.lastName}
    Email : ${user.email}
    Téléphone : ${user.phone || 'Non renseigné'}
    Entreprise : ${user.companyName || 'Non renseignée'}
    Dernière connexion : ${lastLoginFormatted}

    Historique des commandes :
    Nombre total : ${orderHistory.totalOrders}
    Dernière commande : ${lastOrderFormatted}
    Montant total : ${orderHistory.totalAmount.toFixed(2)} €
    Services utilisés : ${orderHistory.services.join(', ')}

    Action recommandée :
    Contacter ce client pour vérifier ses besoins actuels et maintenir la relation commerciale.
    `;

    return { subject, html, text };
  }

  /**
   * Template pour notification de commande abandonnée
   */
  private generateAbandonedCheckoutNotificationTemplate(abandonedCheckout: any): EmailTemplate {
    const wasteTypesText = abandonedCheckout.wasteTypes ? abandonedCheckout.wasteTypes.join(', ') : 'Non spécifiés';
    
    const subject = `Commande abandonnée - ${abandonedCheckout.customerFirstName} ${abandonedCheckout.customerLastName}`;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Commande Abandonnée</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .alert-box { background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-box { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-box { background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .action-box { background: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 Commande Abandonnée</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <p><strong>Un client a abandonné sa commande lors du tunnel de paiement.</strong></p>
          </div>
          
          <div class="info-box">
            <h3>Informations Client :</h3>
            <p><strong>Nom :</strong> ${abandonedCheckout.customerFirstName} ${abandonedCheckout.customerLastName}</p>
            <p><strong>Email :</strong> ${abandonedCheckout.customerEmail}</p>
            <p><strong>Téléphone :</strong> ${abandonedCheckout.customerPhone || 'Non renseigné'}</p>
          </div>

          <div class="order-box">
            <h3>Détails de la commande abandonnée :</h3>
            <p><strong>Service :</strong> ${abandonedCheckout.serviceName || 'Non spécifié'}</p>
            <p><strong>Montant :</strong> ${abandonedCheckout.totalAmount ? `${abandonedCheckout.totalAmount} €` : 'Non calculé'}</p>
            <p><strong>Durée :</strong> ${abandonedCheckout.durationDays ? `${abandonedCheckout.durationDays} jours` : 'Non spécifiée'}</p>
            <p><strong>Types de déchets :</strong> ${wasteTypesText}</p>
            <p><strong>Adresse de livraison :</strong> ${abandonedCheckout.deliveryAddress || 'Non renseignée'}</p>
            ${abandonedCheckout.deliveryCity ? `<p><strong>Ville :</strong> ${abandonedCheckout.deliveryCity} ${abandonedCheckout.deliveryPostalCode || ''}</p>` : ''}
          </div>
          
          <div class="action-box">
            <h3>Action recommandée :</h3>
            <p>Contactez rapidement ce client pour :</p>
            <ul>
              <li>Comprendre les raisons de l'abandon</li>
              <li>L'aider à finaliser sa commande</li>
              <li>Proposer des solutions adaptées</li>
              <li>Récupérer cette vente potentielle</li>
            </ul>
          </div>
          
          <p><small>Date d'abandon : ${new Date(abandonedCheckout.createdAt).toLocaleString('fr-FR')}</small></p>
        </div>
        <div class="footer">
          <p>Notification automatique - Système de gestion des commandes REMONDIS</p>
        </div>
      </div>
    </body>
    </html>`;

    const text = `
    COMMANDE ABANDONNÉE

    Un client a abandonné sa commande lors du paiement :

    Informations Client :
    Nom : ${abandonedCheckout.customerFirstName} ${abandonedCheckout.customerLastName}
    Email : ${abandonedCheckout.customerEmail}
    Téléphone : ${abandonedCheckout.customerPhone || 'Non renseigné'}

    Détails de la commande :
    Service : ${abandonedCheckout.serviceName || 'Non spécifié'}
    Montant : ${abandonedCheckout.totalAmount ? `${abandonedCheckout.totalAmount} €` : 'Non calculé'}
    Durée : ${abandonedCheckout.durationDays ? `${abandonedCheckout.durationDays} jours` : 'Non spécifiée'}
    Types de déchets : ${wasteTypesText}
    Adresse : ${abandonedCheckout.deliveryAddress || 'Non renseignée'}

    Action recommandée :
    Contacter ce client rapidement pour comprendre les raisons de l'abandon et l'aider à finaliser sa commande.

    Date d'abandon : ${new Date(abandonedCheckout.createdAt).toLocaleString('fr-FR')}
    `;

    return { subject, html, text };
  }

  // Envoyer un questionnaire de satisfaction
  async sendSatisfactionSurveyEmail(
    to: string,
    data: {
      firstName: string;
      lastName: string;
      orderNumber: string;
      surveyUrl: string;
      expiryDate: Date;
    }
  ): Promise<boolean> {
    const subject = `Votre avis nous intéresse - Commande ${data.orderNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Questionnaire de satisfaction</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background: #e5e7eb; padding: 20px; font-size: 12px; color: #6b7280; }
          .stars { color: #fbbf24; font-size: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Questionnaire de Satisfaction</h1>
            <p>Votre avis compte pour nous !</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${data.firstName} ${data.lastName},</h2>
            
            <p>Nous espérons que notre service de location de bennes pour votre commande <strong>${data.orderNumber}</strong> vous a donné entière satisfaction.</p>
            
            <p>Afin d'améliorer continuellement nos services, nous aimerions connaître votre avis sur votre expérience récente avec Remondis.</p>
            
            <div style="background: white; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <h3>🎯 Votre avis en 2 minutes</h3>
              <p>Ce questionnaire ne vous prendra que quelques minutes et nous aidera à :</p>
              <ul>
                <li>✅ Améliorer la qualité de nos services</li>
                <li>✅ Optimiser nos délais de livraison et collecte</li>
                <li>✅ Mieux répondre à vos besoins futurs</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.surveyUrl}" class="button">🚀 Répondre au questionnaire</a>
            </div>
            
            <p><strong>⏰ Important :</strong> Ce questionnaire est disponible jusqu'au ${data.expiryDate.toLocaleDateString('fr-FR')}.</p>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>🎁 Merci pour votre fidélité !</strong></p>
              <p>Vos réponses nous aident à vous offrir le meilleur service possible. En tant que client fidèle, votre satisfaction est notre priorité.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Cet email concerne votre commande ${data.orderNumber}. Si vous avez des questions, contactez-nous à contact@remondis.fr</p>
            <p>Remondis - Solutions durables pour la gestion des déchets</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Bonjour ${data.firstName} ${data.lastName},

Nous espérons que notre service de location de bennes pour votre commande ${data.orderNumber} vous a donné entière satisfaction.

Afin d'améliorer continuellement nos services, nous aimerions connaître votre avis sur votre expérience récente avec Remondis.

Répondez à notre questionnaire en cliquant sur ce lien : ${data.surveyUrl}

Ce questionnaire est disponible jusqu'au ${data.expiryDate.toLocaleDateString('fr-FR')}.

Merci pour votre temps et votre fidélité !

L'équipe Remondis
    `;

    return await this.sendEmailNotification({
      to,
      from: 'satisfaction@remondis.fr',
      subject,
      text,
      html,
    });
  }

  // Envoyer un rappel de questionnaire de satisfaction
  async sendSatisfactionSurveyReminder(
    to: string,
    data: {
      firstName: string;
      lastName: string;
      orderNumber: string;
      surveyUrl: string;
      expiryDate: Date;
    }
  ): Promise<boolean> {
    const subject = `⏰ Rappel - Votre avis nous intéresse - Commande ${data.orderNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rappel - Questionnaire de satisfaction</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background: #e5e7eb; padding: 20px; font-size: 12px; color: #6b7280; }
          .urgent { background: #fef2f2; border: 1px solid #fca5a5; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Rappel Important</h1>
            <p>Votre questionnaire expire bientôt !</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${data.firstName} ${data.lastName},</h2>
            
            <p>Nous vous avions récemment envoyé un questionnaire de satisfaction concernant votre commande <strong>${data.orderNumber}</strong>.</p>
            
            <div class="urgent">
              <h3>⚠️ Dernière chance !</h3>
              <p>Votre questionnaire expire le <strong>${data.expiryDate.toLocaleDateString('fr-FR')}</strong>. Ne manquez pas cette opportunité de nous faire part de votre expérience.</p>
            </div>
            
            <p>Vos commentaires sont précieux pour nous aider à améliorer nos services. Cela ne prend que 2 minutes !</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.surveyUrl}" class="button">🔥 Répondre maintenant</a>
            </div>
            
            <p>Merci de prendre quelques instants pour partager votre avis.</p>
          </div>
          
          <div class="footer">
            <p>Cet email concerne votre commande ${data.orderNumber}. Si vous avez des questions, contactez-nous à contact@remondis.fr</p>
            <p>Remondis - Solutions durables pour la gestion des déchets</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Bonjour ${data.firstName} ${data.lastName},

RAPPEL - Votre questionnaire de satisfaction expire bientôt !

Nous vous avions récemment envoyé un questionnaire concernant votre commande ${data.orderNumber}.

Votre questionnaire expire le ${data.expiryDate.toLocaleDateString('fr-FR')}.

Répondez maintenant : ${data.surveyUrl}

Merci pour votre temps !

L'équipe Remondis
    `;

    return await this.sendEmailNotification({
      to,
      from: 'satisfaction@remondis.fr',
      subject,
      text,
      html,
    });
  }
}

export const sendGridService = new SendGridService();