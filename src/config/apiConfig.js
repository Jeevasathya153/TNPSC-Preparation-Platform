// API Configuration for Backend Integration
// This will connect to Java/MongoDB backend

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },

  // User endpoints
  user: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    settings: '/users/settings',
  },

  // Subjects endpoints
  subjects: {
    list: '/subjects',
    getById: (id) => `/subjects/${id}`,
    lessons: (subjectId) => `/subjects/${subjectId}/lessons`,
  },

  // Quiz endpoints
  quiz: {
    list: '/quizzes',
    getById: (id) => `/quizzes/${id}`,
    submit: '/quizzes/submit',
    history: '/quizzes/history',
  },

  // Practice Test endpoints
  practiceTest: {
    list: '/practice-tests',
    getById: (id) => `/practice-tests/${id}`,
    submit: '/practice-tests/submit',
  },

  // Results endpoints
  results: {
    list: '/results',
    getById: (id) => `/results/${id}`,
    analytics: '/results/analytics',
  },

  // Notifications endpoints
  notifications: {
    list: '/notifications',
    markRead: (id) => `/notifications/${id}/read`,
    delete: (id) => `/notifications/${id}`,
  },
};

export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

export default API_BASE_URL;
