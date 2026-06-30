export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';

export const STORAGE_KEYS = {
  TOKEN: 'tngov_token',
  USER: 'tngov_user',
  THEME: 'tngov_theme'
};

export const SUBJECTS = ['TNPSC', 'TNUSRB', 'TET', 'TNEB', 'Others'];