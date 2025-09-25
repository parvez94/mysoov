/**
 * Resolves image URLs for user avatars and other images
 * @param {string} src - The image source path
 * @param {string} fallback - Fallback image path (default: '/default-user.png')
 * @returns {string} - Resolved image URL
 */
export const resolveImageUrl = (src, fallback = '/default-user.png') => {
  // If no src provided or src is null/undefined/empty, return fallback
  if (!src || src === null || src === undefined || src.trim() === '') {
    return fallback;
  }

  // If it's the default image path (from old database records), use local fallback instead
  if (src === '/default-user.png' || src === 'default-user.png') {
    return fallback;
  }

  // If it's already a full URL, return as is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // If it's a relative path from server, prepend the API URL
  const baseURL = import.meta.env.VITE_API_URL;
  return `${baseURL}${src}`;
};

/**
 * Resolves user avatar image URL
 * @param {Object} user - User object with displayImage property
 * @returns {string} - Resolved avatar URL
 */
export const resolveAvatarUrl = (user) => {
  return resolveImageUrl(user?.displayImage);
};
