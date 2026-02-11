import axios from 'axios';
import API_BASE_URL, { API_ENDPOINTS } from '../config/apiConfig';
import { getToken } from './authService';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor - add auth token
api.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Only redirect to login if NOT already on login/register page or login endpoint
      const isLoginRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || currentPath === '/register';
      
      if (!isLoginRequest && !isAuthPage) {
        // Handle unauthorized - redirect to login only if authenticated user session expired
        sessionStorage.removeItem('tngov_token');
        sessionStorage.removeItem('tngov_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Methods
export const apiClient = {
  // GET request
  get: (endpoint, config = {}) => api.get(endpoint, config),
  
  // POST request
  post: (endpoint, data = {}, config = {}) => api.post(endpoint, data, config),
  
  // PUT request
  put: (endpoint, data = {}, config = {}) => api.put(endpoint, data, config),
  
  // PATCH request
  patch: (endpoint, data = {}, config = {}) => api.patch(endpoint, data, config),
  
  // DELETE request
  delete: (endpoint, config = {}) => api.delete(endpoint, config),
};

export default api;
