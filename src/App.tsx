import React, {useEffect, useMemo } from 'react';
import { HashRouter, BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
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
import { EditProfilePage } from './components/pages/EditProfilePage';  // Add this import
import StorePage from './components/pages/StorePage';  // Add this import
import MatchStudyPage from './components/pages/MatchStudyPage';  // Add this import
import KaraokeStudyPage from './components/pages/KaraokeStudyPage';  // Add this import
import SearchPage from './components/pages/SearchPage'; // Add this import

const AppContent: React.FC = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    const userLanguage = navigator.language.split('-')[0];
    i18n.changeLanguage(userLanguage);
  }, [i18n]);

  const LayoutWrapper = useMemo(() => React.memo<{ children: React.ReactNode }>(({ children }) => (
    <div className="flex flex-col h-screen bg-neutral-900 text-neutral-100">
      <Header 
        streakLink="/streak" 
        settingsLink="/settings" 
        userAddress={user?.address || ''}
      />
      <main className="flex-grow overflow-hidden relative">{children}</main>
      <Footer />
    </div>
  )), [user]);

  const routeContent = (
    <AuthWrapper>
      <Routes>
        <Route path="/" element={
          <LayoutWrapper>
            <DecksListPage />
          </LayoutWrapper>
        } />
        <Route path="/streak" element={<StreakPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/domain" element={<DomainPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/u/:identifier" element={<ProfilePage />} />
        <Route path="/deck/:geniusSlug" element={<DeckStudyPage />} />
        <Route path="/deck/:geniusSlug/flashcards" element={<FlashcardsPage />} />
        <Route path="/study-completion/:geniusSlug" element={<StudyCompletionPage />} />
        <Route path="/deck/:geniusSlug/match" element={<MatchStudyPage />} />
        <Route path="/deck/:geniusSlug/karaoke" element={<KaraokeStudyPage />} />
        <Route path="/search" element={
          <LayoutWrapper>
            <SearchPage />
          </LayoutWrapper>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthWrapper>
  );

  return routeContent;
};

const App: React.FC = () => {
  const isHashRouter = window.location.hash.startsWith('#/');

  return isHashRouter ? (
    <HashRouter>
      <AppContent />
    </HashRouter>
  ) : (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
