import React, { createContext, useState, useContext, useEffect } from 'react';
import { getLanguage, setLanguage as saveLanguage } from '../services/storageService';
import { translateText, commonTranslations, getTranslation } from '../services/translationService';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return { 
      language: 'en', 
      changeLanguage: () => {}, 
      t: (key) => key,
      translate: (text) => text
    };
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    try {
      const savedLang = getLanguage();
      if (savedLang) {
        const normalizedLang = savedLang.toLowerCase();
        setLanguage(normalizedLang === 'ta' || normalizedLang === 'tamil' ? 'ta' : 'en');
      }
    } catch (e) {
      console.error('Error loading language:', e);
      setLanguage('en');
    }
  }, []);

  const changeLanguage = (lang) => {
    try {
      const normalizedLang = lang.toLowerCase() === 'ta' || lang.toLowerCase() === 'tamil' ? 'ta' : 'en';
      setLanguage(normalizedLang);
      saveLanguage(normalizedLang);
    } catch (e) {
      console.error('Error changing language:', e);
    }
  };

  // Get translation from common translations or key
  const t = (key) => {
    return commonTranslations[language]?.[key] || key;
  };

  // Translate any text dynamically using MyMemory API
  const translate = async (text, sourceLang = 'en') => {
    if (!text) return text;
    
    const targetLang = language;
    if (sourceLang === targetLang) return text;
    
    try {
      return await translateText(text, sourceLang, targetLang);
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  // Translate from English to current language
  const translateFromEnglish = async (text) => {
    return await translate(text, 'en');
  };

  // Translate to English from current language
  const translateToEnglish = async (text) => {
    return await translateText(text, language, 'en');
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      changeLanguage, 
      t,
      translate,
      translateFromEnglish,
      translateToEnglish,
      isEnglish: language === 'en',
      isTamil: language === 'ta'
    }}>
      {children}
    </LanguageContext.Provider>
  );
};