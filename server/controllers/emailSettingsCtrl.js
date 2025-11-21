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

    if (!emailConfig) {
      return next(createError(400, 'Email configuration is required'));
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({
        emailConfig
      });
    } else {
      if (emailConfig.password === '••••••••' && settings.emailConfig?.password) {
        emailConfig.password = settings.emailConfig.password;
      }
      settings.emailConfig = emailConfig;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Email configuration updated successfully'
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

    const transporter = await createTransporter();
    const settings = await Settings.findOne();
    const fromEmail = settings?.emailConfig?.fromEmail || settings?.emailConfig?.username;
    const fromName = settings?.emailConfig?.fromName || 'MySoov';

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
