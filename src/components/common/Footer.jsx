import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
  const { themeStyles } = useTheme();
  
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">TNGov Exam</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Excellence in government exam preparation with comprehensive study materials and practice tests.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          {/* Tech Stack */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-3">Tech Stack</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              React • Java Spring Boot • MongoDB
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} TNGov Exam Preparation Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;