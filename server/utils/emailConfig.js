import nodemailer from 'nodemailer';
import Settings from '../models/Settings.js';

export const createTransporter = async () => {
  const settings = await Settings.findOne();
  
  if (!settings || !settings.emailConfig || !settings.emailConfig.enabled) {
    throw new Error('Email configuration is not enabled');
  }

  const config = settings.emailConfig;

  console.log('Creating nodemailer transporter with config:', {
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    user: config.username,
    hasPassword: !!config.password
  });

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
    },
    debug: true, // Enable debug output
    logger: true // Enable logger
  });

  return transporter;
};

export const getEmailFromSettings = async () => {
  const settings = await Settings.findOne();
  if (!settings || !settings.emailConfig) {
    return 'noreply@mysoov.com';
  }
  return settings.emailConfig.fromEmail || settings.emailConfig.username;
};
