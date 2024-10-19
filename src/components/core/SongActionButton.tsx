import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, MinusCircle } from "@phosphor-icons/react";
import { userLearningDataService } from '../../services/orbis/userDataLearningService';
import { getCurrentUserDID } from '../../services/orbis/config';
import debounce from 'lodash/debounce';

interface SongActionButtonProps {
  songUuid: string;
  userSongService: any;
  authenticateCeramic: () => Promise<any>;
}

const SongActionButton: React.FC<SongActionButtonProps> = ({ songUuid, userSongService, authenticateCeramic }) => {
  const [isInDeck, setIsInDeck] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkIfInDeck = useCallback(async () => {
    try {
      const inDeck = await userSongService.isSongInUserDeck(songUuid);
      setIsInDeck(inDeck);
    } catch (error) {
      console.error('Error checking if song is in deck:', error);
    }
  }, [songUuid, userSongService]);

  const debouncedCheckIfInDeck = useCallback(debounce(checkIfInDeck, 300), [checkIfInDeck]);

  useEffect(() => {
    debouncedCheckIfInDeck();
    return () => {
      debouncedCheckIfInDeck.cancel();
    };
  }, [debouncedCheckIfInDeck]);

  const handleAddRemoveSong = async () => {
    if (isLoading || isInDeck === null) return;
    setIsLoading(true);
    try {
      if (isInDeck) {
        await userSongService.updateDeckStatus(songUuid, 'inactive');
        setIsInDeck(false);
      } else {
        await userSongService.addSongToDeck(songUuid);
        const userDid = await getCurrentUserDID();
        if (userDid) {
          await userLearningDataService.initializeUserLearningDataForSong(songUuid, userDid, authenticateCeramic);
        } else {
          console.error('User DID not available');
        }
        setIsInDeck(true);
      }
    } catch (error) {
      console.error('Error adding/removing song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInDeck === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleAddRemoveSong}
        className="text-white hover:text-gray-300 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <span>Loading...</span>
        ) : isInDeck ? (
          <MinusCircle size={24} weight="fill" />
        ) : (
          <PlusCircle size={24} weight="fill" />
        )}
      </button>
      <span className="text-xs mt-1 text-white">
        {isInDeck ? "Remove song" : "Add song"}
      </span>
    </div>
  );
};

export default SongActionButton;
