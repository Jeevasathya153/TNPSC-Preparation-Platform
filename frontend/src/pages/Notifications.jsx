import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../services/authService';

const CATEGORIES = [
  { id: 'all', label: 'All Announcements', icon: '🏛️' },
  { id: 'Group IV', label: 'Group IV', icon: '📘' },
  { id: 'Group II / IIA', label: 'Group II / IIA', icon: '📗' },
  { id: 'Group I', label: 'Group I', icon: '🎓' },
  { id: 'Technical Services', label: 'Technical Services', icon: '⚙️' },
  { id: 'Hall Ticket', label: 'Hall Tickets', icon: '🎟️' },
  { id: 'Results', label: 'Results', icon: '🏆' },
  { id: 'Press Release', label: 'Press Releases', icon: '📰' },
  { id: 'Certificate Verification', label: 'Cert. Verification', icon: '📜' },
];

const STATUS_OPTIONS = [
  { id: 'all', label: 'All Statuses' },
  { id: 'Application Open', label: 'Application Open' },
  { id: 'Upcoming', label: 'Upcoming' },
  { id: 'Hall Ticket Released', label: 'Hall Ticket Released' },
  { id: 'Examination Scheduled', label: 'Examination Scheduled' },
  { id: 'Results Published', label: 'Results Published' },
  { id: 'Application Closed', label: 'Application Closed' },
];

