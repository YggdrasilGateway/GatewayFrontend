import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

export const languages = ['zh-CN', 'en-US'];

const initLanguage =
  localStorage.getItem('arco-lang') || window.navigator.language;

export const defaultLanguage = 'zh-CN';

i18next.use(initReactI18next).init({
  debug: true,
  lng: languages.includes(initLanguage) ? initLanguage : defaultLanguage,
  fallbackLng: defaultLanguage,
  // ns: [],
  resources: {},
});
i18next.on('languageChanged', (e) => {
  localStorage.setItem('arco-lang', e);
});

export {};
