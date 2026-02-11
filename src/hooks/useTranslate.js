import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Custom hook for translating text with automatic re-render on language change
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language (default: 'en')
 * @returns {string} Translated text
 */
export const useTranslate = (text, sourceLang = 'en') => {
  const { translate, language } = useLanguage();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let isMounted = true;

    const doTranslation = async () => {
      if (!text) {
        setTranslated('');
        return;
      }

      if (sourceLang === language) {
        setTranslated(text);
        return;
      }

      try {
        const result = await translate(text, sourceLang);
        if (isMounted) {
          setTranslated(result);
        }
      } catch (error) {
        console.error('Translation error:', error);
        if (isMounted) {
          setTranslated(text);
        }
      }
    };

    doTranslation();

    return () => {
      isMounted = false;
    };
  }, [text, language, sourceLang, translate]);

  return translated;
};

/**
 * Custom hook for translating multiple texts
 * @param {string[]} texts - Array of texts to translate
 * @param {string} sourceLang - Source language (default: 'en')
 * @returns {string[]} Array of translated texts
 */
export const useTranslateMultiple = (texts, sourceLang = 'en') => {
  const { translate, language } = useLanguage();
  const [translated, setTranslated] = useState(texts);

  useEffect(() => {
    let isMounted = true;

    const doTranslations = async () => {
      if (!texts || texts.length === 0) {
        setTranslated([]);
        return;
      }

      if (sourceLang === language) {
        setTranslated(texts);
        return;
      }

      try {
        const results = await Promise.all(
          texts.map(text => translate(text, sourceLang))
        );
        if (isMounted) {
          setTranslated(results);
        }
      } catch (error) {
        console.error('Translation error:', error);
        if (isMounted) {
          setTranslated(texts);
        }
      }
    };

    doTranslations();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(texts), language, sourceLang, translate]);

  return translated;
};
