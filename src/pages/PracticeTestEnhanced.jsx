import React, { useState } from 'react';
import AnswerFeedbackModal from '../components/common/AnswerFeedbackModal';

/**
 * Enhanced PracticeTest page with answer feedback modal
 * Shows instant feedback when user answers a question
 */

const PracticeTest = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // Sample questions with explanations
  const sampleQuestions = [
    {
      id: 'q1',
      questionText: 'What is the capital of Tamil Nadu?',
      options: ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
      correctAnswerIndex: 0,
      explanation: 'Chennai is the capital city of Tamil Nadu, located on the Coromandel Coast of the Indian Ocean.'
    },
    {
      id: 'q2',
      questionText: 'Who wrote Thirukkural?',
      options: ['Ilango Adikal', 'Tiruvalluvar', 'Kambar', 'Bana'],
      correctAnswerIndex: 1,
      explanation: 'Thirukkural was written by Tiruvalluvar, a famous Tamil poet and philosopher.'
    },
    {
      id: 'q3',
      questionText: 'What is 15 × 8?',
      options: ['100', '110', '120', '130'],
      correctAnswerIndex: 2,
      explanation: '15 × 8 = 120. This is a basic multiplication fact.'
    }
  ];

  const currentQuestion = sampleQuestions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.correctAnswerIndex;
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      alert('Test completed! View results.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Practice Test</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Question {currentQuestionIndex + 1} of {sampleQuestions.length}
          </div>
        </div>
        <div className="mt-2 w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            style={{ width: `${((currentQuestionIndex + 1) / sampleQuestions.length) * 100}%` }}
            className="h-full bg-gradient-primary transition-all duration-300"
          ></div>
        </div>
      </div>

      {/* Question Section */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-slate-700">
          {/* Question */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{currentQuestion.questionText}</h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-primary-500'
                } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAnswer === index ? 'border-current' : 'border-gray-400 dark:border-slate-500'}`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-lg text-gray-900 dark:text-white font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answer Feedback Modal */}
      <AnswerFeedbackModal
        isOpen={showFeedback}
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        isCorrect={isCorrect}
        onClose={handleContinue}
      />
    </div>
  );
};

export default PracticeTest;
