import React, {useEffect, useState, useMemo } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { quantum } from 'ldrs'
import { useAuth } from './contexts/AuthContext';

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
import SongListPage from './components/pages/SongListPage';
import { EditProfilePage } from './components/pages/EditProfilePage';  // Add this import
import StorePage from './components/pages/StorePage';  // Add this import

// Register the quantum loader
quantum.register();

const AppContent: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Remove the useEffect hook that was calling setupXMTP

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
    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-50">
      <l-quantum
        size="45"
        speed="1.75" 
        color="white" 
      ></l-quantum>
    </div>
  ), []);

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

  return (
    <AuthWrapper>
      <Routes>
        <Route path="/" element={
          <LayoutWrapper>
            {isLoading ? (
              <LoadingScreen />
            ) : (
              <div className="h-full">
                <KeenSlider 
                  songs={songs} 
                  phrases={phrases} 
                />
              </div>
            )}
          </LayoutWrapper>
        } />
        <Route path="/streak" element={<StreakPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/domain" element={<DomainPage />} />
        <Route path="/decks" element={
          <LayoutWrapper>
            <DecksListPage />
          </LayoutWrapper>
        } />
        <Route path="/profile" element={
          <LayoutWrapper>
            <ProfilePage />
          </LayoutWrapper>
        } />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/store" element={<StorePage />} />  // Add this new route
        <Route path="/deck/:geniusSlug" element={<DeckStudyPage />} />
        <Route path="/deck/:geniusSlug/flashcards" element={<FlashcardsPage />} />
        <Route path="/study-completion/:geniusSlug" element={<StudyCompletionPage />} />
        <Route path="/songs" element={
          <LayoutWrapper>
            <SongListPage />
          </LayoutWrapper>
        } />
      </Routes>
    </AuthWrapper>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;