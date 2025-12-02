import Settings from '../models/Settings.js';
import User from '../models/User.js';
import { createError } from '../utils/error.js';
import { createTransporter } from '../utils/emailConfig.js';

export const getEmailConfig = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    
    if (!settings || !settings.emailConfig) {
      return res.status(200).json({
        emailConfig: {
          enabled: false,
          host: '',
          port: 587,
          username: '',
          password: '',
          fromEmail: '',
          fromName: 'MySoov',
        }
      });
    }

    const { password, ...emailConfigWithoutPassword } = settings.emailConfig.toObject();

    res.status(200).json({
      emailConfig: {
        ...emailConfigWithoutPassword,
        password: password ? '••••••••' : '',
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateEmailConfig = async (req, res, next) => {
  try {
    const { emailConfig } = req.body;

    console.log('Received email config update:', JSON.stringify(emailConfig, null, 2));

    if (!emailConfig) {
      return next(createError(400, 'Email configuration is required'));
    }

    // Trim all string fields
    if (emailConfig.host) emailConfig.host = emailConfig.host.trim();
    if (emailConfig.username) emailConfig.username = emailConfig.username.trim();
    // Only trim leading/trailing spaces from password (Gmail accepts spaces)
    if (emailConfig.password) emailConfig.password = emailConfig.password.trim();
    if (emailConfig.fromEmail) emailConfig.fromEmail = emailConfig.fromEmail.trim();
    if (emailConfig.fromName) emailConfig.fromName = emailConfig.fromName.trim();

    // Convert port to number if it's a string
    if (emailConfig.port) {
      emailConfig.port = parseInt(emailConfig.port, 10);
    }

    let settings = await Settings.findOne();

    if (!settings) {
      console.log('Creating new settings document');
      settings = new Settings({
        emailConfig
      });
    } else {
      console.log('Updating existing settings');
      // If password is masked or empty, preserve existing password
      if ((emailConfig.password === '••••••••' || !emailConfig.password) && settings.emailConfig?.password) {
        console.log('Preserving existing password');
        emailConfig.password = settings.emailConfig.password;
      }
      settings.emailConfig = emailConfig;
    }

    await settings.save();
    console.log('Settings saved successfully - enabled:', settings.emailConfig.enabled, 'host:', settings.emailConfig.host);

    res.status(200).json({
      success: true,
      message: 'Email configuration updated successfully'
    });
  } catch (err) {
    console.error('Error saving email config:', err);
    console.error('Error details:', err.message);
    if (err.errors) {
      console.error('Validation errors:', JSON.stringify(err.errors, null, 2));
    }
    next(err);
  }
};

export const debugEmailConfig = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    
    res.status(200).json({
      hasSettings: !!settings,
      hasEmailConfig: !!settings?.emailConfig,
      config: settings?.emailConfig ? {
        enabled: settings.emailConfig.enabled,
        host: settings.emailConfig.host,
        port: settings.emailConfig.port,
        username: settings.emailConfig.username,
        hasPassword: !!settings.emailConfig.password,
        fromEmail: settings.emailConfig.fromEmail,
        fromName: settings.emailConfig.fromName,
      } : null
    });
  } catch (err) {
    next(err);
  }
};

export const sendTestEmail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    const settings = await Settings.findOne();
    
    if (!settings || !settings.emailConfig) {
      return next(createError(400, 'Email configuration not found. Please save your settings first.'));
    }

    if (!settings.emailConfig.enabled) {
      return next(createError(400, 'Email system is not enabled. Please enable it in settings.'));
    }

    if (!settings.emailConfig.host || !settings.emailConfig.username || !settings.emailConfig.password) {
      return next(createError(400, 'Email configuration is incomplete. Please fill in all required fields (host, username, password).'));
    }

    const transporter = await createTransporter();
    const fromEmail = settings.emailConfig.fromEmail || settings.emailConfig.username;
    const fromName = settings.emailConfig.fromName || 'MySoov';

    const mailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to: user.email,
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
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Test Email</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.displayName || user.username}!</h2>
              <p>This is a test email from MySoov email system.</p>
              <p>If you're receiving this, your email configuration is working correctly!</p>
              <p><strong>Configuration Details:</strong></p>
              <ul>
                <li>SMTP Host: ${settings.emailConfig.host}</li>
                <li>SMTP Port: ${settings.emailConfig.port}</li>
                <li>From Email: ${fromEmail}</li>
              </ul>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} MySoov. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (err) {
    console.error('Test email error:', err);
    next(createError(500, err.message || 'Failed to send test email'));
  }
};
