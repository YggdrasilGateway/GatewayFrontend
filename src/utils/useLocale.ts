import defaultLocale from '../locale';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

function useLocale(locale = null) {
  useTranslation();

  return (locale || defaultLocale)[i18next.language] || {};
}

export default useLocale;

export function useI10n(key: string) {
  return useTranslation().t(key);
}
