import React, { useEffect, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTranslation } from 'react-i18next';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import StreakPage from './components/pages/StreakPage';
import SettingsPage from './components/pages/SettingsPage';
import { AuthWrapper } from './components/auth/AuthWrapper';
import { ProfilePage } from "./components/pages/ProfilePage";
import DomainPage from "./components/pages/DomainPage";
import DecksListPage from './components/pages/DecksListPage';
import DeckStudyPage from './components/pages/DeckStudyPage';
import FlashcardsPage from './components/pages/FlashcardsPage';
import StudyCompletionPage from './components/pages/StudyCompletionPage';
import SearchPage from './components/pages/SearchPage';

const AppContent: React.FC = () => {
  const { user, setLanguage } = useAuth();
  const { i18n } = useTranslation();

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
            <DecksListPage />
          </LayoutWrapper>
        </AuthWrapper>
      } />
      <Route path="/streak" element={<AuthWrapper><StreakPage /></AuthWrapper>} />
      <Route path="/settings" element={<AuthWrapper><SettingsPage /></AuthWrapper>} />
      <Route path="/domain" element={<AuthWrapper><DomainPage /></AuthWrapper>} />
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
      <Route path="/search" element={
        <AuthWrapper>
          <LayoutWrapper>
            <SearchPage />
          </LayoutWrapper>
        </AuthWrapper>
      } />
    </Routes>
  );
};

export default AppContent;
