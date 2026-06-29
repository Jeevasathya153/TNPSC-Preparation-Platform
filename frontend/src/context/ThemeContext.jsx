import React, { createContext, useState, useContext, useEffect } from 'react';
import { getTheme, setTheme as saveTheme } from '../services/storageService';
import { lightTheme, darkTheme } from '../config/themes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { 
      theme: 'light', 
      toggleTheme: () => {}, 
      themeStyles: lightTheme 
    };
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Load theme on mount and apply to document
  useEffect(() => {
    try {
      const savedTheme = getTheme();
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } catch (e) {
      console.error('Error loading theme:', e);
      setTheme('light');
      applyTheme('light');
    }
  }, []);

  // Apply theme to document whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (themeValue) => {
    const htmlElement = document.documentElement;
    if (themeValue === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      saveTheme(newTheme);
    } catch (e) {
      console.error('Error saving theme:', e);
    }
  };

  const themeStyles = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeStyles }}>
      {children}
    </ThemeContext.Provider>
  );
};