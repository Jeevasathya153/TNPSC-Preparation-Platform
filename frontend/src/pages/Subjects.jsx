import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import { apiClient } from '../services/api';

const getQuizQuestionCount = (quiz) => {
  if (!quiz) return 0;
  if (Array.isArray(quiz.questions) && quiz.questions.length > 0) return quiz.questions.length;
  if (Array.isArray(quiz.questionIds) && quiz.questionIds.length > 0) return quiz.questionIds.length;
  if (typeof quiz.questionCount === 'number' && quiz.questionCount >= 0) return quiz.questionCount;
  if (typeof quiz.totalQuestions === 'number' && quiz.totalQuestions >= 0) return quiz.totalQuestions;
  if (quiz.metadata?.questionCount) return quiz.metadata.questionCount;
  return 0;
};

// Try to determine quiz difficulty from level field or embedded questions
const getQuizDifficulty = (quiz) => {
  // Check if quiz has level field (from MongoDB)
  if (quiz.level && quiz.level.trim() !== '') {
    return quiz.level.charAt(0).toUpperCase() + quiz.level.slice(1).toLowerCase();
  }
  
  // Check if quiz has difficulty set
  if (quiz.difficulty && quiz.difficulty.trim() !== '') {
    return quiz.difficulty;
  }
  
  // Try to get difficulty from embedded questions
  if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
    const firstQuestionDifficulty = quiz.questions[0]?.difficulty || quiz.questions[0]?.level;
    if (firstQuestionDifficulty) {
      return firstQuestionDifficulty.charAt(0).toUpperCase() + firstQuestionDifficulty.slice(1).toLowerCase();
    }
  }
  
  // Try to detect from quiz title
  const titleLower = (quiz.title || '').toLowerCase();
  if (titleLower.includes('easy') || titleLower.includes('beginner') || titleLower.includes('basic')) {
    return 'Easy';
  }
  if (titleLower.includes('hard') || titleLower.includes('advanced') || titleLower.includes('difficult')) {
    return 'Hard';
  }
  if (titleLower.includes('medium') || titleLower.includes('intermediate')) {
    return 'Medium';
  }
  
  return null; // Return null if no difficulty can be determined
};

