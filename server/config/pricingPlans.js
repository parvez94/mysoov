export const pricingPlans = {
  "free": {
    "name": "Free",
    "price": 0,
    "totalStorageLimit": 100,
    "description": "Perfect for getting started",
    "features": [
      "100MB total storage",
      "Basic features",
      "Community support"
    ]
  },
  "basic": {
    "name": "Basic",
    "price": 10.99,
    "totalStorageLimit": 1024,
    "description": "Great for casual creators",
    "features": [
      "1GB total storage",
      "HD video quality",
      "Priority support",
      "No ads"
    ]
  },
  "pro": {
    "name": "Pro",
    "price": 19.99,
    "totalStorageLimit": 5120,
    "description": "For professional content creators",
    "features": [
      "5GB total storage",
      "4K video quality",
      "Advanced analytics",
      "Priority support",
      "Custom branding"
    ]
  },
  "premium": {
    "name": "Premium",
    "price": 29.99,
    "totalStorageLimit": 10240,
    "description": "Ultimate plan for power users",
    "features": [
      "10GB total storage",
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

export const getTotalStorageLimit = (user) => {
  if (user.role === 'admin') {
    return 102400;
  }

  if (user.subscription?.isPaid && user.subscription?.plan) {
    return pricingPlans[user.subscription.plan]?.totalStorageLimit || 100;
  }

  return pricingPlans.free?.totalStorageLimit || 100;
};
