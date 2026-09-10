import axios from 'axios';

/**
 * Base URL configured via VITE_API_URL environment variable.
 * Defaults to http://localhost:8000/api if not explicitly provided.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Pre-configured Axios instance for NoteDrop backend API communication.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor for logging or adding custom headers
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for unified, consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const formattedError = {
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'An unexpected network or server error occurred.',
      status: error.response?.status || 500,
      code: error.response?.data?.code || error.code || 'API_ERROR',
      requiresPassword: Boolean(error.response?.data?.requiresPassword),
      data: error.response?.data || null,
      isNetworkError: !error.response,
    };
    return Promise.reject(formattedError);
  }
);

export const api = apiClient;
export default apiClient;
