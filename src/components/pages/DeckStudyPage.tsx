import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quantum } from 'ldrs';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { phraseService } from '../../services/orbis/phraseService';
import { songService } from '../../services/orbis/songService';
import { userLearningDataService } from '../../services/orbis/userDataLearningService';
import { createUserSongService } from '../../services/orbis/userSongService';
import { PhraseStatus, Phrase, DeckType, Song } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import FlashcardStatusDisplay from '../core/FlashcardStatusDisplay';
import AudioButton from '../core/AudioButton'; // Import the new AudioButton component

quantum.register();

const DeckStudyPage: React.FC = () => {
  const { t } = useTranslation();
  const { geniusSlug } = useParams<{ geniusSlug: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<DeckType | null>(null);
  const [phraseStatus, setPhraseStatus] = useState<PhraseStatus | null>(null);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInUserDeck, setIsInUserDeck] = useState(false);
  const { authenticateCeramic, user } = useAuth();

  const userSongService = useMemo(() => createUserSongService(authenticateCeramic), [authenticateCeramic]);

  const fetchDeckData = useCallback(async () => {
    if (!geniusSlug) {
      console.error('No geniusSlug provided');
      setError('No song selected. Please choose a song from the list.');
      setIsLoading(false);
      return;
    }

    console.log('Fetching deck data for geniusSlug:', geniusSlug);
    setIsLoading(true);
    setError(null);

    try {
      const song = await songService.getSongByGeniusSlug(geniusSlug);
      
      if (!song) {
        throw new Error(`Song not found for geniusSlug: ${geniusSlug}`);
      }

      console.log('Fetched song:', JSON.stringify(song, null, 2));

      const [status, phrasesData] = await Promise.all([
        userLearningDataService.getPhraseStatus(song.uuid, user?.did || ''),
        phraseService.getPhrases(song.uuid)
      ]);
      
      console.log('Phrase status:', JSON.stringify(status, null, 2));
      console.log('Fetched phrases:', JSON.stringify(phrasesData, null, 2));
      
      const newDeck = createDeckFromSong(song);
      console.log('Created deck:', JSON.stringify(newDeck, null, 2));
      setDeck(newDeck);
      setPhraseStatus(status);
      setPhrases(phrasesData);

      const initializationStatus = await userLearningDataService.checkDeckInitialization(song.uuid, user?.did || '');
      const inUserDeck = await userSongService.isSongInUserDeck(song.uuid);

      console.log('Initialization status:', JSON.stringify(initializationStatus, null, 2));
      console.log('Is in user deck:', inUserDeck);

      setIsInitialized(initializationStatus.isFullyInitialized);
      setIsInUserDeck(inUserDeck);
    } catch (error: unknown) {
      console.error('Error fetching deck data:', error);
      setError(`Failed to load deck data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [geniusSlug, user, userSongService]);

  useEffect(() => {
    console.log('DeckStudyPage - geniusSlug:', geniusSlug);
    fetchDeckData();
  }, [fetchDeckData, geniusSlug]);

  const handleBack = useCallback(() => {
    navigate('/decks');
  }, [navigate]);

  const handleStudyClick = useCallback(() => {
    if (geniusSlug) {
      console.log('[DeckStudyPage] Navigating to flashcards with geniusSlug:', geniusSlug);
      const isStudyAgain = phraseStatus && phraseStatus.studied_today >= 20;
      console.log('[DeckStudyPage] Is Study Again:', isStudyAgain);
      navigate(`/deck/${geniusSlug}/flashcards`, { state: { isStudyAgain } });
    }
  }, [geniusSlug, navigate, phraseStatus]);

  const handleAddDeck = useCallback(async () => {
    if (deck && user) {
      setIsLoading(true);
      try {
        await userSongService.addSongToDeck(deck.id);
        // Use optional chaining and provide a fallback empty string
        await userLearningDataService.initializeUserLearningDataForSong(
          deck.id,
          user.did ?? '',
          authenticateCeramic
        );
        // Use optional chaining and provide a fallback empty string
        const initializationStatus = await userLearningDataService.checkDeckInitialization(
          deck.id,
          user.did ?? ''
        );
        setIsInitialized(initializationStatus.isFullyInitialized);
        setIsInUserDeck(true);
      } catch (error) {
        console.error('Error adding deck:', error);
        setError('Failed to add deck. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [deck, user, userSongService, authenticateCeramic, userLearningDataService]);

  const playAudio = useCallback((cid: string) => {
    console.log(`Playing audio with CID: ${cid}`);
    // The actual audio playing logic is now handled in the AudioButton component
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-neutral-900">
        <l-quantum size="45" speed="1.75" color="white"></l-quantum>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="flex flex-col h-screen bg-neutral-900 text-neutral-100">
        <button
          onClick={handleBack}
          className="p-4 text-neutral-100 hover:text-neutral-200"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-grow p-4">
          <p className="text-red-500">{error || t('deckStudy.deckNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-900 text-neutral-100">
      <button
        onClick={handleBack}
        className="p-4 text-neutral-100 hover:text-neutral-200"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="flex-grow p-4 overflow-auto">
        <div className="flex items-center mb-4">
          <img
            src={`https://warp.dolpin.io/ipfs/${deck.img_cid}`}
            alt={deck.name}
            className="w-36 h-36 object-cover rounded-lg mr-4"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.src = "/images/placeholder.png";
            }}
          />
          <div>
            <h1 className="text-xl font-bold">{deck?.name}</h1>
            <h2 className="text-lg text-neutral-400">{deck?.artist}</h2>
          </div>
        </div>
        {phraseStatus && (
          <div>
            <FlashcardStatusDisplay status={phraseStatus} isLoading={false} />
          </div>
        )}
        {!isInitialized && !isInUserDeck ? (
          <button
            onClick={handleAddDeck}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            {t('deckStudy.addDeck')}
          </button>
        ) : (
          <button
            onClick={handleStudyClick}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {phraseStatus && phraseStatus.studied_today >= 20 ? t('deckStudy.studyAgain') : 
             (phraseStatus && phraseStatus.studied_today > 0 ? t('deckStudy.continueStudying') : t('deckStudy.startStudying'))}
          </button>
        )}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">{t('deckStudy.phrases', { count: phrases.length })}</h2>
          <ul className="space-y-4">
            {phrases.map((phrase) => (
              <li key={phrase.phrase_id} className="bg-neutral-800 p-4 rounded-lg">
                {phrase.text.split('\\n').map((line, index) => (
                  <React.Fragment key={index}>
                    <p className="text-md font-medium mt-1">{line}</p>
                    {phrase.text_cmn && (
                      <p className="text-sm text-neutral-400 mb-1">
                        {phrase.text_cmn.split('\\n')[index]}
                      </p>
                    )}
                  </React.Fragment>
                ))}
                <div className="flex justify-between mt-4 gap-2">
                  <AudioButton
                    cid={phrase.tts_cid}
                    label="Scarlett"
                    onPlay={playAudio}
                  />
                  <AudioButton
                    cid={phrase.audio_cid}
                    label="Song"
                    onPlay={playAudio}
                  />
                </div>
              </li>
            ))}
          </ul>
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
    artist: song.artist_name_eng || 'Unknown Artist',
    slug: song.genius_slug,
    status: 'active',
    creator: song.artist_name_eng,
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
  };
}

export default React.memo(DeckStudyPage);