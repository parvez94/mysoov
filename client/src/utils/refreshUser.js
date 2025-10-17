import axios from 'axios';

/**
 * Refresh the current user's data from the server
 * This is useful when user data changes (like role updates)
 * without requiring a full logout/login cycle
 */
export const refreshUserData = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/users/find/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
