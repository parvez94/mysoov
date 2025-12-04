import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:5100';

// Configure for large file uploads (500MB+)
axios.defaults.maxBodyLength = Infinity;
axios.defaults.maxContentLength = Infinity;
axios.defaults.timeout = 3600000; // 1 hour

export default axios;
