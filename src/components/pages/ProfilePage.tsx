import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Clipboard, AlertTriangle, Share2, Check } from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from '../../contexts/AuthContext';
import { 
  checkIfUserHasList,
  getEFPUserStats,
  getEFPUserENS
} from '../../services/efp/efpService';
import { getStreakData } from '../../services/orbis/streakService';
import { useAccount } from 'wagmi';
import { orbit, dotStream } from 'ldrs';
import { getProfileData } from '../../services/namestoneService';
import CloseHeader from '../layout/CloseHeader';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";

// Register the orbit and dotStream loaders
orbit.register();
dotStream.register();

export function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { identifier } = useParams<{ identifier?: string }>();
  const [profileData, setProfileData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ topStreak: 0, followers: 0, following: 0 });
  const { address: currentUserAddress } = useAccount();
  const [hasEFPList, setHasEFPList] = useState<boolean | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    console.log('Loading profile for identifier:', identifier);
    try {
      let profileIdentifier = identifier || user?.address || '';
      
      const [namestoneData, efpStats, efpENS] = await Promise.all([
        getProfileData(profileIdentifier),
        getEFPUserStats(profileIdentifier),
        getEFPUserENS(profileIdentifier)
      ]);

      console.log('Namestone Profile Data:', JSON.stringify(namestoneData, null, 2));
      console.log('EFP Stats:', JSON.stringify(efpStats, null, 2));
      console.log('EFP ENS Data:', JSON.stringify(efpENS, null, 2));

      if (namestoneData || efpENS) {
        const mergedProfileData = {
          ...namestoneData,
          ens: efpENS,
          address: namestoneData?.address || efpENS?.address
        };
        setProfileData(mergedProfileData);
        setIsOwnProfile(mergedProfileData.address === currentUserAddress);

        const streakData = await getStreakData(mergedProfileData.address);
        console.log('Streak Data:', streakData);

        setStats({
          topStreak: streakData.topStreak,
          followers: parseInt(efpStats?.followers_count || '0'),
          following: parseInt(efpStats?.following_count || '0')
        });

        const userHasList = await checkIfUserHasList(mergedProfileData.address);
        setHasEFPList(userHasList);
      } else {
        console.error('No profile data returned');
        setProfileData(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  }, [identifier, user, currentUserAddress]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const truncateAddress = useMemo(() => (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  const handleClose = useCallback(() => {
    if (location.key === "default") {
      // If there's no history, navigate to the home page
      navigate('/');
    } else {
      // Otherwise, go back
      navigate(-1);
    }
  }, [navigate, location]);

  const ShareDrawerContent = () => {
    const [localCopiedStates, setLocalCopiedStates] = useState<{[key: string]: boolean}>({});

    const handleLocalCopy = useCallback((text: string, key: string) => {
      navigator.clipboard.writeText(text);
      setLocalCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setLocalCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    }, []);

    return (
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Share</DrawerTitle>
        </DrawerHeader>
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-neutral-400 mb-1">Ethereum Address</p>
            <div className="flex justify-between items-center">
              <p className="text-sm">{profileData?.address}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLocalCopy(profileData?.address || '', 'address');
                }}
              >
                {localCopiedStates['address'] ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Clipboard className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          {profileData?.names && profileData.names.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-neutral-400 mb-1">Domain Names</p>
              {profileData.names.map((name: string, index: number) => (
                <div key={index} className="flex justify-between items-center mt-1">
                  <p className="text-sm">{name}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLocalCopy(name, `name-${index}`);
                    }}
                  >
                    {localCopiedStates[`name-${index}`] ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clipboard className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <DrawerFooter className="space-y-2">
          <Button 
            variant="blue" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://eth.blockscout.com/address/${profileData?.address}`, '_blank');
            }}
          >
            View on Blockscout
          </Button>
          <Button 
            variant="blue" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://xmtp.chat/dm/${profileData?.address}`, '_blank');
            }}
          >
            {isOwnProfile ? "Visit XMTP" : "Message on XMTP"}
          </Button>
          <DrawerClose asChild>
            <Button variant="secondary" className="w-full">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    );
  };

  const handleFollowClick = useCallback(() => {
    if (profileData?.address) {
      window.open(`https://ethfollow.xyz/${profileData.address}`, '_blank');
    }
  }, [profileData?.address]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-neutral-900">
        <l-orbit size="40" speed="1.5" color="white"></l-orbit>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-neutral-900 text-white">
        <p className="text-2xl mb-4">Profile not found</p>
        <Button onClick={() => navigate('/')} variant="blue">
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-white">
      {isOwnProfile ? (
        <Header 
          streakLink="/streak" 
          settingsLink="/settings" 
          userAddress={currentUserAddress || ''}
        />
      ) : (
        <CloseHeader onAction={handleClose} type="back" fallbackPath="/" />
      )}
      <main className="flex-grow">
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-500">
          <img 
            src={profileData.ens?.records?.header || profileData.text_records?.cover || '/images/user_cover.png'} 
            alt="Cover" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="max-w-2xl mx-auto px-4 -mt-24">
          <div className="flex flex-col items-center mb-4">
            <Avatar className="h-32 w-32 mb-4 border-4 border-neutral-900">
              <AvatarImage 
                src={profileData.ens?.avatar || profileData.text_records?.avatar || '/images/avatar.png'} 
                alt="Profile" 
              />
              <AvatarFallback>{profileData.ens?.name?.charAt(0) || profileData.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex items-center justify-center">
              <h2 className="text-xl font-bold mr-2">
                {profileData.ens?.name || (profileData.name && profileData.domain
                  ? `${profileData.name}.${profileData.domain}`
                  : truncateAddress(profileData.address))}
              </h2>
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                  <Share2 
                    className="w-5 h-5 text-neutral-400 hover:text-neutral-200 cursor-pointer transition-colors duration-200" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDrawerOpen(true);
                    }}
                  />
                </DrawerTrigger>
                <ShareDrawerContent />
              </Drawer>
            </div>
            {profileData.ens?.records?.description && (
              <p className="text-sm text-neutral-300 mt-2 text-center">
                {profileData.ens.records.description}
              </p>
            )}
          </div>
          <div className="flex justify-center my-2">
            <div className="text-center mx-4 w-24">
              <div className="h-12 flex items-center justify-center">
                <p className="text-2xl font-bold">{stats.topStreak}</p>
              </div>
              <p className="text-sm text-neutral-400">Top Streak</p>
            </div>
            <div className="text-center mx-4 w-24">
              <div className="h-12 flex items-center justify-center">
                {isOwnProfile && !hasEFPList ? (
                  <AlertTriangle className="text-yellow-500" />
                ) : (
                  <p className="text-2xl font-bold">{stats.followers}</p>
                )}
              </div>
              <p className="text-sm text-neutral-400">Followers</p>
            </div>
            <div className="text-center mx-4 w-24">
              <div className="h-12 flex items-center justify-center">
                {isOwnProfile && !hasEFPList ? (
                  <AlertTriangle className="text-yellow-500" />
                ) : (
                  <p className="text-2xl font-bold">{stats.following}</p>
                )}
              </div>
              <p className="text-sm text-neutral-400">Following</p>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            {isOwnProfile ? (
              <Button 
                onClick={() => navigate('/profile/edit')} 
                variant="blue"
                className="w-full"
              >
                Edit Profile
              </Button>
            ) : (
              <Button 
                onClick={handleFollowClick} 
                variant="blue"
                className="w-full flex items-center justify-center"
              >
                Follow <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}