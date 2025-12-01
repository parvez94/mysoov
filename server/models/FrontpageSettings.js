import mongoose from 'mongoose';

const FrontpageSettingsSchema = new mongoose.Schema(
  {
    // Section 1: Slider
    slider: {
      enabled: {
        type: Boolean,
        default: true,
      },
      items: [
        {
          type: {
            type: String,
            enum: ['image', 'video'],
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
          alt: String,
          title: String,
        },
      ],
    },

    // Section 2: Happy Views with steps and code input
    happyViewsSection: {
      enabled: {
        type: Boolean,
        default: true,
      },
      backgroundColor: {
        type: String,
        default: '#FF8C00', // Deep orange
      },
      textColor: {
        type: String,
        default: '#ffffff',
      },
      headingColor: {
        type: String,
        default: '#ffffff',
      },
      headingStrokeColor: {
        type: String,
        default: '',
      },
      headingStrokeWidth: {
        type: Number,
        default: 0,
      },
      heading: {
        type: String,
        default: 'Happy Views',
      },
      icon: {
        type: String,
        default: '',
      },
      description: {
        type: String,
        default: '',
      },
      textAlign: {
        type: String,
        enum: ['left', 'center', 'right'],
        default: 'center',
      },
      codeInput: {
        label: {
          type: String,
          default: 'Enter your code',
        },
        placeholder: {
          type: String,
          default: 'Enter code here...',
        },
      },
      buttonBackgroundColor: {
        type: String,
        default: '',
      },
      buttonTextColor: {
        type: String,
        default: '',
      },
    },

    // Section 4: Banner slider
    bannerSection: {
      enabled: {
        type: Boolean,
        default: true,
      },
      items: [
        {
          type: {
            type: String,
            enum: ['image', 'video'],
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
          alt: String,
          title: String,
        },
      ],
    },

    // Section 5: Happy Team section
    happyTeamSection: {
      enabled: {
        type: Boolean,
        default: true,
      },
      backgroundColor: {
        type: String,
        default: '#0f0f0f',
      },
      textColor: {
        type: String,
        default: '#ffffff',
      },
      headingColor: {
        type: String,
        default: '#ffffff',
      },
      headingStrokeColor: {
        type: String,
        default: '',
      },
      headingStrokeWidth: {
        type: Number,
        default: 0,
      },
      leftText: {
        type: String,
        default: 'Happy Team',
      },
      icon: {
        type: String,
        default: '',
      },
      description: {
        type: String,
        default: '',
      },
      textAlign: {
        type: String,
        enum: ['left', 'center', 'right'],
        default: 'center',
      },
      loginText: {
        type: String,
        default: 'Login',
      },
      loginButtonBackgroundColor: {
        type: String,
        default: '',
      },
      loginButtonTextColor: {
        type: String,
        default: '',
      },
      signupText: {
        type: String,
        default: 'Signup',
      },
      signupButtonBackgroundColor: {
        type: String,
        default: '',
      },
      signupButtonTextColor: {
        type: String,
        default: '',
      },
    },

    // Footer section
    footerSection: {
      enabled: {
        type: Boolean,
        default: true,
      },
      backgroundColor: {
        type: String,
        default: '#1a1a1a',
      },
      textColor: {
        type: String,
        default: '#ffffff',
      },
      siteName: {
        type: String,
        default: 'Company Name',
      },
      siteNameColor: {
        type: String,
        default: '',
      },
      description: {
        type: String,
        default: '',
      },
      descriptionColor: {
        type: String,
        default: '',
      },
      phone: {
        type: String,
        default: '',
      },
      email: {
        type: String,
        default: '',
      },
      location: {
        type: String,
        default: '',
      },
      contactTextColor: {
        type: String,
        default: '',
      },
      contactIconColor: {
        type: String,
        default: '',
      },
      formTitle: {
        type: String,
        default: 'Hire Us',
      },
      formTitleColor: {
        type: String,
        default: '',
      },
      formBackgroundColor: {
        type: String,
        default: '',
      },
      formBorderColor: {
        type: String,
        default: '',
      },
      formInputBackgroundColor: {
        type: String,
        default: '',
      },
      formInputTextColor: {
        type: String,
        default: '',
      },
      formInputBorderColor: {
        type: String,
        default: '',
      },
      formInputFocusColor: {
        type: String,
        default: '',
      },
      formInputPlaceholderColor: {
        type: String,
        default: '',
      },
      formButtonText: {
        type: String,
        default: 'Submit',
      },
      formButtonBackgroundColor: {
        type: String,
        default: '',
      },
      formButtonTextColor: {
        type: String,
        default: '',
      },
      roles: {
        type: [String],
        default: ['Developer', 'Designer', 'Manager', 'Other'],
      },
      copyrightText: {
        type: String,
        default: '',
      },
      copyrightTextColor: {
        type: String,
        default: '',
      },
      copyrightBorderColor: {
        type: String,
        default: '',
      },
    },

    // There should only be one frontpage settings document
    singleton: {
      type: Boolean,
      default: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one frontpage settings document exists
FrontpageSettingsSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    if (count > 0) {
      const error = new Error('FrontpageSettings document already exists');
      return next(error);
    }
  }
  next();
});

export default mongoose.model('FrontpageSettings', FrontpageSettingsSchema);
