import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Left: Menu Button (Mobile) + Logo */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Menu"
            >
              ☰
            </button>
          )}
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">📚</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-primary-700 dark:text-primary-300">TNGov</h1>
            </div>
          </Link>
        </div>
        
        {/* Right: Controls */}
        <div className="flex gap-2 sm:gap-3 items-center">
          
          {/* Auth Controls */}
          {user ? (
            <>
              <span className="hidden xs:inline text-gray-700 dark:text-gray-300 font-medium text-sm">{user.firstName?.split(' ')[0] || user.name?.split(' ')[0]}</span>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium text-xs sm:text-sm">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;