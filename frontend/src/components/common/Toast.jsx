import React, { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const Toast = ({ message, type = 'info', onClose }) => {
  const { themeStyles } = useTheme();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const bgColorClasses = {
    error: 'bg-red-600 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
    info: 'bg-primary-600 text-white'
  };
  
  return (
    <div 
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-lg shadow-2xl animate-fade-in ${bgColorClasses[type] || bgColorClasses.info}`}
      style={{ zIndex: 9999 }}
    >
      <p className="text-sm font-medium text-center">{message}</p>
    </div>
  );
};

export default Toast;