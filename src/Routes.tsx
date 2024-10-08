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
import KeenSlider from './components/containers/KeenSlider';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<KeenSlider songs={[]} phrases={[]} />} />
      <Route path="/streak" element={<StreakPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/domain" element={<DomainPage />} />
      <Route path="/decks" element={<DecksListPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/edit" element={<EditProfilePage />} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/deck/:geniusSlug" element={<DeckStudyPage />} />
      <Route path="/deck/:geniusSlug/flashcards" element={<FlashcardsPage />} />
      <Route path="/study-completion/:geniusSlug" element={<StudyCompletionPage />} />
      <Route path="/songs" element={<SongListPage />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;