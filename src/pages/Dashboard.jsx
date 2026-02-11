import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';
import { apiClient } from '../services/api';
import { getToken, getUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { getAllMaterials } from '../services/pdfService';

// ==================== CONTEST UTILITIES ====================
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setHours(0, 0, 0, 0);
  d.setDate(diff);
  return d;
};

const parseResultDate = (result) => {
  const iso = result?.completedAt || result?.createdAt || result?.updatedAt || result?.submittedAt;
  const candidate = iso ? new Date(iso) : null;
  return candidate && !Number.isNaN(candidate.getTime()) ? candidate : new Date(0);
};

const calculatePercentage = (result) => {
  const total = result?.totalQuestions || 1;
  const correct = result?.correctAnswers || 0;
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

const formatContestDate = (date) => {
  if (!date) return 'TBD';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  }).format(date);
};

const getNextDailyContestDate = () => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(20, 0, 0, 0); // Daily contest at 8 PM
  if (now >= next) {
    next.setDate(next.getDate() + 1);
  }
  return next;
};

const getNextWeeklyContestDate = () => {
  const now = new Date();
  const targetDay = 0; // Sunday
  let daysAhead = (targetDay - now.getDay() + 7) % 7;
  const next = new Date(now);
  next.setHours(10, 0, 0, 0); // Weekly contest at 10 AM on Sunday
  if (daysAhead === 0 && now >= next) {
    daysAhead = 7;
  }
  if (daysAhead === 0) {
    next.setDate(now.getDate() + 7);
  } else {
    next.setDate(now.getDate() + daysAhead);
  }
  return next;
};

