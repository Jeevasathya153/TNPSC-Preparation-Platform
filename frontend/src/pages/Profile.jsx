import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getToken } from '../services/authService';

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [achievements, setAchievements] = useState([]);
  
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    targetExam: '',
    studyHours: ''
  });

  useEffect(() => {
    if (!user || !user.id) {
      navigate('/login');
      return;
    }
    fetchUserData();
    fetchAchievements();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      const token = getToken();
      const userId = user?.id || token?.split('_')[1];
      
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      const response = await apiClient.get(`/users/${userId}`);
      const userData = response.data;
      
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        targetExam: userData.targetExam || '',
        studyHours: userData.studyHours || ''
      });
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchAchievements = async () => {
    setLoading(false);
    try {
      const token = getToken();
      const userId = user?.id || token?.split('_')[1];
      
      if (!userId) {
        setAchievements([]);
        return;
      }
      
      const response = await apiClient.get(`/users/achievements/${userId}`);
      const achievementsData = Array.isArray(response.data) ? response.data : [];
      
      // If user has unlocked achievements, show them
      if (achievementsData.length > 0) {
        setAchievements(achievementsData);
      } else {
        // Show message that no achievements are unlocked yet
        setAchievements([]);
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setAchievements([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = getToken();
      const userId = user?.id || token?.split('_')[1];
      
      await apiClient.put(`/users/${userId}`, formData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 pt-16 pb-20 md:pb-8 overflow-y-auto">
        <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">My Profile 👤</h1>

          {/* Tabs */}
          <div className="flex gap-2 sm:gap-4 mb-6 border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold transition text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'profile' 
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold transition text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'achievements' 
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold transition text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'settings' 
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Settings
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-6 py-2 rounded-lg transition text-sm sm:text-base"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  { label: 'First Name', name: 'firstName' },
                  { label: 'Last Name', name: 'lastName' },
                  { label: 'Email', name: 'email', type: 'email' },
                  { label: 'Phone', name: 'phone' },
                  { label: 'Date of Birth', name: 'dateOfBirth', type: 'date' },
                  { label: 'Gender', name: 'gender' },
                  { label: 'City', name: 'city' },
                  { label: 'State', name: 'state' },
                  { label: 'Target Exam', name: 'targetExam', colSpan: 2 }
                ].map(field => (
                  <div key={field.name} className={field.colSpan ? 'sm:col-span-2' : ''}>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                      {field.label}
                    </label>
                    {isEditing ? (
                      <input
                        type={field.type || 'text'}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded px-3 sm:px-4 py-2 focus:border-primary-500 dark:focus:border-primary-400 outline-none text-sm sm:text-base"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white text-sm sm:text-base">{formData[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <button
                  onClick={handleSaveProfile}
                  className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg transition w-full text-sm sm:text-base"
                >
                  Save Changes
                </button>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            loading ? (
              <Loader />
            ) : (
              <div>
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {achievements.map(achievement => (
                      <div key={achievement.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md transition p-4 sm:p-6">
                        <div className="text-4xl sm:text-5xl mb-3">{achievement.icon}</div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">{achievement.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                        {achievement.unlocked && (
                          <div className="mt-3 inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                            ✓ Unlocked
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="col-span-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-gray-200 dark:border-slate-700 p-8 sm:p-12 text-center">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">No Achievements Yet</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                      Complete quizzes to unlock achievements and show your progress!
                    </p>
                    <button 
                      onClick={() => navigate('/subjects')}
                      className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Start Learning
                    </button>
                  </div>
                )}
              </div>
            )
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Theme Settings */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Theme</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                      theme === 'dark' 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900' 
                        : 'bg-slate-700 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                  </button>
                </div>
              </div>

              {/* Logout */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Account Actions</h2>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
