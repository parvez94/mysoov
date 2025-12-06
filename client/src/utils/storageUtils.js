import { getTotalStorageLimit } from '../config/pricingPlans';

export const getStorageLimit = (user) => {
  return getTotalStorageLimit(user);
};

export const formatStorageSize = (sizeMB) => {
  if (!isFinite(sizeMB)) {
    return 'Unlimited';
  }
  
  if (sizeMB >= 1024) {
    return `${(sizeMB / 1024).toFixed(2)} GB`;
  }
  return `${sizeMB.toFixed(2)} MB`;
};

export const getStoragePercentage = (used, total) => {
  if (!isFinite(total) || total === 0) return 0;
  return Math.min((used / total) * 100, 100);
};

export const getStorageInfo = (user) => {
  const storageUsed = user?.storageUsed || 0;
  const storageLimit = getStorageLimit(user);
  const isUnlimited = !isFinite(storageLimit);
  const storagePercentage = isUnlimited ? 0 : getStoragePercentage(storageUsed, storageLimit);
  const storageRemaining = isUnlimited ? Infinity : Math.max(storageLimit - storageUsed, 0);

  return {
    used: storageUsed,
    limit: storageLimit,
    remaining: storageRemaining,
    percentage: storagePercentage,
    isUnlimited,
    usedFormatted: formatStorageSize(storageUsed),
    limitFormatted: formatStorageSize(storageLimit),
    remainingFormatted: formatStorageSize(storageRemaining),
  };
};
