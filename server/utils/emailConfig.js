import nodemailer from 'nodemailer';
import Settings from '../models/Settings.js';

export const createTransporter = async () => {
  const settings = await Settings.findOne();
  
  if (!settings || !settings.emailConfig || !settings.emailConfig.enabled) {
    throw new Error('Email configuration is not enabled');
  }

  const config = settings.emailConfig;

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.username,
      pass: config.password,
    },
    // Additional options for better compatibility
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporter;
};

export const getEmailFromSettings = async () => {
  const settings = await Settings.findOne();
  if (!settings || !settings.emailConfig) {
    return 'MySoov TV <noreply@mysoov.com>';
  }
  const fromEmail = settings.emailConfig.fromEmail || settings.emailConfig.username;
  const fromName = settings.emailConfig.fromName || 'MySoov TV';
  return `${fromName} <${fromEmail}>`;
};
