import React from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLocales, languageNames, SupportedLocale } from '../../config/languages';
import { Checkbox } from '../ui/checkbox';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: SupportedLocale) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('userLanguage', lang);
  };

  return (
    <ul className="space-y-2">
      {supportedLocales.map((lang) => (
        <li 
          key={lang} 
          className="flex items-center justify-between p-3 bg-neutral-800 hover:bg-neutral-700 rounded-md overflow-hidden shadow-sm transition-colors duration-200 cursor-pointer"
          onClick={() => handleLanguageChange(lang)}
        >
          <span className="text-neutral-200">{languageNames[lang].native}</span>
          <Checkbox
            checked={i18n.language === lang}
            onCheckedChange={() => handleLanguageChange(lang)}
            className="border-neutral-500"
          />
        </li>
      ))}
    </ul>
  );
};

export default LanguageSelector;