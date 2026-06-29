import React from 'react';

const AnswerFeedbackModal = ({ isOpen, question, selectedAnswer, isCorrect, onClose }) => {
  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6">
        {/* Result Icon */}
        <div className="text-center mb-4">
          <div className={`text-6xl mb-3 ${isCorrect ? '✅' : '❌'}`}></div>
          <h2 className={`text-xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? 'Great!' : 'Incorrect'}
          </h2>
        </div>

        {/* Question */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Question</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">{question.questionText}</p>
        </div>

        {/* Your Answer */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Answer</p>
          <p className={`text-base font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {question.options?.[selectedAnswer] || 'Not answered'}
          </p>
        </div>

        {/* Correct Answer */}
        {!isCorrect && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Correct Answer</p>
            <p className="text-base font-semibold text-green-600">{question.options?.[question.correctAnswerIndex] || 'N/A'}</p>
          </div>
        )}

        {/* Explanation */}
        {question.explanation && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Explanation</p>
            <p className="text-sm text-gray-900 dark:text-gray-100">{question.explanation}</p>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default AnswerFeedbackModal;
