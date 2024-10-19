import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { KaraokeControls } from '../composite/KaraokeControls';
import { songService } from '../../services/orbis/songService';
import { phraseService } from '../../services/orbis/phraseService';
import { createUserSongService } from '../../services/orbis/userSongService';
import { useAuthenticateCeramic } from '../../services/orbis/authService';
import { Song, Phrase } from '../../types/index';
import CloseHeader from '../layout/CloseHeader';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import loadingImage from '/images/loading-image.png';

const KaraokeStudyPage: React.FC = () => {
  const { geniusSlug } = useParams<{ geniusSlug: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [isInDeck, setIsInDeck] = useState(false);
  const navigate = useNavigate();
  const authenticateCeramic = useAuthenticateCeramic();
  const userSongService = useMemo(() => createUserSongService(authenticateCeramic), [authenticateCeramic]);

  useEffect(() => {
    const fetchData = async () => {
      if (geniusSlug) {
        const fetchedSong = await songService.getSongByGeniusSlug(geniusSlug);
        if (fetchedSong) {
          setSong(fetchedSong);
          const fetchedPhrases = await phraseService.getPhrases(fetchedSong.uuid);
          setPhrases(fetchedPhrases);
          
          // Check if the song is in the user's deck
          const songInDeck = await userSongService.isSongInUserDeck(fetchedSong.uuid);
          setIsInDeck(songInDeck);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, [geniusSlug, userSongService]);

  const handleClose = () => {
    navigate('/decks');
  };

  const handleRecordingComplete = useCallback(async (audioBlob: Blob): Promise<{ score: number | undefined, scoreReceived: boolean }> => {
    // This is a placeholder implementation. Replace with actual logic to process the audioBlob.
    console.log('Recording completed. Audio blob size:', audioBlob.size);
    try {
      // Simulating an API call or processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const simulatedScore = Math.floor(Math.random() * 101); // Random score between 0 and 100
      return { score: simulatedScore, scoreReceived: true };
    } catch (error) {
      console.error('Error processing recording:', error);
      setScoreError('Failed to process recording');
      return { score: undefined, scoreReceived: false };
    }
  }, []);

  const handleAddSong = useCallback(async () => {
    if (song) {
      const added = await userSongService.addSongToDeck(song.uuid);
      if (added) {
        setIsInDeck(true);
      }
    }
  }, [song, userSongService]);

  const LoadingScreen = useMemo(() => () => (
    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-50">
      <motion.img 
        src={loadingImage} 
        alt="Loading" 
        className="w-48 h-48 object-contain"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  ), []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!song || phrases.length === 0) {
    return <div>No song or phrases found.</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-900">
      <CloseHeader onAction={handleClose} type="close" />
      <div className="flex-grow overflow-hidden">
        <KaraokeControls
          phrases={phrases}
          audioUrl={song ? `https://warp.dolpin.io/ipfs/${song.audio_cid}` : ''}
          onPhraseComplete={() => {}}
          onAddSong={handleAddSong}
          onRecordingComplete={handleRecordingComplete}
          isInDeck={isInDeck}
          currentSong={song}
          scoreError={scoreError}
        />
      </div>
    </div>
  );
};

export default KaraokeStudyPage;
