import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import { apiClient } from '../services/api';

const Contest = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('daily');
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [userResult, setUserResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [contestStats, setContestStats] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch contest data
  const fetchContest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = activeTab === 'daily' ? '/api/contests/daily' : '/api/contests/weekly';
      const response = await apiClient.get(endpoint);
      setContest(response.data);

      if (response.data?.id && user?.id) {
        // Check participation
        const participationRes = await apiClient.get(
          `/api/contests/${response.data.id}/check-participation/${user.id}`
        );
        setHasParticipated(participationRes.data.hasParticipated);
        if (participationRes.data.result) {
          setUserResult(participationRes.data.result);
        }

        // Fetch leaderboard
        const leaderboardRes = await apiClient.get(
          `/api/contests/${response.data.id}/leaderboard`
        );
        setLeaderboard(leaderboardRes.data || []);

        // Fetch stats
        const statsRes = await apiClient.get(
          `/api/contests/${response.data.id}/stats`
        );
        setContestStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error fetching contest:', err);
      setError(err.response?.data?.error || 'Failed to load contest');
    } finally {
      setLoading(false);
    }
  }, [activeTab, user?.id]);

  useEffect(() => {
    fetchContest();
  }, [fetchContest]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (quizStarted && !quizEnded && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizEnded, timeLeft]);

  const startQuiz = () => {
    if (contest?.timeLimit) {
      setTimeLeft(contest.timeLimit * 60);
      setQuizStarted(true);
      setShowQuiz(true);
      setCurrentQuestion(0);
      setAnswers({});
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      setQuizEnded(true);

      // Calculate score
      let correctAnswers = 0;
      const questions = contest.questions || [];
      
      questions.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswerIndex) {
          correctAnswers++;
        }
      });

      const timeTaken = (contest.timeLimit * 60) - timeLeft;

      const result = {
        userId: user.id,
        userName: user.name || user.email,
        userEmail: user.email,
        contestType: activeTab.toUpperCase(),
        score: correctAnswers,
        totalMarks: questions.length,
        correctAnswers: correctAnswers,
        totalQuestions: questions.length,
        timeTakenSeconds: timeTaken,
        answersMap: answers
      };

      const response = await apiClient.post(
        `/api/contests/${contest.id}/submit`,
        result
      );

      setUserResult(response.data);
      setHasParticipated(true);
      
      // Refresh leaderboard
      const leaderboardRes = await apiClient.get(
        `/api/contests/${contest.id}/leaderboard`
      );
      setLeaderboard(leaderboardRes.data || []);

    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.response?.data?.error || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeFromSeconds = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getTimeUntilReset = () => {
    const now = new Date();
    
    if (activeTab === 'weekly') {
      // Calculate time until next Monday 12:00 AM
      const nextMonday = new Date(now);
      const dayOfWeek = now.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek); // Sunday = 1 day, else calculate
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      
      const diff = nextMonday - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      }
      return `${hours}h ${minutes}m`;
    } else {
      // Daily contest resets at midnight
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
  };

  if (loading) {
    return (
      <div className={`app-container ${isDark ? 'dark' : ''}`}>
        <Header />
        <div className="main-wrapper">
          <Sidebar />
          <main className="content-wrapper">
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader />
            </div>
          </main>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Quiz View
  if (showQuiz && !quizEnded) {
    const questions = contest?.questions || [];
    const currentQ = questions[currentQuestion];

    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
        {/* Quiz Header */}
        <div className={`sticky top-0 z-10 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md p-4`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {contest?.title}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-500' : isDark ? 'text-green-400' : 'text-green-600'}`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
          </div>
          {/* Progress bar */}
          <div className="max-w-4xl mx-auto mt-3">
            <div className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <div 
                className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-4xl mx-auto p-4">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-4`}>
            <h3 className={`text-xl font-medium mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentQ?.questionText}
            </h3>

            <div className="space-y-3">
              {currentQ?.options?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(currentQuestion, idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion] === idx
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                      : isDark
                        ? 'border-slate-600 hover:border-slate-500 bg-slate-700'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                  }`}
                >
                  <span className={`font-medium ${
                    answers[currentQuestion] === idx
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {String.fromCharCode(65 + idx)}. {option}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentQuestion === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              ← Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
              >
                Next →
              </button>
            )}
          </div>

          {/* Question navigator */}
          <div className={`mt-6 ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-lg p-4`}>
            <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Question Navigator
            </p>
            <div className="flex flex-wrap gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                    currentQuestion === idx
                      ? 'bg-indigo-600 text-white'
                      : answers[idx] !== undefined
                        ? 'bg-green-500 text-white'
                        : isDark
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results View (after quiz ends)
  if (quizEnded && userResult) {
    const percentage = ((userResult.correctAnswers / userResult.totalQuestions) * 100).toFixed(1);
    
    return (
      <div className={`app-container ${isDark ? 'dark' : ''}`}>
        <Header />
        <div className="main-wrapper">
          <Sidebar />
          <main className="content-wrapper p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              {/* Result Card */}
              <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {percentage >= 80 ? '🏆' : percentage >= 60 ? '🎉' : percentage >= 40 ? '👍' : '📚'}
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Great Job!' : percentage >= 40 ? 'Good Effort!' : 'Keep Practicing!'}
                  </h2>
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    You scored {userResult.correctAnswers} out of {userResult.totalQuestions}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-indigo-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Score</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {userResult.score}/{userResult.totalMarks}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-green-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Accuracy</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {percentage}%
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-blue-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Time Taken</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {formatTimeFromSeconds(userResult.timeTakenSeconds)}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-purple-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rank</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      #{userResult.rank || '-'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowQuiz(false);
                    setQuizEnded(false);
                    fetchContest();
                  }}
                  className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
                >
                  View Leaderboard
                </button>
              </div>
            </div>
          </main>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className={`app-container ${isDark ? 'dark' : ''}`}>
      <Header />
      <div className="main-wrapper">
        <Sidebar />
        <main className="content-wrapper p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Title */}
            <div className="mb-6">
              <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🏆 Contests
              </h1>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Compete with others and climb the leaderboard!
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'daily'
                    ? 'bg-indigo-600 text-white'
                    : isDark
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📅 Daily Contest
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'weekly'
                    ? 'bg-indigo-600 text-white'
                    : isDark
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📆 Weekly Contest
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              {/* Contest Info Card */}
              <div className="md:col-span-2">
                <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                  {contest ? (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {contest.title}
                          </h2>
                          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {contest.description}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          contest.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {contest.isActive ? '🟢 Active' : '⚪ Ended'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Questions</p>
                          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {contest.totalQuestions}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Time Limit</p>
                          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {contest.timeLimit} min
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Marks</p>
                          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {contest.totalMarks}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Resets In</p>
                          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {getTimeUntilReset()}
                          </p>
                        </div>
                      </div>

                      {hasParticipated ? (
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'} mb-4`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">✅</span>
                            <p className={`font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                              You've completed this contest!
                            </p>
                          </div>
                          {userResult && (
                            <div className="grid grid-cols-3 gap-4 mt-3">
                              <div>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your Score</p>
                                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {userResult.score}/{userResult.totalMarks}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your Rank</p>
                                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  #{userResult.rank || '-'}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Time</p>
                                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {formatTimeFromSeconds(userResult.timeTakenSeconds)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={startQuiz}
                          disabled={!contest.isActive}
                          className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                            contest.isActive
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {contest.isActive ? '🚀 Start Contest' : 'Contest Ended'}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        No contest available at the moment.
                      </p>
                    </div>
                  )}
                </div>

                {/* Stats Card */}
                {contestStats && (
                  <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-lg p-6 mt-6`}>
                    <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      📊 Contest Statistics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                        <p className={`text-2xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                          {contestStats.participantCount}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Participants</p>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                        <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          {contestStats.averageScore}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avg Score</p>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                        <p className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          {formatTimeFromSeconds(contestStats.averageTime)}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avg Time</p>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                        <p className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                          {contestStats.highestScore}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Highest</p>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                        <p className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                          {contestStats.lowestScore}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Lowest</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Leaderboard */}
              <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  🏅 Leaderboard
                </h3>
                
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((result, index) => (
                      <div
                        key={result.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          result.userId === user?.id
                            ? isDark ? 'bg-indigo-900/30 border border-indigo-500' : 'bg-indigo-50 border border-indigo-200'
                            : isDark ? 'bg-slate-700' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          isDark ? 'bg-slate-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {result.userName || result.userEmail?.split('@')[0]}
                            {result.userId === user?.id && ' (You)'}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatTimeFromSeconds(result.timeTakenSeconds)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            {result.score}/{result.totalMarks}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {((result.correctAnswers / result.totalQuestions) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-2">🎯</p>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      No participants yet. Be the first!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default Contest;
