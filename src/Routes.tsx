import { Route, Routes } from 'react-router-dom';
import StreakPage from './components/pages/StreakPage';
import SettingsPage from './components/pages/SettingsPage';
import DomainPage from "./components/pages/DomainPage";
import DecksListPage from './components/pages/DecksListPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { EditProfilePage } from './components/pages/EditProfilePage';
import DeckStudyPage from './components/pages/DeckStudyPage';
import FlashcardsPage from './components/pages/FlashcardsPage';
import StudyCompletionPage from './components/pages/StudyCompletionPage';
import SongListPage from './components/pages/SongListPage';
import StorePage from './components/pages/StorePage';
import { Navigate } from 'react-router-dom';
import KaraokeStudyPage from './components/pages/KaraokeStudyPage';
import SearchPage from './components/pages/SearchPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DecksListPage />} />
      <Route path="/streak" element={<StreakPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/domain" element={<DomainPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/edit" element={<EditProfilePage />} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/deck/:geniusSlug" element={<DeckStudyPage />} />
      <Route path="/deck/:geniusSlug/flashcards" element={<FlashcardsPage />} />
      <Route path="/study-completion/:geniusSlug" element={<StudyCompletionPage />} />
      <Route path="/songs" element={<SongListPage />} />
      <Route path="/u/:identifier" element={<ProfilePage />} />
      <Route path="/deck/:geniusSlug/karaoke" element={<KaraokeStudyPage />} />
      <Route path="/search" element={<SearchPage />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
