import FrontpageSettings from '../models/FrontpageSettings.js';
import { createError } from '../utils/error.js';

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
        accountSection: {
          enabled: true,
          leftText: 'Your Account',
          loginText: 'Login',
          signupText: 'Sign Up',
        },
        happyTeamSection: {
          enabled: true,
          leftText: 'Happy Team',
          buttonText: 'Register',
        },
        bannerSection: {
          enabled: true,
          imageUrl: '',
          alt: 'Banner Image',
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
