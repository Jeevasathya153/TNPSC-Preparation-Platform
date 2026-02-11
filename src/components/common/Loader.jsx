import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Loader = () => {
  const { themeStyles } = useTheme();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] py-8">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 border-4 border-gray-200 dark:border-slate-700 rounded-full"></div>
        <div 
          className="absolute inset-0 border-4 border-primary-600 rounded-full animate-spin"
          style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent' }}
        ></div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
    </div>
  );
};

export default Loader;