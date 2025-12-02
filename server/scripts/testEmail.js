import mongoose from 'mongoose';
import Settings from '../models/Settings.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testEmail = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    const settings = await Settings.findOne();
    
    if (!settings || !settings.emailConfig) {
      console.error('❌ No email configuration found in database');
      process.exit(1);
    }

    const config = settings.emailConfig;
    
    console.log('📧 Email Configuration:');
    console.log('  Enabled:', config.enabled);
    console.log('  Host:', config.host);
    console.log('  Port:', config.port);
    console.log('  Username:', config.username);
    console.log('  Password:', config.password ? '✓ Set (' + config.password.length + ' chars)' : '✗ Not set');
    console.log('  From Email:', config.fromEmail);
    console.log('  From Name:', config.fromName);
    console.log('');

    if (!config.enabled) {
      console.error('❌ Email system is disabled');
      process.exit(1);
    }

    if (!config.host || !config.username || !config.password) {
      console.error('❌ Email configuration is incomplete');
      process.exit(1);
    }

    console.log('🔄 Creating transporter...');
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.username,
        pass: config.password,
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true,
      logger: true
    });

    console.log('🔄 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');

    const testRecipient = process.argv[2] || config.username;
    console.log('📨 Sending test email to:', testRecipient);

    const fromEmail = config.fromEmail || config.username;
    const fromName = config.fromName || 'MySoov';

    const info = await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: testRecipient,
      subject: 'Test Email - MySoov',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Test Email</h1>
            </div>
            <div class="content">
              <h2>Success!</h2>
              <p>This test email was sent successfully from MySoov.</p>
              <p><strong>Configuration:</strong></p>
              <ul>
                <li>SMTP Host: ${config.host}</li>
                <li>SMTP Port: ${config.port}</li>
                <li>From: ${fromEmail}</li>
              </ul>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('\n✨ All tests passed!\n');
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    
    if (err.code === 'EAUTH' || err.responseCode === 535) {
      console.error('\n💡 Authentication failed. Check:');
      console.error('   - Username is correct');
      console.error('   - Password is correct (for Gmail, use App Password)');
      console.error('   - No extra spaces in credentials');
    } else if (err.code === 'ECONNECTION' || err.code === 'ETIMEDOUT') {
      console.error('\n💡 Connection failed. Check:');
      console.error('   - SMTP host is correct');
      console.error('   - Port is correct (587 for TLS, 465 for SSL)');
      console.error('   - Firewall allows outgoing SMTP connections');
    }
    
    console.error('\nFull error:', err);
    process.exit(1);
  }
};

console.log('🚀 MySoov Email Test Script');
console.log('============================\n');
testEmail();
