import { STORAGE_KEYS } from '../config/constants';

// Use sessionStorage instead of localStorage to clear on browser close
export const setToken = (token) => sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
export const getToken = () => sessionStorage.getItem(STORAGE_KEYS.TOKEN);
export const removeToken = () => sessionStorage.removeItem(STORAGE_KEYS.TOKEN);

export const setUser = (user) => sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
export const getUser = () => {
  const user = sessionStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};
export const removeUser = () => sessionStorage.removeItem(STORAGE_KEYS.USER);

export const logout = () => {
  removeToken();
  removeUser();
};

export const isAuthenticated = () => {
  return !!getToken() && !!getUser();
};