const Subjects = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [questionStats, setQuestionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);

  useEffect(() => {
    fetchQuizzes();
    fetchQuestionStats();
  }, []);

  const fetchQuestionStats = async () => {
    try {
      const response = await apiClient.get('/questions/stats');
      setQuestionStats(response.data);
    } catch (err) {
      console.warn('Could not fetch question stats:', err);
    }
  };

  const fetchQuizQuestionCount = async (quiz) => {
    const quizId = quiz.id || quiz._id;
    if (!quizId) return 0;
    try {
      const response = await apiClient.get(`/questions/quiz/${quizId}`);
      if (Array.isArray(response.data)) {
        return response.data.length;
      }
    } catch (err) {
      console.warn('Unable to load question count for quiz:', quizId, err);
    }
    return 0;
  };

  const enrichQuizData = async (quiz) => {
    const countFromQuiz = getQuizQuestionCount(quiz);
    const difficulty = getQuizDifficulty(quiz);
    
    let enrichedQuiz = { 
      ...quiz, 
      difficulty: difficulty
    };
    
    if (countFromQuiz > 0) {
      return { ...enrichedQuiz, totalQuestions: countFromQuiz };
    }
    const fetchedCount = await fetchQuizQuestionCount(quiz);
    return { ...enrichedQuiz, totalQuestions: fetchedCount };
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/quizzes');
      const quizzesData = Array.isArray(response.data) ? response.data : [];
      const quizzesWithCounts = await Promise.all(quizzesData.map(enrichQuizData));
      setQuizzes(quizzesWithCounts);
      setFilteredQuizzes(quizzesWithCounts);
      setError(null);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load subjects. Please try again.');
      const mockQuizzes = [
        { _id: '1', title: 'TNPSC General Knowledge', subject: 'TNPSC', difficulty: 'Easy', totalQuestions: 20, passingScore: 60 },
        { _id: '2', title: 'History Basics', subject: 'History', difficulty: 'Medium', totalQuestions: 15, passingScore: 70 },
        { _id: '3', title: 'Geography of Tamil Nadu', subject: 'Geography', difficulty: 'Medium', totalQuestions: 15, passingScore: 70 }
      ];
      setQuizzes(mockQuizzes);
      setFilteredQuizzes(mockQuizzes);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterBySubject = (subject) => {
    if (selectedSubject === subject) {
      setSelectedSubject(null);
      applyFilters(null, selectedDifficulty);
    } else {
      setSelectedSubject(subject);
      applyFilters(subject, selectedDifficulty);
    }
  };

  const handleFilterByDifficulty = (difficulty) => {
    if (selectedDifficulty === difficulty) {
      setSelectedDifficulty(null);
      applyFilters(selectedSubject, null);
    } else {
      setSelectedDifficulty(difficulty);
      applyFilters(selectedSubject, difficulty);
    }
  };

  const applyFilters = (subject, difficulty) => {
    let filtered = [...quizzes];
    if (subject) {
      filtered = filtered.filter(q => q.subject === subject);
    }
    if (difficulty) {
      // Check both difficulty and level fields (MongoDB uses 'level')
      filtered = filtered.filter(q => {
        const quizDifficulty = q.difficulty || q.level;
        return quizDifficulty?.toLowerCase() === difficulty.toLowerCase();
      });
    }
    setFilteredQuizzes(filtered);
  };

  const handleStartQuiz = (quiz) => {
    const id = quiz.id || quiz._id || quiz._id?.toString();
    navigate(`/quiz/${id}`, { state: { quiz } });
  };

  const uniqueSubjects = Array.isArray(quizzes) ? [...new Set(quizzes.map(q => q.subject).filter(Boolean))] : [];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 md:ml-64 pt-20 pb-24 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Subjects & Quizzes</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Choose a subject and test your knowledge</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            {loading ? (
              <Loader />
            ) : (
              <>
                {/* Subject Filter Tabs */}
                {uniqueSubjects.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Subject:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedSubject(null);
                          applyFilters(null, selectedDifficulty);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          selectedSubject === null
                            ? 'bg-gradient-primary text-white'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        All Subjects
                      </button>
                      {uniqueSubjects.map(subject => (
                        <button
                          key={subject}
                          onClick={() => handleFilterBySubject(subject)}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            selectedSubject === subject
                              ? 'bg-gradient-primary text-white'
                              : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Difficulty Filter Tabs */}
                <div className="mb-8">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Difficulty:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedDifficulty(null);
                        applyFilters(selectedSubject, null);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedDifficulty === null
                          ? 'bg-gradient-primary text-white'
                          : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      All Levels
                    </button>
                    {difficulties.map(difficulty => (
                      <button
                        key={difficulty}
                        onClick={() => handleFilterByDifficulty(difficulty)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          selectedDifficulty?.toLowerCase() === difficulty.toLowerCase()
                            ? getDifficultyColor(difficulty)
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        {difficulty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quiz Cards Grid */}
                {Array.isArray(filteredQuizzes) && filteredQuizzes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQuizzes.map(quiz => {
                      const difficultyValue = quiz.difficulty || quiz.level;
                      const difficultyLower = difficultyValue ? difficultyValue.toLowerCase() : null;
                      const quizTitle = quiz.title || `${quiz.subject} - ${difficultyValue || 'Quiz'}`;
                      return (
                        <div
                          key={quiz.id || quiz._id}
                          className="bg-white dark:bg-slate-800 rounded-xl shadow-card hover:shadow-card-hover transition-all border border-gray-200 dark:border-slate-700 overflow-hidden cursor-pointer transform hover:scale-105"
                          onClick={() => handleStartQuiz(quiz)}
                        >
                          <div className={`h-3 ${
                            difficultyLower === 'easy' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                            difficultyLower === 'medium' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            difficultyLower === 'hard' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                            'bg-gradient-primary'
                          }`}></div>
                          <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{quizTitle}</h3>
                            <div className="space-y-2 text-sm mb-6">
                              <p className="text-gray-600 dark:text-gray-400">
                                <span className="font-semibold">Subject:</span> {quiz.subject || 'General'}
                              </p>
                              {difficultyValue && (
                                <p className="text-gray-600 dark:text-gray-400">
                                  <span className="font-semibold">Difficulty:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(difficultyValue)}`}>{difficultyValue}</span>
                                </p>
                              )}
                              <p className="text-gray-600 dark:text-gray-400">
                                <span className="font-semibold">Questions:</span> {quiz.totalQuestions || 0}
                              </p>
                              {quiz.passingScore > 0 && (
                                <p className="text-gray-600 dark:text-gray-400">
                                  <span className="font-semibold">Passing Score:</span> {quiz.passingScore}%
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartQuiz(quiz);
                              }}
                              className={`w-full py-2 hover:opacity-90 text-white font-semibold rounded-lg transition-all ${
                                difficultyLower === 'easy' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                difficultyLower === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                difficultyLower === 'hard' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                'bg-gradient-primary'
                              }`}
                            >
                              Start Quiz
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No quizzes available</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Subjects;
