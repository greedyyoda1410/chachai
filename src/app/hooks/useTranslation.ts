import { useApp } from '../contexts/AppContext';
import { getTranslations, Translations } from '../locales';

export const useTranslation = (): Translations => {
  const { language } = useApp();
  return getTranslations(language);
};
