import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUser, setUser as saveUser, logout as clearAuth, getToken } from '../services/authService';
import { apiClient } from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return { user: null, login: () => {}, logout: () => {}, updateUser: () => {}, loading: false };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateUser = async () => {
      try {
        const savedUser = getUser();
        const token = getToken();

        if (savedUser && token) {
          const userId = savedUser._id || savedUser.id;

          try {
            const response = await apiClient.get(`/users/${userId}`);
            if (response.data && response.data.id) {
              const normalizedUser = {
                ...response.data,
                id: response.data._id || response.data.id,
                _id: response.data._id || response.data.id
              };
              setUser(normalizedUser);
              saveUser(normalizedUser);
            } else {
              clearAuth();
              setUser(null);
            }
          } catch (error) {
            clearAuth();
            setUser(null);
          }
        }
      } catch (e) {
        clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateUser();
  }, []);

  const login = (userData, token) => {
    try {
      const normalizedUser = {
        ...userData,
        id: userData._id || userData.id,
        _id: userData._id || userData.id
      };
      saveUser(normalizedUser);
      sessionStorage.setItem('tngov_token', token);
      setUser(normalizedUser);
    } catch (e) {
      console.error('Error during login:', e);
    }
  };

  const logout = () => {
    try {
      clearAuth();
      setUser(null);
      window.location.href = '/login';
    } catch (e) {
      console.error('Error during logout:', e);
    }
  };

  const updateUser = (updatedData) => {
    try {
      const newUser = { ...user, ...updatedData };
      saveUser(newUser);
      setUser(newUser);
    } catch (e) {
      console.error('Error updating user:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};