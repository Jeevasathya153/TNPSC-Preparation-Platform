import { useTranslate } from '../../hooks/useTranslate';

/**
 * Simple component to translate text inline
 * Usage: <T>Your text here</T>
 */
export const T = ({ children }) => {
  const translated = useTranslate(children || '');
  return translated;
};

export default T;
