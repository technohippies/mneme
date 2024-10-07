import React, { useEffect } from 'react';
import { Song, Phrase } from '../../types';
import KeenSlider from '../containers/KeenSlider';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { useAuth } from '../../contexts/AuthContext';

interface HomePageProps {
  songs: Song[];
  phrases: Phrase[];
}

const HomePage: React.FC<HomePageProps> = ({ songs, phrases }) => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('HomePage: Auth state changed', { user, isAuthenticated });
  }, [user, isAuthenticated]);

  const userAddress = user?.address || '0x1234...5678';
  console.log('HomePage rendering with userAddress:', userAddress);

  return (
    <div className="flex flex-col h-screen w-full bg-neutral-900 text-neutral-100">
      <Header 
        streakLink="/streak" 
        settingsLink="/settings" 
        userAddress={userAddress}  // Add this line
      />
      <main className="flex-grow relative">
        <div className="absolute inset-0">
          <KeenSlider songs={songs} phrases={phrases} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;