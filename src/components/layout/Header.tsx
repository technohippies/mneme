import React, { useState, useEffect } from 'react';
import { Flame, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { getStreakData } from '../../services/orbis/streakService';
import { useTranslation } from 'react-i18next';
import { SupportedLocale, languageNames } from '../../config/languages';

interface HeaderProps {
  streakLink: string;
  settingsLink: string;
  userAddress: string;
}

const Header: React.FC<HeaderProps> = ({ settingsLink, userAddress }) => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchStreakData = async () => {
      if (userAddress) {
        try {
          const data = await getStreakData(userAddress);
          setCurrentStreak(data.currentStreak);
        } catch (error) {
          console.error('Error fetching streak data:', error);
          setCurrentStreak(0);
        }
      }
    };

    fetchStreakData();
  }, [userAddress]);

  const getLocalizedLanguageText = () => {
    const currentLang = i18n.language.split('-')[0] as SupportedLocale;
    
    // If the current language is English, return "Spanish for English"
    if (currentLang === 'eng') {
      return t('spanishForEnglish', 'Spanish for English');
    }
    
    const nativeName = languageNames[currentLang]?.native || currentLang;
    
    // For other languages, use the "English for [Language]" format
    return t('englishFor', { language: nativeName });
  };

  const languageText = getLocalizedLanguageText();

  return (
    <div className="flex items-center justify-between bg-neutral-900 border-b border-neutral-800 border-border p-4">
      <Button 
        asChild 
        className="bg-transparent text-red-500 hover:text-red-400 hover:bg-neutral-800 active:bg-neutral-700 active:text-red-300"
      >
        <a 
          href="https://www.stack.so/leaderboard/scarlett-karaoke" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center"
        >
          <Flame className="w-5 h-5 mr-2" />
          <span className="font-bold">{currentStreak}</span>
        </a>
      </Button>
      <Button 
        asChild 
        className="bg-transparent text-neutral-300 hover:text-neutral-200 hover:bg-neutral-800 active:bg-neutral-700 active:text-neutral-100"
      >
        <Link to={settingsLink} className="flex items-center">
          <span className="mr-2">{languageText}</span>
          <Settings className="w-5 h-5" />
        </Link>
      </Button>
    </div>
  );
};

export default Header;
