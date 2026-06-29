import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../services/authService';

const PracticeTest = () => {
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes = 3600 seconds
  const [showResults, setShowResults] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [toast, setToast] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTestQuestions();
  }, [user]);

  // Timer effect
  useEffect(() => {
    if (testStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && testStarted && !showResults) {
      handleSubmitTest();
    }
  }, [timeLeft, testStarted, showResults]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchTestQuestions = async () => {
    try {
      setLoading(true);
      
      // Fetch all quizzes which contain questions categorized by level (Easy, Medium, Hard)
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
      
      // For practice test: pick a balanced mix
      // 15 easy, 20 medium, 15 hard = 50 questions total
      let selectedQuestions = [
        ...easyQuestions.slice(0, 15),
        ...mediumQuestions.slice(0, 20),
        ...hardQuestions.slice(0, 15)
      ];
      
      // Shuffle the final selection so questions aren't grouped by difficulty
      selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
      
      // If we don't have enough, fill from available questions
      if (selectedQuestions.length < 50) {
        const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions]
          .sort(() => Math.random() - 0.5);
        selectedQuestions = allQuestions.slice(0, 50);
      }
      
      setTestQuestions(selectedQuestions);
      setError(null);
    } catch (err) {
      console.error('Error fetching test questions:', err);
      setError('Failed to load practice test');
      setTestQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestion]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < testQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitTest = async () => {
    const totalQuestions = testQuestions.length;
    const correctAnswers = testQuestions.reduce((count, q, idx) => {
      return count + (answers[idx] === q.correctAnswerIndex ? 1 : 0);
    }, 0);
    
    const score = (correctAnswers / totalQuestions) * 100;
    const timeTaken = 3600 - timeLeft;
    const passed = correctAnswers >= 8;
    
    setCorrectCount(correctAnswers);
    setShowResults(true);
    
    try {
      const userId = user?.id;
      
      // Save test result to backend with correct format
      await apiClient.post('/results', {
        userId,
        quizId: 'practice-test-mixed',
        quizTitle: 'Practice Test - Mixed Subjects',
        subject: 'All Subjects',
        score: correctAnswers,
        totalMarks: totalQuestions,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        difficulty: 'mixed',
        timeTakenSeconds: timeTaken,
        passed: passed
      });
      
      // Show success toast notification
      setToast({
        message: `Test Completed! You scored ${correctAnswers}/${totalQuestions} (${Math.round(score)}%)`,
        type: passed ? 'success' : 'warning'
      });
    } catch (err) {
      console.error('Error submitting test:', err);
      setToast({
        message: 'Error submitting test results',
        type: 'error'
      });
    }
  };

  if (!testStarted) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 md:ml-64 pt-16 pb-20 md:pb-8 overflow-y-auto">
          <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Practice Test 📝</h1>
            
            {loading ? (
              <Loader />
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : testQuestions.length === 0 ? (
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No practice tests available at the moment</p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary-50 dark:from-primary-900/20 to-secondary-50 dark:to-secondary-900/20 border border-primary-200 dark:border-primary-700/50 rounded-lg p-6 sm:p-12 text-center">
                <div className="text-5xl sm:text-6xl mb-4">📚</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Full Mock Test</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base">
                  Test your knowledge with comprehensive questions covering multiple subjects.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">Questions</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">{testQuestions.length}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">Duration</p>
                    <p className="text-2xl sm:text-3xl font-bold text-secondary-600 dark:text-secondary-400">1 Hour</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">Level</p>
                    <p className="text-2xl sm:text-3xl font-bold text-accent-600 dark:text-accent-400">Advanced</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTestStarted(true);
                    setTimeLeft(3600); // Reset timer to 60 minutes
                    setShowResults(false);
                  }}
                  className="bg-gradient-primary hover:opacity-90 text-white font-bold py-3 sm:py-4 px-8 sm:px-12 rounded-lg transition transform active:scale-95 text-sm sm:text-base"
                >
                  Start Test
                </button>
              </div>
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  if (showResults) {
    const totalQuestions = testQuestions.length;
    const percentage = (correctCount / totalQuestions) * 100;
    const passed = correctCount >= 8;

    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 md:ml-64 pt-16 pb-20 md:pb-8 overflow-y-auto">
          <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full">
            <div className={`bg-white dark:bg-slate-800 rounded-lg border-l-4 ${passed ? 'border-l-green-500' : 'border-l-yellow-500'} shadow-md p-6 mb-6`}>
              <div className="text-center mb-6">
                <div className="text-4xl sm:text-5xl mb-3">{passed ? '🎉' : '📊'}</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {passed ? 'Congratulations!' : 'Test Completed'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  Practice Test - Mixed Subjects
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded p-4 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">Your Score</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">{Math.round(percentage)}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded p-4 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">Correct</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{correctCount}/{totalQuestions}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded p-4 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">Status</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${passed ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {passed ? '✓ Pass' : '✗ Fail'}
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition text-sm sm:text-base"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>

            {/* Answer Review */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Answer Review</h3>
              <div className="space-y-3">
                {testQuestions.map((question, idx) => {
                  const isCorrect = answers[idx] === question.correctAnswerIndex;
                  return (
                    <div
                      key={idx}
                      className={`border-l-4 ${isCorrect ? 'border-l-green-500 bg-green-50 dark:bg-green-900/10' : 'border-l-red-500 bg-red-50 dark:bg-red-900/10'} rounded-lg p-4`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          Q{idx + 1}: {question.question || question.questionText}
                        </h4>
                        <span className="text-lg flex-shrink-0">{isCorrect ? '✅' : '❌'}</span>
                      </div>
                      {!isCorrect && (
                        <div className="mt-2 space-y-1 text-xs sm:text-sm">
                          <p className="text-red-600 dark:text-red-400">
                            Your answer: {answers[idx] !== undefined ? question.options[answers[idx]] : 'Not answered'}
                          </p>
                          <p className="text-green-600 dark:text-green-400">
                            Correct answer: {question.options[question.correctAnswerIndex]}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const question = testQuestions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 pt-16 pb-20 md:pb-8 overflow-y-auto">
        <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">Question {currentQuestion + 1} of {testQuestions.length}</p>
                <div className="w-full sm:max-w-xs h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                  <div 
                    className="h-full bg-gradient-primary rounded-full transition-all"
                    style={{ width: `${((currentQuestion + 1) / testQuestions.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                  Subject: <span className="font-semibold text-gray-900 dark:text-white">{question.subject}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Time Left</p>
                  <p className={`text-lg sm:text-xl font-bold ${timeLeft < 300 ? 'text-red-600 dark:text-red-400' : 'text-primary-600 dark:text-primary-400'}`}>
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-4 sm:p-6 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">{question.question || question.questionText}</h2>
            
            <div className="space-y-2 sm:space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition text-sm sm:text-base ${
                    selectedAnswer === idx
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-gray-900 dark:text-white'
                      : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-primary-400'
                  }`}
                >
                  <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span> {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white font-bold py-3 px-6 rounded-lg transition text-sm sm:text-base"
            >
              ← Previous
            </button>

            <div className="flex gap-3">
              {currentQuestion === testQuestions.length - 1 ? (
                <button
                  onClick={handleSubmitTest}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition text-sm sm:text-base"
                >
                  Submit Test
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition text-sm sm:text-base"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default PracticeTest;
