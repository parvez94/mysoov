export const pricingPlans = {
  "free": {
    "name": "Free",
    "price": 0,
    "maxUploadSize": 8,
    "description": "Perfect for getting started",
    "features": [
      "8MB upload limit",
      "Basic features",
      "Community support"
    ]
  },
  "basic": {
    "name": "Basic",
    "price": 10.99,
    "maxUploadSize": 50,
    "description": "Great for casual creators",
    "features": [
      "50MB upload limit",
      "HD video quality",
      "Priority support",
      "No ads"
    ]
  },
  "pro": {
    "name": "Pro",
    "price": 19.99,
    "maxUploadSize": 200,
    "description": "For professional content creators",
    "features": [
      "200MB upload limit",
      "4K video quality",
      "Advanced analytics",
      "Priority support",
      "Custom branding"
    ]
  },
  "premium": {
    "name": "Premium",
    "price": 29.99,
    "maxUploadSize": 500,
    "description": "Ultimate plan for power users",
    "features": [
      "500MB upload limit",
      "4K video quality",
      "Advanced analytics",
      "Dedicated support",
      "Custom branding",
      "API access"
    ]
  }
};

// Additional pricing configuration
export const pricingConfig = {
  "recommendedPlan": "pro",
  "footerText": "All plans include a 7-day free trial. Cancel anytime.",
  "paymentEnabled": false,
  "supportEmail": "support@mysoov.com",
  "comingSoonMessage": "🚀 Payment Integration Coming Soon!",
  "comingSoonDescription": "We're currently setting up secure payment processing. In the meantime, please contact our support team to upgrade your account manually.",
  "upgradeInstructions": "Include your username and desired plan in your message, and we'll upgrade your account within 24 hours."
};

export const getMaxUploadSize = (user) => {
  // Admin gets unlimited (500MB as practical limit)
  if (user.role === 'admin') {
    return 500;
  }

  // Paid users get their plan's limit
  if (user.subscription?.isPaid && user.subscription?.plan) {
    return pricingPlans[user.subscription.plan]?.maxUploadSize || 5;
  }

  // Free users get 5MB
  return pricingPlans.free?.maxUploadSize || 5;
};
