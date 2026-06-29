import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Toast from '../components/common/Toast';
import { apiClient } from '../services/api';
import { getToken, getUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const quiz = location.state?.quiz;
  const { user: authUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // If quiz object wasn't passed via navigation state, fetch it from backend using quizId
    const load = async () => {
      try {
        setLoading(true);
        let quizData = quiz;
        if (!quizData) {
          const resp = await apiClient.get(`/quizzes/${quizId}`);
          quizData = resp.data;
        }
        // Get questions from embedded quiz data or fetch separately
        let questionsData = [];
        if (quizData.questions && quizData.questions.length > 0) {
          // Questions are embedded in quiz
          questionsData = quizData.questions;
        } else {
          // Try fetching questions separately
          try {
            const questionsResponse = await apiClient.get(`/quizzes/${quizId}/questions`);
            questionsData = questionsResponse.data;
          } catch (err) {
            console.log('Could not fetch separate questions, using embedded data');
          }
        }
        setQuestions(questionsData || []);
        // No timer for regular quizzes
        setTimeLeft(0);
        setError(null);
      } catch (err) {
        console.error('Error fetching quiz or questions:', err);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId, quiz]);

  // Timer disabled for regular quizzes
  // useEffect(() => {
  //   if (timeLeft > 0 && !showResults) {
  //     const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
  //     return () => clearTimeout(timer);
  //   } else if (timeLeft === 0 && questions.length > 0 && !showResults) {
  //     handleSubmitQuiz();
  //   }
  // }, [timeLeft, showResults, questions.length]);

  const fetchQuestions = async () => {
    // fetchQuestions removed; loading handled above
  };

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestion]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      // Calculate score
      let correctCount = 0;
      questions.forEach((question, idx) => {
        if (answers[idx] === question.correctAnswerIndex) {
          correctCount++;
        }
      });

      const finalScore = (correctCount / questions.length) * 100;
      setScore(finalScore);
      setCorrectCount(correctCount);
      setShowResults(true);

      // Save result to backend
      const user = authUser || getUser();
      const userId = user?.id || 'anonymous';
      const timeTaken = quiz.timeLimit - timeLeft;

      const result = {
        userId,
        quizId,
        quizTitle: quiz.title,
        score: correctCount,
        totalMarks: questions.length,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        difficulty: quiz.difficulty,
        subject: quiz.subject,
        timeTakenSeconds: timeTaken,
        passed: finalScore >= quiz.passingScore
      };

      await apiClient.post('/results', result);
      
      // Show success toast notification
      setToast({
        message: `Quiz Completed! You scored ${correctCount}/${questions.length} (${Math.round(finalScore)}%)`,
        type: finalScore >= (quiz.passingScore || 40) ? 'success' : 'warning'
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 md:ml-64 pt-16 pb-20 md:pb-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 md:ml-64 pt-16 pb-20 md:pb-8 overflow-y-auto">
          <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4 text-sm sm:text-base">{error}</p>
              <button
                onClick={() => navigate('/subjects')}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg text-sm sm:text-base"
              >
                Back to Subjects
              </button>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (showResults) {
    const totalQuestions = questions.length;
    const correctAnswers = correctCount;
    const percentage = (correctAnswers / totalQuestions) * 100;
    const passed = correctAnswers >= 8;

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
                  {passed ? 'Congratulations!' : 'Quiz Completed'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  {quiz.title}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded p-4 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">Your Score</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">{Math.round(percentage)}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded p-4 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">Correct</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{correctAnswers}/{totalQuestions}</p>
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
                  onClick={() => navigate('/subjects')}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition text-sm sm:text-base"
                >
                  Back to Subjects
                </button>
              </div>
            </div>

            {/* Answer Review */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Answer Review</h3>
              <div className="space-y-3">
                {questions.map((question, idx) => {
                  const isCorrect = answers[idx] === question.correctAnswerIndex;
                  return (
                    <div key={idx} className={`p-4 rounded-lg border-l-4 ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-l-green-500' : 'bg-red-50 dark:bg-red-900/20 border-l-red-500'}`}>
                      <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base mb-2">Q{idx + 1}: {question.questionText}</p>
                      <p className={`text-xs sm:text-sm ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        Your answer: {question.options[answers[idx]] || 'Not answered'}
                      </p>
                      {!isCorrect && (
                        <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mt-2">
                          Correct: {question.options[question.correctAnswerIndex]}
                        </p>
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

  if (questions.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 md:ml-64 pt-16 pb-20 md:pb-8 overflow-y-auto">
          <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
              <p className="text-yellow-600 dark:text-yellow-400 mb-4 text-sm sm:text-base">No questions found for this quiz.</p>
              <button
                onClick={() => navigate('/subjects')}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg text-sm sm:text-base"
              >
                Back to Subjects
              </button>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const question = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 pt-16 pb-20 md:pb-8 overflow-y-auto">
        <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full">
          {/* Quiz Header */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">{quiz.title}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">Question {currentQuestion + 1} of {questions.length}</p>
                <div className="w-full max-w-xs h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                  <div 
                    className="h-full bg-gradient-primary rounded-full transition-all"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-4 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">{question.questionText}</h2>
            
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

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white font-bold py-3 px-6 rounded-lg transition text-sm sm:text-base"
            >
              ← Previous
            </button>

            <div className="flex gap-3">
              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition text-sm sm:text-base"
                >
                  Submit Quiz
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

export default Quiz;
