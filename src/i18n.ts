import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import engTranslations from './locales/eng.json';
import cmnTranslations from './locales/cmn.json';
import jpnTranslations from './locales/jpn.json';
import korTranslations from './locales/kor.json'; // Add this line

console.log('Navigator language:', navigator.language);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      eng: { translation: engTranslations },
      cmn: { translation: cmnTranslations },
      jpn: { translation: jpnTranslations },
      kor: { translation: korTranslations }, // Add this line
    },
    fallbackLng: 'eng',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
    },
    supportedLngs: ['eng', 'cmn', 'jpn', 'kor'],
    nonExplicitSupportedLngs: true,
  });

i18n.on('languageChanged', (lng) => {
  console.log('Language changed to:', lng);
});

export default i18n;