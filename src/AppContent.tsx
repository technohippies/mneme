import React, { useEffect, useState, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTranslation } from 'react-i18next'; // Add this import
import { motion } from 'framer-motion'; // Add this import
import loadingImage from '/images/loading-image.png';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import StreakPage from './components/pages/StreakPage';
import SettingsPage from './components/pages/SettingsPage';
import { AuthWrapper } from './components/auth/AuthWrapper';
import { songService } from './services/orbis/songService';
import { phraseService } from './services/orbis/phraseService';
import { Song, Phrase } from './types/index';
import { ProfilePage } from "./components/pages/ProfilePage";
import DomainPage from "./components/pages/DomainPage";
import DecksListPage from './components/pages/DecksListPage';
import DeckStudyPage from './components/pages/DeckStudyPage';
import FlashcardsPage from './components/pages/FlashcardsPage';
import StudyCompletionPage from './components/pages/StudyCompletionPage';
import KeenSlider from './components/containers/KeenSlider';

const AppContent: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, setLanguage } = useAuth();
  const { t, i18n } = useTranslation(); // Add this line

  useEffect(() => {
    const fetchData = async () => {
      const fetchedSongs = await songService.getSongs();
      console.log('App: Fetched songs', fetchedSongs);
      setSongs(fetchedSongs);

      const allPhrases = await Promise.all(
        fetchedSongs.map(song => phraseService.getPhrases(song.uuid))
      );
      setPhrases(allPhrases.flat() as Phrase[]);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const LoadingScreen = useMemo(() => () => (
    <div className="flex-grow flex flex-col items-center justify-center h-screen">
      <motion.img 
        src={loadingImage} 
        alt="Loading" 
        className="w-48 h-48 object-contain"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <p className="mt-4">{t('loading')}</p>
    </div>
  ), [t]); // Add t to the dependency array

  const LayoutWrapper = useMemo(() => React.memo<{ children: React.ReactNode }>(({ children }) => (
    <div className="flex flex-col h-screen bg-neutral-900 text-neutral-100">
      <Header 
        streakLink="/streak" 
        settingsLink="/settings" 
        userAddress={user?.address || ''}
      />
      <main className="flex-grow overflow-hidden">{children}</main>
      <Footer />
    </div>
  )), [user]);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('userLanguage');
    if (storedLanguage) {
      setLanguage(storedLanguage);
    } else {
      setLanguage(navigator.language);
    }
  }, [setLanguage]);

  useEffect(() => {
    console.log('Current language:', i18n.language);
    console.log('Available languages:', i18n.languages);
    console.log('Is Chinese initialized:', i18n.hasResourceBundle('cmn', 'translation'));
    console.log('Is English initialized:', i18n.hasResourceBundle('eng', 'translation'));
    console.log('Is Japanese initialized:', i18n.hasResourceBundle('jpn', 'translation'));
  }, [i18n]);

  return (
    <Routes>
      <Route path="/" element={
        <AuthWrapper>
          <LayoutWrapper>
            {isLoading ? (
              <LoadingScreen />
            ) : (
              <KeenSlider songs={songs} phrases={phrases} />
            )}
          </LayoutWrapper>
        </AuthWrapper>
      } />
      <Route path="/streak" element={<AuthWrapper><StreakPage /></AuthWrapper>} />
      <Route path="/settings" element={<AuthWrapper><SettingsPage /></AuthWrapper>} />
      <Route path="/domain" element={<AuthWrapper><DomainPage /></AuthWrapper>} />
      <Route path="/decks" element={
        <AuthWrapper>
          <LayoutWrapper>
            <DecksListPage />
          </LayoutWrapper>
        </AuthWrapper>
      } />
      <Route path="/profile" element={
        <AuthWrapper>
          <LayoutWrapper>
            <ProfilePage />
          </LayoutWrapper>
        </AuthWrapper>
      } />
      <Route path="/deck/:geniusSlug" element={<AuthWrapper><DeckStudyPage /></AuthWrapper>} />
      <Route path="/deck/:geniusSlug/flashcards" element={<AuthWrapper><FlashcardsPage /></AuthWrapper>} />
      <Route path="/study-completion/:geniusSlug" element={<AuthWrapper><StudyCompletionPage /></AuthWrapper>} />
    </Routes>
  );
};

export default AppContent;