// ==================== CONTEST MODAL COMPONENT ====================
const ContestModal = ({ isOpen, onClose, contestType, user, onContestComplete }) => {
  const [contestQuestions, setContestQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [contestStarted, setContestStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const CONTEST_CONFIG = {
    daily: { questions: 10, timeSeconds: 600, label: 'Daily Contest' }, // 10 questions, 1 min per question = 10 minutes
    weekly: { questions: 30, timeSeconds: 1800, label: 'Weekly Contest' } // 30 questions, 1 min per question = 30 minutes
  };

  const config = CONTEST_CONFIG[contestType] || CONTEST_CONFIG.daily;

  useEffect(() => {
    if (isOpen) {
      fetchContestQuestions();
      fetchLeaderboard();
    }
  }, [isOpen, contestType]);

  useEffect(() => {
    if (contestStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && contestStarted && !showResults && contestQuestions.length > 0) {
      handleSubmitContest();
    }
  }, [timeLeft, contestStarted, showResults]);

  const fetchContestQuestions = async () => {
    try {
      setLoading(true);
      
      // Fetch quizzes which contain questions categorized by level (Easy, Medium, Hard)
      const response = await apiClient.get('/quizzes');
      const quizzes = Array.isArray(response.data) ? response.data : [];
      
      // Separate questions by difficulty level
      let easyQuestions = [];
      let mediumQuestions = [];
      let hardQuestions = [];
      
      quizzes.forEach(quiz => {
        if (quiz.questions && Array.isArray(quiz.questions)) {
          const level = (quiz.level || quiz.difficulty || '').toLowerCase();
          const questionsWithMeta = quiz.questions.map(q => ({
            ...q,
            subject: quiz.subject,
            quizTitle: quiz.title,
            difficulty: quiz.level || quiz.difficulty
          }));
          
          if (level === 'easy') {
            easyQuestions = easyQuestions.concat(questionsWithMeta);
          } else if (level === 'medium') {
            mediumQuestions = mediumQuestions.concat(questionsWithMeta);
          } else if (level === 'hard') {
            hardQuestions = hardQuestions.concat(questionsWithMeta);
          }
        }
      });
      
      // Shuffle each difficulty pool
      easyQuestions = easyQuestions.sort(() => Math.random() - 0.5);
      mediumQuestions = mediumQuestions.sort(() => Math.random() - 0.5);
      hardQuestions = hardQuestions.sort(() => Math.random() - 0.5);
      
      // For contest: pick a mix of easy, medium, hard questions
      // Daily: 2 easy, 2 medium, 1 hard = 5 questions
      // Weekly: 3 easy, 4 medium, 3 hard = 10 questions
      let selectedQuestions = [];
      if (contestType === 'daily') {
        selectedQuestions = [
          ...easyQuestions.slice(0, 2),
          ...mediumQuestions.slice(0, 2),
          ...hardQuestions.slice(0, 1)
        ];
      } else {
        // Weekly contest
        selectedQuestions = [
          ...easyQuestions.slice(0, 3),
          ...mediumQuestions.slice(0, 4),
          ...hardQuestions.slice(0, 3)
        ];
      }
      
      // Shuffle the final selection so questions aren't grouped by difficulty
      selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
      
      // Ensure we have enough questions, fill from any pool if needed
      if (selectedQuestions.length < config.questions) {
        const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions]
          .sort(() => Math.random() - 0.5);
        selectedQuestions = allQuestions.slice(0, config.questions);
      }
      
      setContestQuestions(selectedQuestions.slice(0, config.questions));
      setTimeLeft(config.timeSeconds);
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
      setContestStarted(false);
    } catch (err) {
      console.error('Error fetching contest questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // First fetch the current active contest to get its ID
      const endpoint = contestType === 'daily' ? '/api/contests/daily' : '/api/contests/weekly';
      const contestResponse = await apiClient.get(endpoint);
      const contest = contestResponse.data;
      
      if (!contest?.id) {
        setLeaderboard([]);
        return;
      }
      
      // Fetch leaderboard for the current active contest only
      const response = await apiClient.get(`/api/contests/${contest.id}/leaderboard`);
      const results = Array.isArray(response.data) ? response.data : [];
      
      // Sort by percentage and time taken
      const sorted = results
        .map(r => ({
          ...r,
          percentage: r.accuracy || Math.round((r.correctAnswers / (r.totalQuestions || 1)) * 100)
        }))
        .sort((a, b) => {
          if (b.percentage !== a.percentage) return b.percentage - a.percentage;
          return (a.timeTakenSeconds || 0) - (b.timeTakenSeconds || 0);
        })
        .slice(0, 10);
      
      setLeaderboard(sorted);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setLeaderboard([]);
    }
  };

  const handleStartContest = () => {
    setContestStarted(true);
    setTimeLeft(config.timeSeconds);
  };

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < contestQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitContest = async () => {
    if (submitting) return;
    setSubmitting(true);

    const totalQuestions = contestQuestions.length;
    const correctAnswers = contestQuestions.reduce((count, q, idx) => {
      return count + (answers[idx] === q.correctAnswerIndex ? 1 : 0);
    }, 0);
    
    const timeTaken = config.timeSeconds - timeLeft;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    setCorrectCount(correctAnswers);
    setShowResults(true);

    try {
      const userId = user?._id || user?.id;
      const userEmail = user?.email || 'anonymous@user.com';

      // First, get the current active contest ID
      const contestEndpoint = contestType === 'daily' ? '/api/contests/daily' : '/api/contests/weekly';
      const contestResponse = await apiClient.get(contestEndpoint);
      const currentContest = contestResponse.data;

      // Save to contest_results collection (for leaderboard)
      if (currentContest?.id) {
        await apiClient.post(`/api/contests/${currentContest.id}/submit`, {
          userId,
          userEmail,
          contestId: currentContest.id,
          contestType: contestType.toUpperCase(),
          score: correctAnswers,
          correctAnswers: correctAnswers,
          totalQuestions: totalQuestions,
          timeTakenSeconds: timeTaken,
          accuracy: accuracy
        });
      }

      // Also save to regular results for history/progress tracking
      await apiClient.post('/results', {
        userId,
        userEmail,
        quizId: `contest-${contestType}-${Date.now()}`,
        quizTitle: config.label,
        subject: 'Contest',
        contestType: contestType,
        score: correctAnswers,
        totalMarks: totalQuestions,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        difficulty: 'contest',
        timeTakenSeconds: timeTaken,
        passed: correctAnswers >= Math.ceil(totalQuestions * 0.6)
      });

      // Refresh leaderboard
      await fetchLeaderboard();
      
      if (onContestComplete) {
        onContestComplete();
      }
    } catch (err) {
      console.error('Error submitting contest:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setContestStarted(false);
    setShowResults(false);
    setAnswers({});
    setCurrentQuestion(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-t-xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{config.label}</h2>
            <p className="text-sm text-white/80">{config.questions} Questions • {Math.floor(config.timeSeconds / 60)} Minutes</p>
          </div>
          <button onClick={handleClose} className="text-white/80 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : !contestStarted && !showResults ? (
            /* Pre-contest Screen */
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready for {config.label}?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Answer {config.questions} random questions in {Math.floor(config.timeSeconds / 60)} minutes.
                <br />Fastest correct answers win!
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm mx-auto">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{config.questions}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{Math.floor(config.timeSeconds / 60)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Minutes</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">🏅</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rank</p>
                </div>
              </div>

              {contestQuestions.length > 0 ? (
                <button
                  onClick={handleStartContest}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105"
                >
                  Start Contest 🚀
                </button>
              ) : (
                <p className="text-red-500">No questions available for contest</p>
              )}

              {/* Leaderboard Preview */}
              {leaderboard.length > 0 && (
                <div className="mt-8 text-left">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🏆 Current Leaderboard</h4>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 space-y-2">
                    {leaderboard.slice(0, 5).map((entry, idx) => (
                      <div key={entry.id || idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                            idx === 1 ? 'bg-gray-300 text-gray-700' :
                            idx === 2 ? 'bg-orange-400 text-orange-900' :
                            'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium break-all">
                            {entry.userEmail || 'Anonymous'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {entry.timeTakenSeconds ? `${Math.floor(entry.timeTakenSeconds / 60)}m ${entry.timeTakenSeconds % 60}s` : '-'}
                          </span>
                          <span className="font-bold text-primary-600 dark:text-primary-400">{entry.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : showResults ? (
            /* Results Screen */
            <div className="text-center py-6">
              <div className="text-5xl mb-4">{correctCount >= Math.ceil(contestQuestions.length * 0.6) ? '🎉' : '📊'}</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contest Completed!</h3>
              
              <div className="grid grid-cols-3 gap-4 my-6 max-w-md mx-auto">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {Math.round((correctCount / contestQuestions.length) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{correctCount}/{contestQuestions.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Correct</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <p className="text-3xl font-bold text-secondary-600 dark:text-secondary-400">
                    {formatTime(config.timeSeconds - timeLeft)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                </div>
              </div>

              {/* Updated Leaderboard */}
              {leaderboard.length > 0 && (
                <div className="mt-6 text-left">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🏆 Leaderboard</h4>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                    {leaderboard.map((entry, idx) => (
                      <div key={entry.id || idx} className={`flex items-center justify-between text-sm p-2 rounded ${
                        entry.userEmail === user?.email ? 'bg-primary-100 dark:bg-primary-900/30' : ''
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                            idx === 1 ? 'bg-gray-300 text-gray-700' :
                            idx === 2 ? 'bg-orange-400 text-orange-900' :
                            'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium break-all">
                            {entry.userEmail || 'Anonymous'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {entry.timeTakenSeconds ? `${Math.floor(entry.timeTakenSeconds / 60)}m ${entry.timeTakenSeconds % 60}s` : '-'}
                          </span>
                          <span className="font-bold text-primary-600 dark:text-primary-400">{entry.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleClose}
                className="mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition"
              >
                Close
              </button>
            </div>
          ) : (
            /* Active Contest */
            <div>
              {/* Timer & Progress */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Question {currentQuestion + 1} of {contestQuestions.length}</p>
                  <div className="w-48 h-2 bg-gray-200 dark:bg-slate-700 rounded-full mt-1">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all"
                      style={{ width: `${((currentQuestion + 1) / contestQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-primary-600 dark:text-primary-400'}`}>
                  ⏱ {formatTime(timeLeft)}
                </div>
              </div>

              {/* Question */}
              {contestQuestions[currentQuestion] && (
                <div className="mb-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {contestQuestions[currentQuestion].subject}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {contestQuestions[currentQuestion].questionText || contestQuestions[currentQuestion].question}
                  </h3>
                  
                  <div className="space-y-2">
                    {contestQuestions[currentQuestion].options?.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        className={`w-full p-3 text-left rounded-lg border-2 transition ${
                          answers[currentQuestion] === idx
                            ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500'
                            : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:border-primary-400'
                        }`}
                      >
                        <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span> {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between gap-3">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 text-gray-900 dark:text-white font-semibold rounded-lg transition"
                >
                  ← Prev
                </button>
                
                {currentQuestion === contestQuestions.length - 1 ? (
                  <button
                    onClick={handleSubmitContest}
                    disabled={submitting}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-lg transition"
                  >
                    {submitting ? 'Submitting...' : 'Submit Contest'}
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== DASHBOARD COMPONENT ====================
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    averageScore: '0%',
    subjectsCovered: 0,
    testsCompleted: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [savedBooksCount, setSavedBooksCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Contest state
  const [contestModalOpen, setContestModalOpen] = useState(false);
  const [selectedContestType, setSelectedContestType] = useState('daily');
  const [contestLeaderboards, setContestLeaderboards] = useState({ daily: [], weekly: [] });
  const [userContestAttempts, setUserContestAttempts] = useState({ daily: false, weekly: false });
  const [contestAttemptInfo, setContestAttemptInfo] = useState({ daily: null, weekly: null });

  useEffect(() => {
    console.log('=== DASHBOARD MOUNTED - STARTING DATA FETCH ===');
    if (authUser) {
      fetchDashboardData();
      fetchContestLeaderboards();
      checkUserContestAttempts();
    }
  }, [authUser, location]);

  const checkUserContestAttempts = async () => {
    try {
      const userId = authUser?._id || authUser?.id;
      if (!userId) return;

      // Fetch user's results
      const resultsResponse = await apiClient.get(`/results/user/${userId}`);
      const allResults = Array.isArray(resultsResponse.data) ? resultsResponse.data : [];

      // Filter contest results only
      const contestResults = allResults.filter(r => r.difficulty === 'contest');

      const now = new Date();
      const todayStart = getStartOfDay(now);
      const weekStart = getStartOfWeek(now);

      // Check daily contest attempt (today)
      const dailyAttempt = contestResults.find(r => {
        if (r.contestType !== 'daily') return false;
        const resultDate = parseResultDate(r);
        return resultDate >= todayStart;
      });

      // Check weekly contest attempt (this week)
      const weeklyAttempt = contestResults.find(r => {
        if (r.contestType !== 'weekly') return false;
        const resultDate = parseResultDate(r);
        return resultDate >= weekStart;
      });

      setUserContestAttempts({
        daily: !!dailyAttempt,
        weekly: !!weeklyAttempt
      });

      setContestAttemptInfo({
        daily: dailyAttempt || null,
        weekly: weeklyAttempt || null
      });

      console.log('Contest attempts:', { daily: !!dailyAttempt, weekly: !!weeklyAttempt });
    } catch (err) {
      console.error('Error checking contest attempts:', err);
    }
  };

  const fetchContestLeaderboards = async () => {
    try {
      // First fetch the current active contests to get their IDs
      const [dailyContestRes, weeklyContestRes] = await Promise.all([
        apiClient.get('/api/contests/daily').catch(() => ({ data: null })),
        apiClient.get('/api/contests/weekly').catch(() => ({ data: null }))
      ]);

      const dailyContest = dailyContestRes.data;
      const weeklyContest = weeklyContestRes.data;

      // Fetch leaderboards for the current active contests only
      const [dailyLeaderboardRes, weeklyLeaderboardRes] = await Promise.all([
        dailyContest?.id 
          ? apiClient.get(`/api/contests/${dailyContest.id}/leaderboard`).catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
        weeklyContest?.id 
          ? apiClient.get(`/api/contests/${weeklyContest.id}/leaderboard`).catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] })
      ]);

      const processLeaderboard = (results) => {
        return (Array.isArray(results) ? results : [])
          .map(r => ({
            ...r,
            percentage: r.accuracy || Math.round((r.correctAnswers / (r.totalQuestions || 1)) * 100)
          }))
          .sort((a, b) => {
            if (b.percentage !== a.percentage) return b.percentage - a.percentage;
            return (a.timeTakenSeconds || 0) - (b.timeTakenSeconds || 0);
          })
          .slice(0, 5);
      };

      setContestLeaderboards({
        daily: processLeaderboard(dailyLeaderboardRes.data),
        weekly: processLeaderboard(weeklyLeaderboardRes.data)
      });
    } catch (err) {
      console.error('Error fetching contest leaderboards:', err);
    }
  };

  const fetchDashboardData = async () => {
    console.log('=== Dashboard: fetchDashboardData CALLED ===');
    try {
      setLoading(true);
      const token = getToken();
      const user = authUser || getUser();
      
      if (!token || !user) {
        console.error('Dashboard: No token or user found');
        navigate('/login');
        return;
      }

      const userId = user._id || user.id;
      
      if (!userId) {
        console.error('Dashboard: No user ID found in user object:', user);
        setError('Invalid session. Please login again.');
        setLoading(false);
        return;
      }

      // Fetch comprehensive progress data from backend
      const progressResponse = await apiClient.get(`/progress/user/${userId}`);
      const progressData = progressResponse.data;

      // Fetch user results from backend (excluding contest results)
      const resultsResponse = await apiClient.get(`/results/user/${userId}`);
      const allResults = Array.isArray(resultsResponse.data) ? resultsResponse.data : [];
      
      // Filter out contest results for regular stats
      const results = allResults.filter(r => r.difficulty !== 'contest');

      // Fetch resource activities
      let resourceActivities = [];
      try {
        const activitiesResponse = await apiClient.get(`/resource-activities/user/${userId}`);
        resourceActivities = Array.isArray(activitiesResponse.data) ? activitiesResponse.data : [];
      } catch (activityError) {
        console.error('Error fetching resource activities:', activityError);
      }

      // Get books count from static pdfService
      const allMaterials = getAllMaterials();
      setSavedBooksCount(allMaterials.length);

      // Calculate statistics from results (excluding contest)
      const avgScore = results.length > 0 
        ? Math.round((results.reduce((sum, r) => {
            const correctAns = r.correctAnswers || 0;
            const totalQs = r.totalQuestions || 1;
            const percentage = (correctAns / totalQs) * 100;
            return sum + (isNaN(percentage) ? 0 : percentage);
          }, 0)) / results.length)
        : 0;

      const subjectsSet = new Set();
      results.forEach(r => { 
        if (r.subject && r.subject !== 'Contest') {
          subjectsSet.add(r.subject); 
        }
      });
      resourceActivities.forEach(a => { 
        if (a.subject) {
          subjectsSet.add(a.subject); 
        }
      });

      setStats({
        quizzesTaken: results.length,
        averageScore: `${avgScore}%`,
        subjectsCovered: subjectsSet.size,
        testsCompleted: results.filter(r => r.quizTitle?.includes('Test')).length
      });

      // Combine recent activities (excluding contest)
      const recentQuizResults = results
        .sort((a, b) => new Date(b.createdAt || b.completedAt) - new Date(a.createdAt || a.completedAt))
        .slice(0, 5)
        .map(r => ({
          id: r.id,
          type: r.quizTitle?.includes('Test') ? 'test' : 'quiz',
          title: r.quizTitle,
          subject: r.subject,
          score: r.correctAnswers || 0,
          total: r.totalQuestions || 0,
          date: r.createdAt || r.completedAt,
          displayType: 'quiz'
        }));

      const recentResources = resourceActivities
        .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))
        .slice(0, 5)
        .map(a => ({
          id: a.id,
          type: 'resource',
          title: a.resourceTitle,
          subject: a.subject,
          resourceType: a.resourceType,
          completed: a.completed,
          date: a.lastAccessedAt,
          displayType: 'resource'
        }));

      const combinedActivities = [...recentQuizResults, ...recentResources]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      setRecentActivity(combinedActivities);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenContest = (type) => {
    // Check if user already attempted this contest
    if (userContestAttempts[type]) {
      const attemptInfo = contestAttemptInfo[type];
      const score = attemptInfo ? `${attemptInfo.correctAnswers}/${attemptInfo.totalQuestions}` : '';
      const nextAvailable = type === 'daily' ? 'tomorrow' : 'next week';
      alert(`You have already attempted the ${type} contest${score ? ` (Score: ${score})` : ''}. You can try again ${nextAvailable}.`);
      return;
    }
    setSelectedContestType(type);
    setContestModalOpen(true);
  };

  const handleContestComplete = () => {
    fetchContestLeaderboards();
    checkUserContestAttempts(); // Refresh attempt status after completing
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Contest Modal */}
      <ContestModal
        isOpen={contestModalOpen}
        onClose={() => setContestModalOpen(false)}
        contestType={selectedContestType}
        user={authUser}
        onContestComplete={handleContestComplete}
      />
      
      <main className="flex-1 md:ml-64 pt-20 pb-24 overflow-y-auto">
        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back! 👋</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Track your progress and ace your exams</p>
          </div>

          {/* Quick widget: Saved Books */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-lg p-4 sm:p-6 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl sm:text-5xl">📚</div>
                <div>
                  <p className="text-sm text-white/90">Available Resources</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{savedBooksCount}</p>
                  <p className="text-xs text-white/80 mt-1">Books & Previous Year Papers</p>
                </div>
              </div>
              <div>
                <button onClick={() => navigate('/books')} className="px-4 py-2 bg-white hover:bg-gray-100 text-green-600 rounded-lg font-semibold shadow-md transition-all">
                  View All
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <Loader />
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                  <div className="text-2xl mb-2">📖</div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Quizzes</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.quizzesTaken}</p>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Average</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.averageScore}</p>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                  <div className="text-2xl mb-2">📚</div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Subjects</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.subjectsCovered}</p>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Tests</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.testsCompleted}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button 
                  onClick={() => navigate('/subjects')}
                  className="py-3 sm:py-4 px-4 sm:px-6 bg-gradient-primary hover:opacity-90 text-white font-bold rounded-lg transition-all active:scale-95"
                >
                  📚 Start Learning
                </button>
                <button 
                  onClick={() => navigate('/practice-test')}
                  className="py-3 sm:py-4 px-4 sm:px-6 bg-secondary-600 hover:bg-secondary-700 text-white font-bold rounded-lg transition-all active:scale-95"
                >
                  ✍️ Take Test
                </button>
              </div>

              {/* Contest Section - Daily & Weekly */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm mb-6">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">🏆 Daily & Weekly Contests</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Compete with others • Timed challenges • Leaderboard rankings</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full font-semibold animate-pulse">Live</span>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Daily Contest Card */}
                    <div className="p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">🌅</span>
                        <span className="text-xs px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-full">Daily</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Daily Challenge</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">10 questions • 10 minutes • 1 min/question</p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <p>🔄 Contest changes daily at 12:00 AM</p>
                      </div>
                      <button
                        onClick={() => handleOpenContest('daily')}
                        disabled={userContestAttempts.daily}
                        className={`w-full py-2 font-semibold rounded-lg transition ${
                          userContestAttempts.daily
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                        }`}
                      >
                        {userContestAttempts.daily ? '✓ Attempted Today' : 'Attempt Contest'}
                      </button>
                      {userContestAttempts.daily && contestAttemptInfo.daily && (
                        <p className="text-xs text-center text-green-600 dark:text-green-400 mt-2">
                          Your score: {contestAttemptInfo.daily.correctAnswers}/{contestAttemptInfo.daily.totalQuestions} ({Math.round((contestAttemptInfo.daily.correctAnswers / contestAttemptInfo.daily.totalQuestions) * 100)}%)
                        </p>
                      )}
                      
                      {/* Daily Leaderboard */}
                      {contestLeaderboards.daily.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Top Performers</p>
                          <div className="space-y-1">
                            {contestLeaderboards.daily.slice(0, 3).map((entry, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs gap-2">
                                <span className="text-gray-700 dark:text-gray-300 break-all">
                                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} {entry.userEmail}
                                </span>
                                <span className="font-bold text-purple-600 dark:text-purple-400">{entry.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Weekly Contest Card */}
                    <div className="p-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">📅</span>
                        <span className="text-xs px-2 py-1 bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded-full">Weekly</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Weekly Championship</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">30 questions • 30 minutes • 1 min/question</p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <p>🔄 Contest changes every Monday at 12:00 AM</p>
                      </div>
                      <button
                        onClick={() => handleOpenContest('weekly')}
                        disabled={userContestAttempts.weekly}
                        className={`w-full py-2 font-semibold rounded-lg transition ${
                          userContestAttempts.weekly
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white'
                        }`}
                      >
                        {userContestAttempts.weekly ? '✓ Attempted This Week' : 'Attempt Contest'}
                      </button>
                      {userContestAttempts.weekly && contestAttemptInfo.weekly && (
                        <p className="text-xs text-center text-green-600 dark:text-green-400 mt-2">
                          Your score: {contestAttemptInfo.weekly.correctAnswers}/{contestAttemptInfo.weekly.totalQuestions} ({Math.round((contestAttemptInfo.weekly.correctAnswers / contestAttemptInfo.weekly.totalQuestions) * 100)}%)
                        </p>
                      )}
                      
                      {/* Weekly Leaderboard */}
                      {contestLeaderboards.weekly.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-700">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Top Performers</p>
                          <div className="space-y-1">
                            {contestLeaderboards.weekly.slice(0, 3).map((entry, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs gap-2">
                                <span className="text-gray-700 dark:text-gray-300 break-all">
                                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} {entry.userEmail}
                                </span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{entry.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {recentActivity.length > 0 ? (
                    recentActivity.map(activity => (
                      <div key={activity.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">
                                {activity.displayType === 'quiz' ? '📝' : '📚'}
                              </span>
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                                {activity.title}
                              </h3>
                            </div>
                            {activity.subject && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">{activity.subject}</p>
                            )}
                            {activity.displayType === 'quiz' ? (
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Score: {activity.score}/{activity.total}
                              </p>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  {activity.resourceType === 'book' ? 'Book' : 'Previous Year Question'}
                                </span>
                                {activity.completed && (
                                  <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                    ✓ Completed
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            {activity.displayType === 'quiz' ? (
                              <span className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">
                                {activity.total > 0 ? Math.round((activity.score/activity.total)*100) : 0}%
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {new Date(activity.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No activity yet. Start with a quiz or read a book!</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
