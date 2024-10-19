import React, { useState, useEffect } from 'react';
import { Fire, Gear } from "@phosphor-icons/react";
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { getStreakData } from '../../services/orbis/streakService';

interface HeaderProps {
  streakLink: string;
  settingsLink: string;
  userAddress: string;
}

const Header: React.FC<HeaderProps> = ({ settingsLink, userAddress }) => {
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    const fetchStreakData = async () => {
      if (userAddress) {
        try {
          const data = await getStreakData(userAddress);
          setCurrentStreak(data.currentStreak);
        } catch (error) {
          console.error('Error fetching streak data:', error);
          setCurrentStreak(0);
        }
      }
    };

    fetchStreakData();
  }, [userAddress]);

  return (
    <div className="flex items-center justify-between bg-neutral-900 border-b border-neutral-800 border-border p-4">
      <Button 
        asChild 
        className="bg-transparent text-red-500 hover:text-red-400 hover:bg-neutral-800 active:bg-neutral-700 active:text-red-300"
      >
        <a 
          href="https://www.stack.so/leaderboard/scarlett-karaoke" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center"
        >
          <Fire className="w-6 h-6 mr-2" weight="fill" />
          <span className="font-bold">{currentStreak}</span>
        </a>
      </Button>
      <Button 
        asChild 
        className="bg-transparent text-neutral-300 hover:text-neutral-200 hover:bg-neutral-800 active:bg-neutral-700 active:text-neutral-100"
      >
        <Link to={settingsLink} className="flex items-center">
          <Gear className="w-6 h-6" weight="fill" />
        </Link>
      </Button>
    </div>
  );
};

export default Header;
