import { STORAGE_KEYS } from '../config/constants';

export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
};

export const getItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error('Error reading from localStorage', e);
    return null;
  }
};

export const removeItem = (key) => localStorage.removeItem(key);

// Theme specific
export const getTheme = () => {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return theme || 'light';
  } catch (e) {
    console.error('Error reading theme:', e);
    return 'light';
  }
};
export const setTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.error('Error saving theme:', e);
  }
};

// Language specific
export const getLanguage = () => {
  try {
    const lang = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return lang || 'EN';
  } catch (e) {
    console.error('Error reading language:', e);
    return 'EN';
  }
};
export const setLanguage = (lang) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch (e) {
    console.error('Error saving language:', e);
  }
};