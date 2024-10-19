import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dotStream } from 'ldrs';
import { useTranslation } from 'react-i18next';
import { CaretLeft, SpeakerHigh, MusicNotes, Pause } from "@phosphor-icons/react";
import { phraseService } from '../../services/orbis/phraseService';
import { songService } from '../../services/orbis/songService';
import { userLearningDataService } from '../../services/orbis/userDataLearningService';
import { createUserSongService } from '../../services/orbis/userSongService';
import { PhraseStatus, Phrase, DeckType, Song } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import FlashcardStatusDisplay from '../core/FlashcardStatusDisplay';
import { Button } from "../ui/button";
import { motion } from 'framer-motion';
import loadingImage from '/images/loading-image.png';

dotStream.register();

const DeckStudyPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { geniusSlug } = useParams<{ geniusSlug: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<DeckType | null>(null);
  const [phraseStatus, setPhraseStatus] = useState<PhraseStatus | null>(null);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInUserSongs, setIsInUserSongs] = useState(false);
  const { authenticateCeramic, user } = useAuth();

  const userSongService = useMemo(() => createUserSongService(authenticateCeramic), [authenticateCeramic]);

  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);

  const handleAudioPlay = useCallback((cid: string) => {
    if (loadingAudio === cid) return;

    if (playingAudio) {
      playingAudio.pause();
      playingAudio.currentTime = 0;
      setPlayingAudio(null);
    }

    setLoadingAudio(cid);
    const audio = new Audio(`https://warp.dolpin.io/ipfs/${cid}`);
    audio.oncanplaythrough = () => {
      setLoadingAudio(null);
      audio.play();
      setPlayingAudio(audio);
    };
    audio.onended = () => {
      setPlayingAudio(null);
    };
  }, [playingAudio, loadingAudio]);

  const renderAudioControl = (cid: string, type: 'tts' | 'song') => {
    const isPlaying = playingAudio && playingAudio.src.includes(cid);
    const isLoading = loadingAudio === cid;
    const Icon = type === 'tts' ? SpeakerHigh : MusicNotes;

    return (
      <div 
        className="flex-1 flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
        onClick={() => handleAudioPlay(cid)}
      >
        {isLoading ? (
          <l-dot-stream size="20" speed="2.5" color="#FFFFFF"></l-dot-stream>
        ) : isPlaying ? (
          <Pause weight="fill" className="w-6 h-6 text-neutral-300" />
        ) : (
          <Icon weight="fill" className="w-6 h-6 text-neutral-300" />
        )}
      </div>
    );
  };

  const fetchSongData = useCallback(async () => {
    if (!geniusSlug) {
      console.error('No geniusSlug provided');
      setError(t('songStudy.songNotFound'));
      setIsLoading(false);
      return;
    }

    console.log('Fetching song data for geniusSlug:', geniusSlug);
    setIsLoading(true);
    setError(null);

    try {
      const fetchedSong = await songService.getSongByGeniusSlug(geniusSlug);
      
      if (!fetchedSong) {
        throw new Error(`Song not found for geniusSlug: ${geniusSlug}`);
      }

      console.log('Fetched song:', JSON.stringify(fetchedSong, null, 2));

      const [status, phrasesData] = await Promise.all([
        userLearningDataService.getPhraseStatus(fetchedSong.uuid, user?.did || ''),
        phraseService.getPhrases(fetchedSong.uuid)
      ]);
      
      console.log('Phrase status:', JSON.stringify(status, null, 2));
      console.log('Fetched phrases:', JSON.stringify(phrasesData, null, 2));
      
      const newSong = createDeckFromSong(fetchedSong);
      console.log('Created song:', JSON.stringify(newSong, null, 2));
      setSong(newSong);
      setPhraseStatus(status);
      setPhrases(phrasesData);

      const initializationStatus = await userLearningDataService.checkDeckInitialization(fetchedSong.uuid, user?.did || '');
      const inUserSongs = await userSongService.isSongInUserDeck(fetchedSong.uuid);

      console.log('Initialization status:', JSON.stringify(initializationStatus, null, 2));
      console.log('Is in user songs:', inUserSongs);

      setIsInitialized(initializationStatus.isFullyInitialized);
      setIsInUserSongs(inUserSongs);
    } catch (error: unknown) {
      console.error('Error fetching song data:', error);
      setError(`${t('songStudy.errorAddingSong')} ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [geniusSlug, user, userSongService, t]);

  useEffect(() => {
    console.log('DeckStudyPage - geniusSlug:', geniusSlug);
    fetchSongData();
  }, [fetchSongData, geniusSlug]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleStudyClick = useCallback(() => {
    if (geniusSlug) {
      console.log('[DeckStudyPage] Navigating to flashcards with geniusSlug:', geniusSlug);
      const isStudyAgain = phraseStatus && phraseStatus.studied_today >= 20;
      console.log('[DeckStudyPage] Is Study Again:', isStudyAgain);
      navigate(`/deck/${geniusSlug}/flashcards`, { state: { isStudyAgain } });
    }
  }, [geniusSlug, navigate, phraseStatus]);

  const handleAddSong = useCallback(async () => {
    if (song && user) {
      setIsLoading(true);
      try {
        await userSongService.addSongToDeck(song.id);
        await userLearningDataService.initializeUserLearningDataForSong(
          song.id,
          user.did ?? '',
          authenticateCeramic
        );
        const initializationStatus = await userLearningDataService.checkDeckInitialization(
          song.id,
          user.did ?? ''
        );
        setIsInitialized(initializationStatus.isFullyInitialized);
        setIsInUserSongs(true);
      } catch (error) {
        console.error('Error adding song:', error);
        setError(t('songStudy.errorAddingSong'));
      } finally {
        setIsLoading(false);
      }
    }
  }, [song, user, userSongService, authenticateCeramic, userLearningDataService, t]);

  const handleMatchClick = useCallback(() => {
    if (geniusSlug) {
      console.log('[DeckStudyPage] Navigating to match study with geniusSlug:', geniusSlug);
      navigate(`/deck/${geniusSlug}/match`, { state: { geniusSlug } });
    }
  }, [geniusSlug, navigate]);

  const handleKaraokeClick = useCallback(() => {
    if (geniusSlug) {
      console.log('[DeckStudyPage] Navigating to karaoke study with geniusSlug:', geniusSlug);
      navigate(`/deck/${geniusSlug}/karaoke`);
    }
  }, [geniusSlug, navigate]);

  const getTranslatedTitle = useCallback((song: DeckType) => {
    const currentLanguage = i18n.language;
    const translatedTitleKey = `song_title_${currentLanguage}`;
    return song.translatedTitles?.[translatedTitleKey] || null;
  }, [i18n.language]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-neutral-900">
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

  if (error || !song) {
    return (
      <div className="flex flex-col h-screen bg-neutral-900 text-neutral-100">
        <button
          onClick={handleBack}
          className="p-4 text-neutral-100 hover:text-neutral-200"
        >
          <CaretLeft weight="fill" className="w-8 h-8" />
        </button>
        <div className="flex-grow p-4">
          <p className="text-red-500">{error || t('songStudy.songNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-neutral-100">
      {/* Top portion with background image */}
      <div 
        className="relative w-full pb-[100%] bg-cover bg-center"
        style={{
          backgroundImage: `url(https://warp.dolpin.io/ipfs/${song.img_cid})`,
        }}
      >
        {/* Gradient overlay for better text visibility and bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-neutral-900"></div>
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="absolute top-6 left-6 text-neutral-100 hover:text-neutral-200 z-20"
          >
            <CaretLeft weight="fill" className="w-8 h-8" />
          </button>
          
          {/* Song info and status */}
          <div className="flex flex-col items-center justify-end h-full">
            {getTranslatedTitle(song) && (
              <h1 className="text-2xl font-medium text-center mb-1 text-neutral-300 drop-shadow-lg px-4">
                {getTranslatedTitle(song)}
              </h1>
            )}
            <h1 className="text-3xl font-bold text-center mb-2 drop-shadow-lg px-4">{song?.name}</h1>
            <h2 className="text-xl text-neutral-300 mb-6 drop-shadow-lg px-4">{song?.artist}</h2>
            {isInitialized && isInUserSongs && phraseStatus && (
              <FlashcardStatusDisplay status={phraseStatus} isLoading={false} />
            )}
          </div>
        </div>
      </div>

      {/* Rest of the content */}
      <div className="flex-grow overflow-auto">
        <div className="p-6 pb-20">
          {!isInitialized && !isInUserSongs ? (
            <Button
              onClick={handleAddSong}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              {t('songStudy.addSong')}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleStudyClick}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {phraseStatus && phraseStatus.studied_today >= 20 ? t('songStudy.studyFlashcardsAgain') : 
                 (phraseStatus && phraseStatus.studied_today > 0 ? t('songStudy.continueFlashcards') : t('songStudy.studyFlashcards'))}
              </Button>
              <Button
                onClick={handleMatchClick}
                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                {t('songStudy.matchPhrases')}
              </Button>
              <Button
                onClick={handleKaraokeClick}
                className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
              >
                {t('songStudy.playKaraoke')}
              </Button>
            </>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">{t('songStudy.lines', { count: phrases.length })}</h2>
            <ul className="space-y-4">
              {phrases.map((phrase) => (
                <li key={phrase.phrase_id} className="bg-neutral-800 rounded-md overflow-hidden">
                  <div className="p-4">
                    {phrase.text.split('\\n').map((line, index) => (
                      <React.Fragment key={index}>
                        <p className="text-md font-medium mb-0 mt-1">{line}</p>
                        {phrase.text_cmn && (
                          <p className="text-md text-neutral-300 mb-2">
                            {phrase.text_cmn.split('\\n')[index]}
                          </p>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex h-14 bg-neutral-700">
                    {renderAudioControl(phrase.tts_cid, 'tts')}
                    <div className="w-px h-full bg-neutral-600"></div>
                    {renderAudioControl(phrase.audio_cid, 'song')}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

function createDeckFromSong(song: Song): DeckType {
  return {
    stream_id: song.stream_id,
    controller: 'default_controller',
    name: song.song_title_eng || 'Unknown Song',
    artist: song.artist_name_original || 'Unknown Artist',
    slug: song.genius_slug,
    status: 'active',
    creator: song.artist_name_original,
    img_cid: song.song_art_image_cid || '',
    category: 'song',
    difficulty: 'medium',
    description: song.description_eng || '',
    base_language: song.language,
    target_language_1: 'eng',
    genius_slug: song.genius_slug,
    id: song.uuid,
    season: undefined,
    episode: undefined,
    reference_url: undefined,
    target_language_2: undefined,
    translatedTitles: song.translatedTitles ? { ...song.translatedTitles } : undefined,
  };
}

export default React.memo(DeckStudyPage);
