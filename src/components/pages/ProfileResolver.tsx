import React from 'react';
import { useParams } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';
import { getName } from '../../services/namestoneService';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { useAuth } from '../../contexts/AuthContext';

const ProfileResolver: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const [profileData, setProfileData] = React.useState<any | null>(null);
  const { user } = useAuth();

  React.useEffect(() => {
    console.log('ProfileResolver rendered');
    console.log('Identifier:', identifier);

    const fetchProfile = async () => {
      if (identifier) {
        const data = await getName(identifier);
        console.log('Fetched profile data:', data);
        setProfileData(data && data.length > 0 ? data[0] : null);
      }
    };

    fetchProfile();
  }, [identifier]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-neutral-100">
      <Header 
        streakLink="/streak" 
        settingsLink="/settings" 
        userAddress={user?.address || ''}
      />
      <main className="flex-grow">
        {!profileData ? (
          <div className="flex items-center justify-center h-full">Loading...</div>
        ) : (
          <ProfilePage />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default React.memo(ProfileResolver);