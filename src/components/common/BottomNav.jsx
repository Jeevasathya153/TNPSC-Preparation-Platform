import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const BottomNav = () => {
  const { t } = useLanguage();
  
  const menuItems = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/books', label: 'Books', icon: '📚' },
    { path: '/practice-test', label: 'Tests', icon: '📝' },
    { path: '/my-progress', label: 'My Progress', icon: '📈' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 md:hidden">
      <div className="flex justify-around">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-all
              ${isActive 
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }
            `}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
