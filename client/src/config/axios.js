import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:5100';

// Add request interceptor for debugging in development
if (import.meta.env.DEV) {
  axios.interceptors.request.use(
    (config) => {
      console.log(
        '🔵 Axios Request:',
        config.method?.toUpperCase(),
        config.url
      );
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      console.log('🟢 Axios Response:', response.status, response.config.url);
      return response;
    },
    (error) => {
      console.log('🔴 Axios Error:', error.response?.status, error.config?.url);
      return Promise.reject(error);
    }
  );
}

export default axios;
