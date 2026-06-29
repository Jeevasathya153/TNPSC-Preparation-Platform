import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/subjects', label: 'Subjects', icon: '📚' },
    { path: '/books', label: 'Books', icon: '📗' },
    { path: '/offline-books', label: 'Offline Books', icon: '📥' },
    { path: '/practice-test', label: 'Tests', icon: '📝' },
    { path: '/my-progress', label: 'Progress', icon: '📈' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];
  
  const { user } = useAuth();

  // Desktop Sidebar (hidden on mobile)
  const desktopSidebar = (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shadow-sm fixed left-0 top-16 bottom-0">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">{(user?.firstName || 'U').charAt(0)}</div>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.firstName || 'Guest User'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</div>
          </div>
        </div>
      </div>
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
              ${isActive 
                ? 'bg-gradient-primary text-white shadow-md' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
              }
            `}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );

  // Mobile Drawer Sidebar
  const mobileSidebar = isOpen && (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      ></div>
      
      {/* Drawer */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-800 shadow-lg z-50 md:hidden overflow-y-auto pt-20">
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                ${isActive 
                  ? 'bg-gradient-primary text-white shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
};

export default Sidebar;