export const pricingPlans = {
  free: {
    name: 'Free',
    price: 0,
    totalStorageLimit: 100,
    additionalStorageLimit: 0,
    description: 'Perfect for getting started',
    features: [
      '100MB storage',
      'Basic features',
      'Community support',
    ],
  },
  basic: {
    name: 'Basic',
    price: 10.99,
    totalStorageLimit: 1024,
    additionalStorageLimit: 1024,
    description: 'Great for casual creators',
    features: [
      '1GB additional storage',
      'HD video quality',
      'Priority support',
      'No ads',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19.99,
    totalStorageLimit: 5120,
    additionalStorageLimit: 5120,
    description: 'For professional content creators',
    features: [
      '5GB additional storage',
      '4K video quality',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
    ],
  },
  premium: {
    name: 'Premium',
    price: 29.99,
    totalStorageLimit: 10240,
    additionalStorageLimit: 10240,
    description: 'Ultimate plan for power users',
    features: [
      '10GB additional storage',
      '4K video quality',
      'Advanced analytics',
      'Dedicated support',
      'Custom branding',
      'API access',
    ],
  },
};

export const getTotalStorageLimit = (user) => {
  // Load pricing plans from localStorage if available (set by admin in dashboard)
  let plans = pricingPlans;
  try {
    const savedPlans = localStorage.getItem('pricingPlans');
    if (savedPlans) {
      plans = JSON.parse(savedPlans);
    }
  } catch (err) {
    // Fall back to default plans
  }

  if (!user) {
    return plans.free?.totalStorageLimit || 100;
  }

  if (user.role === 'admin') {
    return Infinity;
  }

  if (user.subscription?.isPaid && user.subscription?.plan) {
    const plan = plans[user.subscription.plan];
    const freeStorage = plans.free?.totalStorageLimit || 100;
    if (plan) {
      return freeStorage + (plan.additionalStorageLimit || 0);
    }
  }

  return plans.free?.totalStorageLimit || 100;
};
