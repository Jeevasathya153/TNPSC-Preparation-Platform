import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUser, setUser as saveUser, logout as clearAuth, getToken } from '../services/authService';
import { apiClient } from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth must be used within AuthProvider');
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
        
        console.log('AuthContext - Validating saved user:', savedUser);
        
        if (savedUser && token) {
          // Validate user exists in database - use _id or id
          const userId = savedUser._id || savedUser.id;
          console.log('AuthContext - Validating userId:', userId);
          
          try {
            const response = await apiClient.get(`/users/${userId}`);
            console.log('AuthContext - User validation response:', response.data);
            if (response.data && response.data.id) {
              // User exists, set normalized user object
              const normalizedUser = {
                ...response.data,
                id: response.data._id || response.data.id,
                _id: response.data._id || response.data.id
              };
              console.log('AuthContext - Setting normalized user:', normalizedUser);
              setUser(normalizedUser);
              saveUser(normalizedUser);
            } else {
              // User not found in database, clear local storage
              console.warn('User not found in database, clearing session');
              clearAuth();
              setUser(null);
            }
          } catch (error) {
            // If user not found in database or error, clear session
            console.error('Error validating user:', error);
            clearAuth();
            setUser(null);
          }
        }
      } catch (e) {
        console.error('Error loading user:', e);
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
      // Normalize user data - map MongoDB _id to id and keep _id
      const normalizedUser = {
        ...userData,
        id: userData._id || userData.id,
        _id: userData._id || userData.id
      };
      console.log('AuthContext - Logging in user:', normalizedUser);
      console.log('AuthContext - User ID:', normalizedUser.id);
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
      // Force reload to clear any cached data
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