import React from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLocales, languageNames, SupportedLocale } from '../../config/languages';
import { Checkbox } from '../ui/checkbox';

interface LanguageSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: { value: string; label: string }[];
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange, options }) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    if (onChange) {
      onChange(lang);
    } else {
      i18n.changeLanguage(lang as SupportedLocale);
      localStorage.setItem('userLanguage', lang);
    }
  };

  const languagesToRender = options || supportedLocales.map(lang => ({
    value: lang,
    label: languageNames[lang as SupportedLocale].native
  }));

  return (
    <ul className="space-y-2">
      {languagesToRender.map((lang) => (
        <li 
          key={lang.value} 
          className="flex items-center justify-between p-3 bg-neutral-800 hover:bg-neutral-700 rounded-md overflow-hidden shadow-sm transition-colors duration-200 cursor-pointer"
          onClick={() => handleLanguageChange(lang.value)}
        >
          <span className="text-neutral-200">{lang.label}</span>
          <Checkbox
            checked={value ? value === lang.value : i18n.language === lang.value}
            onCheckedChange={() => handleLanguageChange(lang.value)}
            className="border-neutral-500"
          />
        </li>
      ))}
    </ul>
  );
};

export default LanguageSelector;
