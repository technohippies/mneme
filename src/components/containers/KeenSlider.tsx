import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { Song, Phrase } from '../../types/index';
import { KaraokeControls } from '../composite/KaraokeControls';
import { createUserSongService } from '../../services/orbis/userSongService';
import { userLearningDataService } from '../../services/orbis/userDataLearningService';
import { useAuthenticateCeramic } from '../../services/orbis/authService';
import { getCurrentUserDID } from '../../services/orbis/config';
import { ArrowSquareOut } from "@phosphor-icons/react";
import { motion } from 'framer-motion';
import loadingImage from '/images/loading-image.png';
import { useTranslation } from 'react-i18next';

interface KeenSliderProps {
  songs: Song[];
  phrases: Phrase[];
}

const KeenSlider: React.FC<KeenSliderProps> = ({ songs, phrases }) => {
  const { i18n } = useTranslation();
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    vertical: true,
    slides: { perView: 1, spacing: 0 },
    mode: "snap",
    drag: true,
    rubberband: true,
  });

  const [phrasesBySong, setPhrasesBySong] = useState<Record<string, Phrase[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [songsInDeck, setSongsInDeck] = useState<Set<string>>(new Set());
  const [decksLoaded, setDecksLoaded] = useState(false);
  const [scoreError] = useState<string | null>(null);

  const authenticateCeramic = useAuthenticateCeramic();
  const userSongService = useMemo(() => createUserSongService(authenticateCeramic), [authenticateCeramic]);

  const handleExternalLink = useCallback((invidiousVideoId: string) => {
    window.open(`https://inv.nadeko.net/watch?v=${invidiousVideoId}`, '_blank');
  }, []);

  const getSongTitle = useCallback((song: Song) => {
    const languageCode = i18n.language.split('-')[0];
    const titleKey = `song_title_${languageCode}` as keyof Song;
    return (song[titleKey] as string) || song.song_title_eng || 'Unknown Title';
  }, [i18n.language]);

  useEffect(() => {
    console.log('KeenSlider: songs changed', songs);
    console.log('KeenSlider: phrases changed', phrases);

    const groupedPhrases = phrases.reduce((acc, phrase) => {
      if (!acc[phrase.song_uuid]) {
        acc[phrase.song_uuid] = [];
      }
      acc[phrase.song_uuid].push(phrase);
      return acc;
    }, {} as Record<string, Phrase[]>);

    console.log('KeenSlider: grouped phrases', groupedPhrases);
    setPhrasesBySong(groupedPhrases);
    setIsLoading(false);

    if (instanceRef.current) {
      instanceRef.current.update();
    }
  }, [songs, phrases, instanceRef]);

  useEffect(() => {
    const fetchSongsInDeck = async () => {
      if (!decksLoaded) {
        const userDecks = await userSongService.getUserDecks();
        setSongsInDeck(new Set(userDecks.map(deck => deck.song_uuid)));
        setDecksLoaded(true);
      }
    };
    fetchSongsInDeck();
  }, [userSongService, decksLoaded]);

  const handleRecordingComplete = useCallback(async (): Promise<{ score: number | undefined, scoreReceived: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const score = Math.floor(Math.random() * 101);
    return { score, scoreReceived: true };
  }, []);

  const handleAddSong = useCallback(async (songUuid: string) => {
    try {
      const userDid = await getCurrentUserDID();
      if (!userDid) {
        console.error('User not authenticated');
        return;
      }

      await userSongService.addSongToDeck(songUuid);
      await userLearningDataService.initializeUserLearningDataForSong(songUuid, userDid, authenticateCeramic);
      
      setSongsInDeck(prev => new Set(prev).add(songUuid));
    } catch (error) {
      console.error('Error adding song to deck:', error);
    }
  }, [userSongService, authenticateCeramic]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-neutral-900">
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
    );
  }

  const songsWithPhrases = songs.filter(song => {
    const songUuid = song.uuid || 'unknown';
    return (phrasesBySong[songUuid] || []).length > 0;
  });

  return (
    <div className="h-full w-full bg-neutral-900 overflow-hidden">
      <div ref={sliderRef} className="keen-slider h-full">
        {songsWithPhrases.map((song) => {
          const songUuid = song.uuid || 'unknown';
          const songPhrases = phrasesBySong[songUuid] || [];
          
          return (
            <div key={songUuid} className="keen-slider__slide h-full flex flex-col relative">
              {song.invidious_video_id && (
                <button
                  onClick={() => handleExternalLink(song.invidious_video_id)}
                  className="absolute top-0 right-0 z-50 flex items-center space-x-2 text-xs text-gray-300 hover:text-blue-400 transition-colors p-4"
                  aria-label="Watch on Invidious"
                >
                  <span>{`${getSongTitle(song)} - ${song.artist_name_original || 'Unknown Artist'}`}</span>
                  <ArrowSquareOut size={16} weight="bold" />
                </button>
              )}
              <div className="flex-grow">
                <KaraokeControls
                  phrases={songPhrases}
                  audioUrl={song.song_cid_1 
                    ? `https://ipfs.filebase.io/ipfs/${song.song_cid_1}` 
                    : song.song_cid_2 
                      ? `https://warp.dolpin.io/ipfs/${song.song_cid_2}`
                      : ''}
                  onRecordingComplete={handleRecordingComplete}
                  onPhraseComplete={(phraseId, performance) => {
                    console.log(`Phrase ${phraseId} completed with performance: ${performance}`);
                  }}
                  onAddSong={() => handleAddSong(songUuid)}
                  isInDeck={songsInDeck.has(songUuid)}
                  scoreError={scoreError}
                  currentSong={song}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KeenSlider;
