import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../services/authService';

const Results = () => {
  const location = useLocation();
  const [filterType, setFilterType] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchResults();
  }, [user]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      console.log('fetchResults - Current user:', user);
      
      if (!token || !user) {
        console.error('No token or user found');
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Get userId from user object (_id or id)
      const userId = user._id || user.id;
      
      console.log('fetchResults - Fetching results for userId:', userId);
      console.log('fetchResults - User ID type:', typeof userId);
      
      const response = await apiClient.get(`/results/user/${userId}`);
      console.log('fetchResults - API response:', response.data);
      const resultsData = Array.isArray(response.data) ? response.data : response.data.results || [];
      console.log('fetchResults - Processed results count:', resultsData.length);
      
      // Transform results with status based on score
      const transformedResults = resultsData.map(result => ({
        ...result,
        type: result.quizTitle?.includes('Test') ? 'test' : 'quiz',
        status: getStatusByScore((result.score / result.totalMarks) * 100),
        date: new Date(result.createdAt || Date.now()).toISOString().split('T')[0]
      }));
      
      setResults(transformedResults);
      setError(null);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusByScore = (percentage) => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'fair';
    return 'poor';
  };

  const getStatusEmoji = (status) => {
    switch(status) {
      case 'excellent': return '🌟';
      case 'good': return '👍';
      case 'fair': return '👌';
      default: return '📊';
    }
  };

  const filteredResults = filterType === 'all' 
    ? results 
    : results.filter(r => r.type === filterType);

  const averageScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.score / r.totalMarks) * 100, 0) / results.length)
    : 0;

  const excellentCount = results.filter(r => r.status === 'excellent').length;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 pt-16 pb-20 md:pb-8 overflow-y-auto">
        <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">My Results 📊</h1>

          {loading ? (
            <Loader />
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">Average Score</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">{averageScore}%</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">Excellent</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{excellentCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">Total</p>
              <p className="text-2xl sm:text-3xl font-bold text-secondary-600 dark:text-secondary-400">{results.length}</p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
            {[
              { label: 'All', value: 'all' },
              { label: 'Quizzes', value: 'quiz' },
              { label: 'Tests', value: 'test' }
            ].map(btn => (
              <button
                key={btn.value}
                onClick={() => setFilterType(btn.value)}
                className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition text-sm sm:text-base ${
                  filterType === btn.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="space-y-3 sm:space-y-4">
            {filteredResults.length > 0 ? (
              filteredResults.map(result => {
                const percentage = (result.score / result.totalMarks) * 100;
                return (
                  <div
                    key={result._id || result.id}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition p-4 sm:p-6"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getStatusEmoji(result.status)}</span>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{result.quizTitle}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400"><strong>Subject:</strong> {result.subject}</span>
                          <span className="text-gray-600 dark:text-gray-400"><strong>Date:</strong> {result.date}</span>
                        </div>
                        <div className="mt-3 w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              result.status === 'excellent' ? 'bg-green-600' :
                              result.status === 'good' ? 'bg-primary-600' :
                              result.status === 'fair' ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{result.score}</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">/ {result.totalMarks}</p>
                        <p className="text-sm sm:text-base font-bold mt-1 text-primary-600 dark:text-primary-400">{Math.round(percentage)}%</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No results found</p>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Results;
