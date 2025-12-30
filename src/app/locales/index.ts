import { en, Translations } from './en';
import { bn } from './bn';
import { Language } from '../contexts/AppContext';

const translations: Record<Language, Translations> = {
  en,
  bn,
};

export const getTranslations = (language: Language): Translations => {
  return translations[language];
};

export { en, bn };
export type { Translations };
