import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslate } from '../hooks/useTranslate';

/**
 * Example component showing how to use translations in your app
 */
const TranslationDemo = () => {
  const { language, changeLanguage, t, translate, translateFromEnglish, isEnglish, isTamil } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);

  // Example 1: Use t() for pre-defined common translations
  const dashboardText = t('dashboard');
  const welcomeText = t('welcome');

  // Example 2: Use useTranslate hook for automatic translation
  const autoTranslated = useTranslate('Welcome to TN Government Exam Preparation Platform!');

  // Example 3: Manual translation with button click
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    try {
      const result = await translateFromEnglish(inputText);
      setTranslatedText(result);
    } catch (error) {
      console.error('Translation failed:', error);
      setTranslatedText('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Google Translate Integration Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Current Language: <span className="font-semibold">{isEnglish ? 'English 🇬🇧' : 'தமிழ் 🇮🇳'}</span>
          </p>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isEnglish 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => changeLanguage('ta')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isTamil 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              🇮🇳 தமிழ்
            </button>
          </div>
        </div>

        {/* Example 1: Pre-defined translations using t() */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            ✅ Example 1: Pre-defined Translations
          </h2>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Using t('dashboard'):</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{dashboardText}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Common words:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['dashboard', 'books', 'subjects', 'profile', 'logout', 'save', 'delete'].map(key => (
                  <span key={key} className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm font-medium">
                    {t(key)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Example 2: Automatic translation with hook */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            🔄 Example 2: Automatic Translation (useTranslate hook)
          </h2>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Original: "Welcome to TN Government Exam Preparation Platform!"
            </p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {autoTranslated}
            </p>
          </div>
        </div>

        {/* Example 3: Manual translation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            🌐 Example 3: Manual Translation
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter text in English:
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="Type something in English..."
              />
            </div>
            
            <button
              onClick={handleTranslate}
              disabled={loading || !inputText.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Translating...' : `Translate to ${isTamil ? 'Tamil' : 'English'}`}
            </button>

            {translatedText && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Translation:</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{translatedText}</p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Guide */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4">📝 How to Use in Your Components</h2>
          <div className="space-y-3 text-sm">
            <div className="bg-white/10 rounded p-3">
              <p className="font-semibold mb-1">1. For common UI text (recommended):</p>
              <code className="block bg-black/30 p-2 rounded mt-1 font-mono text-xs">
                const {`{ t }`} = useLanguage();<br />
                &lt;button&gt;{`{t('save')}`}&lt;/button&gt;
              </code>
            </div>
            
            <div className="bg-white/10 rounded p-3">
              <p className="font-semibold mb-1">2. For automatic translation of any text:</p>
              <code className="block bg-black/30 p-2 rounded mt-1 font-mono text-xs">
                const translated = useTranslate("Your text here");
              </code>
            </div>
            
            <div className="bg-white/10 rounded p-3">
              <p className="font-semibold mb-1">3. For dynamic content (quiz questions, etc.):</p>
              <code className="block bg-black/30 p-2 rounded mt-1 font-mono text-xs">
                const {`{ translateFromEnglish }`} = useLanguage();<br />
                const result = await translateFromEnglish(question.text);
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationDemo;
