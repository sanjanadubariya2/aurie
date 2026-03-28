import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    console.log(`📤 [API] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ [API] Request error:", error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log(`📥 [API] Response ${response.status}:`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(`❌ [API] Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error("❌ [API] No response from server:", error.message);
      console.error("❌ [API] Is backend running on http://127.0.0.1:5000?");
    } else {
      // Error in request setup
      console.error("❌ [API] Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);
