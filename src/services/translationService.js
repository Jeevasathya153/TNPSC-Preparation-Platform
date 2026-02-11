// Translation Service using MyMemory API via Backend
const API_BASE_URL = 'http://localhost:8080/api';

// Cache for translations to avoid repeated API calls
const translationCache = new Map();

/**
 * Translate text from one language to another using MyMemory API
 * @param {string} text - Text to translate
 * @param {string} from - Source language code (en, ta)
 * @param {string} to - Target language code (en, ta)
 * @returns {Promise<string>} Translated text
 */
export const translateText = async (text, from, to) => {
  // Return original text if same language
  if (from === to || !text) {
    return text;
  }

  // Check cache first
  const cacheKey = `${from}-${to}-${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        from: from,
        to: to
      })
    });
    
    const data = await response.json();
    const translatedText = data.translated || text;
    
    // Store in cache
    translationCache.set(cacheKey, translatedText);
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
};

/**
 * Translate multiple texts at once using batch API
 * @param {string[]} texts - Array of texts to translate
 * @param {string} from - Source language
 * @param {string} to - Target language
 * @returns {Promise<string[]>} Array of translated texts
 */
export const translateMultiple = async (texts, from, to) => {
  if (!texts || texts.length === 0) {
    return [];
  }

  // Check cache for all texts first
  const cachedResults = [];
  const uncachedTexts = [];
  const uncachedIndexes = [];

  texts.forEach((text, index) => {
    const cacheKey = `${from}-${to}-${text}`;
    if (translationCache.has(cacheKey)) {
      cachedResults[index] = translationCache.get(cacheKey);
    } else {
      uncachedTexts.push(text);
      uncachedIndexes.push(index);
    }
  });

  // If all cached, return immediately
  if (uncachedTexts.length === 0) {
    return cachedResults;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/translate/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: uncachedTexts,
        from: from,
        to: to
      })
    });
    
    const data = await response.json();
    const translations = data.translations || [];

    // Store in cache and fill results
    translations.forEach((item, i) => {
      const originalIndex = uncachedIndexes[i];
      const translated = item.translated || item.original;
      cachedResults[originalIndex] = translated;
      
      const cacheKey = `${from}-${to}-${item.original}`;
      translationCache.set(cacheKey, translated);
    });

    return cachedResults;
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts; // Return original texts on error
  }
};

/**
 * Translate an object's values
 * @param {Object} obj - Object with string values
 * @param {string} from - Source language
 * @param {string} to - Target language
 * @returns {Promise<Object>} Object with translated values
 */
export const translateObject = async (obj, from, to) => {
  const translated = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      translated[key] = await translateText(value, from, to);
    } else if (typeof value === 'object' && value !== null) {
      translated[key] = await translateObject(value, from, to);
    } else {
      translated[key] = value;
    }
  }
  
  return translated;
};

/**
 * Clear translation cache
 */
export const clearTranslationCache = () => {
  translationCache.clear();
};

/**
 * Pre-translate common phrases for the app
 */
export const commonTranslations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    books: 'Books',
    subjects: 'Subjects',
    myProgress: 'My Progress',
    practiceTest: 'Practice Test',
    results: 'Results',
    notifications: 'Notifications',
    profile: 'Profile',
    logout: 'Logout',
    
    // Common actions
    start: 'Start',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    download: 'Download',
    
    // Messages
    loading: 'Loading...',
    success: 'Success!',
    error: 'Error occurred',
    noData: 'No data available',
    
    // Quiz
    question: 'Question',
    answer: 'Answer',
    correct: 'Correct',
    incorrect: 'Incorrect',
    score: 'Score',
    timeTaken: 'Time Taken',
    
    // Profile
    settings: 'Settings',
    achievements: 'Achievements',
    statistics: 'Statistics',
    theme: 'Theme',
    language: 'Language',
    
    // Exams
    examDate: 'Exam Date',
    applicationDeadline: 'Application Deadline',
    announcement: 'Announcement'
  },
  ta: {
    // Navigation
    dashboard: 'முகப்பு',
    books: 'புத்தகங்கள்',
    subjects: 'பாடங்கள்',
    myProgress: 'எனது முன்னேற்றம்',
    practiceTest: 'பயிற்சி தேர்வு',
    results: 'முடிவுகள்',
    notifications: 'அறிவிப்புகள்',
    profile: 'சுயவிவரம்',
    logout: 'வெளியேறு',
    
    // Common actions
    start: 'தொடங்கு',
    submit: 'சமர்ப்பி',
    cancel: 'ரத்து செய்',
    save: 'சேமி',
    delete: 'நீக்கு',
    edit: 'திருத்து',
    view: 'பார்',
    download: 'பதிவிறக்கு',
    
    // Messages
    loading: 'ஏற்றுகிறது...',
    success: 'வெற்றி!',
    error: 'பிழை ஏற்பட்டது',
    noData: 'தரவு இல்லை',
    
    // Quiz
    question: 'கேள்வி',
    answer: 'பதில்',
    correct: 'சரியானது',
    incorrect: 'தவறானது',
    score: 'மதிப்பெண்',
    timeTaken: 'எடுத்த நேரம்',
    
    // Profile
    settings: 'அமைப்புகள்',
    achievements: 'சாதனைகள்',
    statistics: 'புள்ளிவிவரங்கள்',
    theme: 'தீம்',
    language: 'மொழி',
    
    // Exams
    examDate: 'தேர்வு தேதி',
    applicationDeadline: 'விண்ணப்ப கடைசி நாள்',
    announcement: 'அறிவிப்பு'
  }
};

/**
 * Get translated text from common translations or translate on-the-fly
 * @param {string} key - Translation key
 * @param {string} language - Target language
 * @returns {Promise<string>} Translated text
 */
export const getTranslation = async (key, language) => {
  // Try common translations first
  if (commonTranslations[language]?.[key]) {
    return commonTranslations[language][key];
  }
  
  // Fall back to dynamic translation
  if (language === 'ta' && commonTranslations.en[key]) {
    return await translateText(commonTranslations.en[key], 'en', 'ta');
  }
  
  return key; // Return key if no translation found
};
