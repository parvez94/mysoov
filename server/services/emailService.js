import { createTransporter, getEmailFromSettings } from '../utils/emailConfig.js';
import {
  welcomeEmailTemplate,
  passwordResetTemplate,
  purchaseConfirmationTemplate,
} from './emailTemplates.js';

export const sendWelcomeEmail = async (user) => {
  try {
    const transporter = await createTransporter();
    const fromEmail = await getEmailFromSettings();

    const mailOptions = {
      from: fromEmail,
      to: user.email,
      subject: 'Welcome to MySoov!',
      html: welcomeEmailTemplate(user),
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', user.email);
  } catch (error) {
    console.error('Error sending welcome email:', error.message);
  }
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const transporter = await createTransporter();
    const fromEmail = await getEmailFromSettings();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: fromEmail,
      to: user.email,
      subject: 'Password Reset Request',
      html: passwordResetTemplate(user, resetUrl),
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', user.email);
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    throw error;
  }
};

export const sendPurchaseConfirmationEmail = async (user, purchaseDetails) => {
  try {
    const transporter = await createTransporter();
    const fromEmail = await getEmailFromSettings();

    const mailOptions = {
      from: fromEmail,
      to: user.email,
      subject: 'Purchase Confirmation',
      html: purchaseConfirmationTemplate(user, purchaseDetails),
    };

    await transporter.sendMail(mailOptions);
    console.log('Purchase confirmation email sent to:', user.email);
  } catch (error) {
    console.error('Error sending purchase confirmation email:', error.message);
  }
};
