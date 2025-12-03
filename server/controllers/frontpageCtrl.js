import FrontpageSettings from '../models/FrontpageSettings.js';
import { createError } from '../utils/error.js';
import { createTransporter, getEmailFromSettings } from '../utils/emailConfig.js';
import Settings from '../models/Settings.js';

// Get frontpage settings
export const getFrontpageSettings = async (req, res, next) => {
  try {
    let settings = await FrontpageSettings.findOne();

    // If no settings exist, create default ones
    if (!settings) {
      settings = new FrontpageSettings({
        slider: {
          enabled: true,
          items: [],
        },
        happyViewsSection: {
          enabled: true,
          backgroundColor: '#FF8C00',
          heading: 'Happy Views',
          steps: [
            { number: 1, text: 'Step 1: Create your account' },
            { number: 2, text: 'Step 2: Upload your content' },
            { number: 3, text: 'Step 3: Share with the world' },
            { number: 4, text: 'Step 4: Enjoy the views' },
          ],
          codeInput: {
            label: 'Enter your code',
            placeholder: 'Enter code here...',
          },
        },
        bannerSection: {
          enabled: true,
          items: [],
        },
        happyTeamSection: {
          enabled: true,
          leftText: 'Happy Team',
          buttonText: 'Register',
        },
        footerSection: {
          enabled: true,
          siteName: 'Company Name',
          roles: ['Developer', 'Designer', 'Manager', 'Other'],
        },
      });
      await settings.save();
    }

    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
};

// Update frontpage settings
export const updateFrontpageSettings = async (req, res, next) => {
  try {
    let settings = await FrontpageSettings.findOne();

    if (!settings) {
      settings = new FrontpageSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();
    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
};

// Add slider item
export const addSliderItem = async (req, res, next) => {
  try {
    const { type, url, alt, title } = req.body;

    if (!type || !url) {
      return next(createError(400, 'Type and URL are required'));
    }

    let settings = await FrontpageSettings.findOne();
    if (!settings) {
      settings = new FrontpageSettings();
    }

    settings.slider.items.push({ type, url, alt, title });
    await settings.save();

    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
};

// Remove slider item
export const removeSliderItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    let settings = await FrontpageSettings.findOne();
    if (!settings) {
      return next(createError(404, 'Settings not found'));
    }

    settings.slider.items = settings.slider.items.filter(
      (item) => item._id.toString() !== itemId
    );

    await settings.save();
    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
};

// Update slider item
export const updateSliderItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { type, url, alt, title } = req.body;

    let settings = await FrontpageSettings.findOne();
    if (!settings) {
      return next(createError(404, 'Settings not found'));
    }

    const itemIndex = settings.slider.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return next(createError(404, 'Slider item not found'));
    }

    settings.slider.items[itemIndex] = {
      ...settings.slider.items[itemIndex].toObject(),
      type,
      url,
      alt,
      title,
    };

    await settings.save();
    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
};

// Handle code submission
export const submitCode = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return next(createError(400, 'Code is required'));
    }

    // Here you can add your code validation logic
    // For now, we'll just return a success message

    res.status(200).json({
      success: true,
      message: 'Code submitted successfully',
      code,
    });
  } catch (err) {
    next(err);
  }
};

// Add banner item
export const addBannerItem = async (req, res, next) => {
  try {
    const { type, url, alt, title } = req.body;

    if (!type || !url) {
      return next(createError(400, 'Type and URL are required'));
    }

    let settings = await FrontpageSettings.findOne();
    if (!settings) {
      settings = new FrontpageSettings();
    }

    settings.bannerSection.items.push({ type, url, alt, title });
    await settings.save();

    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
};

// Remove banner item
export const removeBannerItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    let settings = await FrontpageSettings.findOne();
    if (!settings) {
      return next(createError(404, 'Settings not found'));
    }

    settings.bannerSection.items = settings.bannerSection.items.filter(
      (item) => item._id.toString() !== itemId
    );

    await settings.save();
    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
};

// Update banner item
export const updateBannerItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { type, url, alt, title } = req.body;

    let settings = await FrontpageSettings.findOne();
    if (!settings) {
      return next(createError(404, 'Settings not found'));
    }

    const itemIndex = settings.bannerSection.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return next(createError(404, 'Banner item not found'));
    }

    settings.bannerSection.items[itemIndex] = {
      ...settings.bannerSection.items[itemIndex].toObject(),
      type,
      url,
      alt,
      title,
    };

    await settings.save();
    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
};

export const submitHireForm = async (req, res, next) => {
  try {
    const { name, email, role, message } = req.body;

    if (!name || !email || !role) {
      return next(createError(400, 'Name, email, and role are required'));
    }

    console.log('Hire Form Submission:', {
      name,
      email,
      role,
      message: message || 'No message provided',
      timestamp: new Date().toISOString(),
    });

    // Try to send email notification
    try {
      const settings = await Settings.findOne();
      
      if (settings?.emailConfig?.enabled) {
        const transporter = await createTransporter();
        const fromEmail = await getEmailFromSettings();
        
        // Email to admin about the hire form submission
        const adminEmail = settings.emailConfig.username; // Send to the SMTP account email
        
        await transporter.sendMail({
          from: fromEmail,
          to: adminEmail,
          subject: `New Hire Form Submission - ${role}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .field { margin: 15px 0; }
                .label { font-weight: bold; color: #555; }
                .value { margin-top: 5px; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>New Hire Form Submission</h1>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">Name:</div>
                    <div class="value">${name}</div>
                  </div>
                  <div class="field">
                    <div class="label">Email:</div>
                    <div class="value"><a href="mailto:${email}">${email}</a></div>
                  </div>
                  <div class="field">
                    <div class="label">Role:</div>
                    <div class="value">${role}</div>
                  </div>
                  <div class="field">
                    <div class="label">Message:</div>
                    <div class="value">${message || 'No message provided'}</div>
                  </div>
                  <div class="field">
                    <div class="label">Submitted At:</div>
                    <div class="value">${new Date().toLocaleString()}</div>
                  </div>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} MySoov. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        
        console.log('Hire form notification email sent to:', adminEmail);
      } else {
        console.log('Email system not enabled, form data logged only');
      }
    } catch (emailErr) {
      console.error('Failed to send hire form email notification:', emailErr.message);
      // Don't fail the request if email fails
    }

    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (err) {
    next(err);
  }
};
