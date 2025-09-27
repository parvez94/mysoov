import { useMemo } from 'react';
import { resolveImageUrl } from '../utils/imageUtils';

/**
 * Custom hook to determine if user data is still loading
 * @param {Object} user - User object
 * @param {Object} channel - Channel object (optional)
 * @param {Object} options - Configuration options
 * @returns {Object} - Loading state and resolved data
 */
export const useUserDataLoading = (user, channel = null, options = {}) => {
  const {
    requireAvatar = true,
    requireDisplayName = true,
    requireUsername = true,
    minLoadingTime = 0, // Minimum time to show loading state
  } = options;

  const result = useMemo(() => {
    // Determine which user object to use
    const targetUser = channel || user;

    // If no user object exists, it's loading
    if (!targetUser) {
      return {
        isLoading: true,
        avatarUrl: null,
        displayName: null,
        username: null,
      };
    }

    // Check if required fields are missing
    // Note: We don't check for displayImage because resolveImageUrl handles null/undefined with fallback
    const missingDisplayName =
      requireDisplayName && !targetUser.displayName && !targetUser.username;
    const missingUsername = requireUsername && !targetUser.username;

    const isLoading = missingDisplayName || missingUsername;

    // Resolve the data
    const avatarUrl = resolveImageUrl(targetUser.displayImage);
    const displayName = targetUser.displayName || targetUser.username;
    const username = targetUser.username;

    return {
      isLoading,
      avatarUrl,
      displayName,
      username,
      user: targetUser,
    };
  }, [user, channel, requireAvatar, requireDisplayName, requireUsername]);

  return result;
};

/**
 * Hook specifically for navbar user loading
 */
export const useNavbarUserLoading = (currentUser) => {
  return useUserDataLoading(currentUser, null, {
    requireAvatar: false, // Avatar can be default
    requireDisplayName: false, // Navbar only shows avatar
    requireUsername: false,
  });
};

/**
 * Hook specifically for video card user loading
 */
export const useVideoCardUserLoading = (user, channel) => {
  return useUserDataLoading(user, channel, {
    requireAvatar: false, // Avatar can be default
    requireDisplayName: true,
    requireUsername: true,
  });
};

/**
 * Hook specifically for comment user loading
 */
export const useCommentUserLoading = (channel) => {
  return useUserDataLoading(null, channel, {
    requireAvatar: false, // Avatar can be default
    requireDisplayName: true,
    requireUsername: true,
  });
};