const Notifications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('official'); // 'official' or 'personal'

  // Official TNPSC Notifications State
  const [officialNotifs, setOfficialNotifs] = useState([]);
  const [loadingOfficial, setLoadingOfficial] = useState(true);
  const [officialError, setOfficialError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'closing_soon'
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [selectedDetailsNotif, setSelectedDetailsNotif] = useState(null);

  // User Personal Alerts State
  const [personalNotifs, setPersonalNotifs] = useState([]);
  const [loadingPersonal, setLoadingPersonal] = useState(false);
  const [personalError, setPersonalError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchOfficialNotifications();
    fetchSyncStatus();
  }, []);

  useEffect(() => {
    if (activeTab === 'personal') {
      fetchPersonalNotifications();
    }
  }, [activeTab, user]);

  const fetchSyncStatus = async () => {
    try {
      const res = await apiClient.get('/notifications/sync-status');
      setSyncStatus(res.data);
    } catch (err) {
      console.warn('Could not fetch sync status', err);
    }
  };

  const fetchOfficialNotifications = async () => {
    try {
      setLoadingOfficial(true);
      setOfficialError(null);
      const res = await apiClient.get('/notifications/official');
      const data = Array.isArray(res.data) ? res.data : [];
      setOfficialNotifs(data);
    } catch (err) {
      console.error('Error fetching official notifications:', err);
      setOfficialError('Unable to load official TNPSC announcements. Please try again.');
    } finally {
      setLoadingOfficial(false);
    }
  };

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      await apiClient.post('/notifications/sync');
      await fetchOfficialNotifications();
      await fetchSyncStatus();
    } catch (err) {
      console.error('Error during sync:', err);
    } finally {
      setSyncing(false);
    }
  };

  const fetchPersonalNotifications = async () => {
    try {
      setLoadingPersonal(true);
      setPersonalError(null);
      const token = getToken();
      if (!token || !user) {
        setPersonalNotifs([]);
        return;
      }
      const userId = user.id || token.split('_')[1];
      if (!userId) {
        setPersonalNotifs([]);
        return;
      }

      const res = await apiClient.get(`/notifications/user/${userId}`);
      const list = Array.isArray(res.data) ? res.data : [];
      const transformed = list.map(item => ({
        ...item,
        id: item._id || item.id,
        read: item.read || false,
        icon: item.icon || '🔔',
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
        time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
      }));
      setPersonalNotifs(transformed);
    } catch (err) {
      console.error('Error fetching personal notifications:', err);
      setPersonalError('Unable to load user activity alerts.');
    } finally {
      setLoadingPersonal(false);
    }
  };

  const markPersonalAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setPersonalNotifs(personalNotifs.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllPersonalAsRead = async () => {
    try {
      const token = getToken();
      const userId = user?.id || token?.split('_')[1];
      if (userId) {
        await apiClient.put(`/notifications/user/${userId}/read-all`);
        setPersonalNotifs(personalNotifs.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deletePersonalNotif = async (id) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      setPersonalNotifs(personalNotifs.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Filtered & Sorted Official Notifications
  const filteredOfficialNotifs = useMemo(() => {
    return officialNotifs.filter(notif => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = notif.title && notif.title.toLowerCase().includes(q);
        const matchesNumber = notif.notificationNumber && notif.notificationNumber.toLowerCase().includes(q);
        const matchesDesc = notif.description && notif.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNumber && !matchesDesc) return false;
      }
      // Category
      if (selectedCategory !== 'all') {
        const cat = notif.category || '';
        if (!cat.toLowerCase().includes(selectedCategory.toLowerCase())) return false;
      }
      // Status
      if (selectedStatus !== 'all') {
        const st = (notif.status || '').toLowerCase().replace(/\s+/g, '');
        const target = selectedStatus.toLowerCase().replace(/\s+/g, '');
        if (!st.includes(target)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'oldest') {
        return (a.publishedDate || '').localeCompare(b.publishedDate || '');
      }
      if (sortBy === 'closing_soon') {
        return (a.applicationEndDate || '9999').localeCompare(b.applicationEndDate || '9999');
      }
      // default: newest
      return (b.publishedDate || '').localeCompare(a.publishedDate || '');
    });
  }, [officialNotifs, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Top latest announcements for highlight banner
  const latestHighlightNotifs = useMemo(() => {
    return officialNotifs
      .filter(n => n.isNew || n.status === 'Application Open' || n.status === 'Hall Ticket Released')
      .slice(0, 2);
  }, [officialNotifs]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Application Open':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Application Open
          </span>
        );
      case 'Hall Ticket Released':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
            🎟️ Hall Ticket Released
          </span>
        );
      case 'Results Published':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            🏆 Results Published
          </span>
        );
      case 'Examination Scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
            📅 Examination Scheduled
          </span>
        );
      case 'Upcoming':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
            ⏳ Upcoming
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
            Application Closed
          </span>
        );
    }
  };

  const unreadPersonalCount = personalNotifs.filter(n => !n.read).length;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 md:ml-64 pt-16 pb-20 md:pb-8 overflow-y-auto">
        <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">

          {/* Top Title & Tab Switcher */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  TNPSC Notifications
                </h1>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                  Live
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                Real-time official announcements from Tamil Nadu Public Service Commission
              </p>
            </div>

            {/* Official Source Link & Sync Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://www.tnpsc.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition shadow-sm"
              >
                <span>🏛️ Official Portal</span>
                <span className="text-xs">↗</span>
              </a>

              <button
                onClick={handleManualSync}
                disabled={syncing}
                title="Sync latest notifications from TNPSC website"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white transition disabled:opacity-50 shadow-sm"
              >
                <span className={syncing ? 'animate-spin' : ''}>🔄</span>
                <span>{syncing ? 'Syncing...' : 'Sync Feed'}</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-slate-700 mb-6">
            <button
              onClick={() => setActiveTab('official')}
              className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition ${
                activeTab === 'official'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <span>🏛️ Official Announcements</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300">
                {officialNotifs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition ${
                activeTab === 'personal'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <span>🔔 My Personal Alerts</span>
              {unreadPersonalCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                  {unreadPersonalCount}
                </span>
              )}
            </button>
          </div>

          {/* ==================================================== */}
          {/* TAB 1: OFFICIAL TNPSC ANNOUNCEMENTS */}
          {/* ==================================================== */}
          {activeTab === 'official' && (
            <div>
              {/* Highlight / Latest Announcements Section */}
              {latestHighlightNotifs.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                      Latest Breaking TNPSC Notifications
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {latestHighlightNotifs.map((notif, idx) => (
                      <div
                        key={notif.id || idx}
                        className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/40 border border-blue-200 dark:border-indigo-800/50 shadow-sm relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-600 text-white animate-pulse">
                            NEW
                          </span>
                          {getStatusBadge(notif.status)}
                        </div>

                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {notif.title}
                        </h3>

                        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                          {notif.notificationNumber && (
                            <p><strong>Notification No:</strong> {notif.notificationNumber}</p>
                          )}
                          {notif.applicationEndDate && (
                            <p><strong>Last Date to Apply:</strong> <span className="text-red-600 dark:text-red-400 font-semibold">{notif.applicationEndDate}</span></p>
                          )}
                          {notif.examinationDate && notif.examinationDate !== 'To be announced' && (
                            <p><strong>Exam Date:</strong> {notif.examinationDate}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-200/60 dark:border-indigo-800/30">
                          {notif.officialPdfUrl && (
                            <a
                              href={notif.officialPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition inline-flex items-center gap-1"
                            >
                              <span>📄 Official PDF</span>
                            </a>
                          )}
                          {notif.officialNotificationUrl && (
                            <a
                              href={notif.officialNotificationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 border border-blue-300 dark:border-slate-600 transition inline-flex items-center gap-1"
                            >
                              <span>Apply / Portal ↗</span>
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedDetailsNotif(notif)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-slate-700 transition"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filters & Search Controls */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
                {/* Search Bar & Sort */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="Search by exam name or notification number (e.g. Group 4, 11/2026)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
                  >
                    {STATUS_OPTIONS.map(st => (
                      <option key={st.id} value={st.id}>{st.label}</option>
                    ))}
                  </select>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="closing_soon">Sort: Application Deadline</option>
                  </select>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                        selectedCategory === cat.id
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-slate-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed Sync Info Banner */}
              {syncStatus && syncStatus.syncTime && (
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Official TNPSC source connected ({officialNotifs.length} verified announcements)</span>
                  </div>
                  <div>
                    Last checked: {new Date(syncStatus.syncTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              )}

              {/* Notifications List */}
              {loadingOfficial ? (
                <Loader />
              ) : officialError ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
                  <p className="text-red-600 dark:text-red-400 font-medium mb-3">{officialError}</p>
                  <button
                    onClick={fetchOfficialNotifications}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : filteredOfficialNotifs.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
                  <span className="text-4xl mb-3 block">📭</span>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                    No announcements found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    No notifications match your current filter criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedStatus('all');
                    }}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOfficialNotifs.map((notif) => (
                    <div
                      key={notif.id}
                      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition"
                    >
                      {/* Top Meta: Number, Category, Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {notif.notificationNumber && (
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600">
                              № {notif.notificationNumber}
                            </span>
                          )}
                          {notif.isNew && (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">
                              NEW
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {notif.category || 'Recruitment'}
                          </span>
                        </div>

                        <div>{getStatusBadge(notif.status)}</div>
                      </div>

                      {/* Title */}
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                        {notif.title}
                      </h2>

                      {/* Dates Summary Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg text-xs mb-4 border border-gray-100 dark:border-slate-800">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block font-medium">Published Date</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {notif.publishedDate || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block font-medium">Application Window</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {notif.applicationStartDate ? `${notif.applicationStartDate} → ${notif.applicationEndDate || 'Open'}` : 'See Notification'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block font-medium">Exam Date</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {notif.examinationDate || 'Will be announced'}
                          </span>
                        </div>
                      </div>

                      {/* Source attribution & Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-slate-700/60">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <span>🏛️</span>
                          <span>Source: {notif.sourceName || 'TNPSC Official'}</span>
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setSelectedDetailsNotif(notif)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 transition"
                          >
                            View Details
                          </button>

                          {notif.officialPdfUrl && (
                            <a
                              href={notif.officialPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white transition inline-flex items-center gap-1 shadow-sm"
                            >
                              <span>📄 Official PDF</span>
                            </a>
                          )}

                          {notif.officialPdfUrlTamil && (
                            <a
                              href={notif.officialPdfUrlTamil}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 dark:bg-slate-700 hover:bg-primary-100 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-slate-600 transition inline-flex items-center gap-1"
                            >
                              <span>தமிழ் PDF</span>
                            </a>
                          )}

                          {notif.officialNotificationUrl && (
                            <a
                              href={notif.officialNotificationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition inline-flex items-center gap-1 shadow-sm"
                            >
                              <span>Apply / Portal ↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: MY PERSONAL ALERTS */}
          {/* ==================================================== */}
          {activeTab === 'personal' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadPersonalCount > 0
                    ? `${unreadPersonalCount} unread alert${unreadPersonalCount !== 1 ? 's' : ''}`
                    : 'All caught up with personal alerts!'}
                </p>
                {unreadPersonalCount > 0 && (
                  <button
                    onClick={markAllPersonalAsRead}
                    className="text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {loadingPersonal ? (
                <Loader />
              ) : personalError ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center text-red-600 dark:text-red-400">
                  {personalError}
                </div>
              ) : personalNotifs.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
                  <span className="text-4xl mb-2 block">🔔</span>
                  <p className="text-gray-500 dark:text-gray-400">No personal alerts yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {personalNotifs.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markPersonalAsRead(notif.id)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                        notif.read
                          ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                          : 'bg-blue-50/70 dark:bg-slate-800/90 border-blue-300 dark:border-blue-700 ring-1 ring-blue-300/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{notif.icon}</span>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                            {notif.title}
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mt-0.5">
                            {notif.message}
                          </p>
                          <span className="text-[11px] text-gray-400 mt-1 block">
                            {notif.date} {notif.time}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePersonalNotif(notif.id);
                        }}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Details Modal */}
      {selectedDetailsNotif && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedDetailsNotif(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-700 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {selectedDetailsNotif.notificationNumber && (
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-200 dark:bg-slate-700">
                      № {selectedDetailsNotif.notificationNumber}
                    </span>
                  )}
                  {getStatusBadge(selectedDetailsNotif.status)}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedDetailsNotif.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetailsNotif(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl space-y-2 border border-gray-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Category:</span>
                  <span className="font-bold">{selectedDetailsNotif.category || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Published Date:</span>
                  <span className="font-semibold">{selectedDetailsNotif.publishedDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Application Start Date:</span>
                  <span className="font-semibold">{selectedDetailsNotif.applicationStartDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Application End Date:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{selectedDetailsNotif.applicationEndDate || 'N/A'}</span>
                </div>
                {selectedDetailsNotif.paymentLastDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Payment Last Date:</span>
                    <span className="font-semibold">{selectedDetailsNotif.paymentLastDate}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Examination Date:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedDetailsNotif.examinationDate || 'Will be announced'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Official Source:</span>
                  <span className="font-semibold">{selectedDetailsNotif.sourceName || 'TNPSC Official'}</span>
                </div>
              </div>

              {selectedDetailsNotif.description && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-1">Description / Summary</h4>
                  <p className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg text-xs leading-relaxed border border-gray-200 dark:border-slate-700">
                    {selectedDetailsNotif.description}
                  </p>
                </div>
              )}

              {/* Verified Domain Badge */}
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                <span>🛡️</span>
                <span>Verified official announcement originating from authentic Tamil Nadu Public Service Commission domain.</span>
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedDetailsNotif.officialPdfUrl && (
                  <a
                    href={selectedDetailsNotif.officialPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition shadow-sm"
                  >
                    Download Official PDF (English)
                  </a>
                )}
                {selectedDetailsNotif.officialPdfUrlTamil && (
                  <a
                    href={selectedDetailsNotif.officialPdfUrlTamil}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 px-4 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition"
                  >
                    Download PDF (தமிழ்)
                  </a>
                )}
                {selectedDetailsNotif.officialNotificationUrl && (
                  <a
                    href={selectedDetailsNotif.officialNotificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition shadow-sm"
                  >
                    Open Official Portal ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Notifications;
