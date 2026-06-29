import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../services/authService';

const Notifications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      
      if (!token || !user) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const userId = user.id || token.split('_')[1];
      
      if (!userId) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const response = await apiClient.get(`/notifications/user/${userId}`);
      const notificationsData = Array.isArray(response.data) ? response.data : [];
      
      // Transform notifications with proper dates
      const transformedNotifications = notificationsData.map(notif => ({
        ...notif,
        id: notif._id || notif.id,
        read: notif.read || notif.isRead || false,
        icon: notif.icon || '📢',
        date: notif.createdAt ? new Date(notif.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }) : new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })
      }));
      
      setNotifications(transformedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      // Only show error if it's a real server error, not empty data
      if (err.response && err.response.status !== 404) {
        setError('Unable to connect to server. Please try again later.');
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = getToken();
      const userId = user?.id || token?.split('_')[1];
      
      if (userId) {
        await apiClient.put(`/notifications/user/${userId}/read-all`);
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 pt-16 pb-20 md:pb-8 overflow-y-auto">
        <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Notifications 🔔</h1>
              {!loading && !error && (
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              )}
            </div>
            {!loading && !error && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-6 py-2 rounded-lg transition text-sm sm:text-base whitespace-nowrap"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <Loader />
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 sm:p-6 rounded-lg border transition cursor-pointer ${
                    notif.read
                      ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:shadow-sm'
                      : 'bg-blue-50 dark:bg-slate-800/80 border-blue-300 dark:border-blue-700 hover:shadow-md ring-1 ring-blue-300 dark:ring-blue-700/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="text-2xl sm:text-3xl flex-shrink-0">{notif.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">{notif.title}</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base">{notif.message}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {notif.date} at {notif.time}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition text-lg flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Notifications;
