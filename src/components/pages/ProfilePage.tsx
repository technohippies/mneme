import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Clipboard, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from '../../contexts/AuthContext';
import { 
  getFollowers,
  getFollowing,
  checkIfUserHasList
} from '../../services/efp/efpService';
import { getStreakData } from '../../services/orbis/streakService';
import { useAccount } from 'wagmi';
import { orbit, dotStream } from 'ldrs';
import { getName } from "../../services/namestoneService";

// Register the orbit and dotStream loaders
orbit.register();
dotStream.register();

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [coverUrl, setCoverUrl] = useState<string>('/images/user_cover.png');
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ topStreak: 0, followers: 0, following: 0 });
  const { address: currentUserAddress } = useAccount();
  const [hasEFPList, setHasEFPList] = useState<boolean | null>(null);
  const [names, setNames] = useState<string[]>([]);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    console.log('Loading profile for address:', address);
    try {
      const [nameData, streakData] = await Promise.all([
        getName(address),
        getStreakData(address)
      ]);

      console.log('Name Data:', JSON.stringify(nameData, null, 2));
      console.log('Streak Data:', JSON.stringify(streakData, null, 2));

      if (nameData && nameData.length > 0) {
        setNames(nameData.map(record => record.name));
        const latestRecord = nameData[nameData.length - 1];
        setUsername(latestRecord.name);
        setAvatarUrl(latestRecord.text_records?.avatar || '/images/avatar.png');
        setCoverUrl(latestRecord.text_records?.cover || '/images/user_cover.png');

        const [followers, following] = await Promise.all([
          getFollowers(address),
          getFollowing(address)
        ]);
        console.log('Followers:', JSON.stringify(followers, null, 2));
        console.log('Following:', JSON.stringify(following, null, 2));
        
        setStats({
          topStreak: streakData.topStreak,
          followers: followers.length,
          following: following.length
        });

        const userHasList = await checkIfUserHasList(address);
        console.log('User has EFP List:', userHasList);
        setHasEFPList(userHasList);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!address) {
      const storedAddress = localStorage.getItem('walletAddress');
      setAddress(user?.address || storedAddress || '');
    }
  }, [user, address]);

  useEffect(() => {
    if (address) {
      loadProfile();
    }
  }, [address, loadProfile]);

  const truncateAddress = useMemo(() => (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  const copyAddressToClipboard = useCallback(() => {
    navigator.clipboard.writeText(address);
    // Add a toast notification here
  }, [address]);

  return (
    <div className="bg-neutral-900 min-h-screen w-full text-white">
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-500">
        <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
      </div>
      <div className="max-w-2xl mx-auto px-4 -mt-24">
        <div className="flex flex-col items-center mb-4">
          <Avatar className="h-32 w-32 mb-4 border-4 border-neutral-900">
            <AvatarImage src={avatarUrl || '/images/avatar.png'} alt="Profile" />
            <AvatarFallback>{isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : null}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold mb-2 text-center">
            {isLoading ? (
              <l-dot-stream
                size="40"
                speed="2.5" 
                color="white" 
              ></l-dot-stream>
            ) : (
              username || "No username found"
            )}
          </h2>
          {names.length > 1 && (
            <p className="text-sm text-neutral-400 mb-2">
              Other names: {names.filter(name => name !== username).join(', ')}
            </p>
          )}
          <p 
            className="text-sm text-neutral-400 cursor-pointer hover:text-neutral-300 flex items-center justify-center"
            onClick={copyAddressToClipboard}
          >
            {truncateAddress(address)}
            <Clipboard className="ml-2 w-4 h-4" />
          </p>
        </div>
        <div className="flex justify-center my-2">
          <div className="text-center mx-4 w-24">
            <div className="h-12 flex items-center justify-center">
              {isLoading ? (
                <l-orbit size="24" speed="1.5" color="white"></l-orbit>
              ) : (
                <p className="text-2xl font-bold">{stats.topStreak}</p>
              )}
            </div>
            <p className="text-sm text-neutral-400">Top Streak</p>
          </div>
          <div className="text-center mx-4 w-24">
            <div className="h-12 flex items-center justify-center">
              {isLoading ? (
                <l-orbit size="24" speed="1.5" color="white"></l-orbit>
              ) : hasEFPList ? (
                <p className="text-2xl font-bold">{stats.followers}</p>
              ) : (
                <AlertTriangle className="text-yellow-500" />
              )}
            </div>
            <p className="text-sm text-neutral-400">Followers</p>
          </div>
          <div className="text-center mx-4 w-24">
            <div className="h-12 flex items-center justify-center">
              {isLoading ? (
                <l-orbit size="24" speed="1.5" color="white"></l-orbit>
              ) : hasEFPList ? (
                <p className="text-2xl font-bold">{stats.following}</p>
              ) : (
                <AlertTriangle className="text-yellow-500" />
              )}
            </div>
            <p className="text-sm text-neutral-400">Following</p>
          </div>
        </div>
        {currentUserAddress === address && (
          <>
            
            <Button 
              onClick={() => navigate('/profile/edit')} 
              variant="blue"
              className="w-full mt-4"
            >
              Edit Profile
            </Button>
          </>
        )}
      </div>
    </div>
  );
}