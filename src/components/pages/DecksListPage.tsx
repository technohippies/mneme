import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScrollMenu } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import { createUserSongService } from '../../services/orbis/userSongService';
import { useAuthenticateCeramic } from '../../services/orbis/authService';
import { songService } from '../../services/orbis/songService';
import { DeckType, PhraseStatus, Song } from '../../types';
import { userLearningDataService } from '../../services/orbis/userDataLearningService';
import { useAuth } from '../../contexts/AuthContext';
import { truncateTitle } from '@/lib/utils';
import loadingImage from '/images/loading-image.png';
import { motion } from 'framer-motion';

const DecksListPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [decks, setDecks] = useState<DeckType[]>([]);
  const [englishSongs, setEnglishSongs] = useState<Song[]>([]);
  const [frenchSongs, setFrenchSongs] = useState<Song[]>([]);
  const [spanishSongs, setSpanishSongs] = useState<Song[]>([]);
  const [italianSongs, setItalianSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const authenticateCeramic = useAuthenticateCeramic();
  const userSongService = useMemo(() => createUserSongService(authenticateCeramic), [authenticateCeramic]);
  const { user, isAuthenticating, login } = useAuth();
  const [deckStatuses, setDeckStatuses] = useState<{ [key: string]: PhraseStatus }>({});
  const [allSongs, setAllSongs] = useState<{ [key: string]: Song[] }>({});
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);

  console.log('DecksListPage - Current user:', user);
  console.log('DecksListPage - Is authenticating:', isAuthenticating);

  const fetchDecks = useCallback(async () => {
    if (isLoading && !isAuthenticating && user?.did && !hasFetched) {
      console.log('Fetching user decks...');
      try {
        const userDecks = await userSongService.getUserDecks();
        const formattedDecks = await Promise.all(userDecks.map(async (deck) => {
          const songDetails = await songService.getSongByUuid(deck.song_uuid);
          const status = await userLearningDataService.getPhraseStatus(deck.song_uuid, user.did!);
          setDeckStatuses(prev => ({ ...prev, [deck.song_uuid]: status }));
          return {
            id: deck.song_uuid,
            stream_id: deck.stream_id,
            controller: deck.controller,
            name: songDetails?.song_title_eng || 'Unknown Song',
            slug: songDetails?.genius_slug,
            status: deck.status,
            img_cid: songDetails?.song_art_image_cid || '',
            genius_slug: songDetails?.genius_slug || '',
            artist: songDetails?.artist_name_original || 'Unknown Artist',
          } as DeckType;
        }));
        setDecks(formattedDecks);
      } catch (error) {
        console.error('Error fetching decks:', error);
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    }
  }, [userSongService, user, isLoading, isAuthenticating, hasFetched]);

  useEffect(() => {
    if (!user && !isAuthenticating) {
      login();
    }
  }, [user, isAuthenticating, login]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const SectionHeader = ({ title, showStats = true }: { title: string, showStats?: boolean }) => (
    <div className="flex items-center mb-4 relative">
      <h1 className="text-neutral-200 text-xl font-bold">{title}</h1>
      {showStats && (
        <>
          <div className="absolute right-24 w-10 text-center text-neutral-400 text-md">{t('decksList.new')}</div>
          <div className="absolute right-12 w-10 text-center text-neutral-400 text-md">{t('decksList.learn')}</div>
          <div className="absolute right-0 w-10 text-center text-neutral-400 text-md">{t('decksList.due')}</div>
        </>
      )}
    </div>
  );

  const LoadingScreen = useMemo(() => () => (
    <div className="flex-grow flex flex-col items-center justify-center h-full">
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

  // Add this CSS class for styled scrollbars
  const scrollbarStyle = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #2a2a2a;
      border-radius: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #4a4a4a;
      border-radius: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #5a5a5a;
    }
    .hide-scrollbar {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .react-horizontal-scrolling-menu--scroll-container::-webkit-scrollbar {
      display: none;
    }
    .react-horizontal-scrolling-menu--scroll-container {
      -ms-overflow-style: none; /* IE and Edge */
      scrollbar-width: none; /* Firefox */
    }
  `;

  const SongGrid = ({ songs, title, language }: { songs: Song[], title: string, language: string }) => {
    const navigate = useNavigate();

    const getSongTitle = (song: Song, lang: string): string => {
      const titleKey = `song_title_${lang}` as keyof Song;
      return (song[titleKey] as string) || song.song_title_eng;
    };

    const SongCard = ({ song, index }: { song: Song, index: number }) => (
      <div 
        className={`flex-shrink-0 w-36 cursor-pointer ${index !== 0 ? 'ml-4' : ''}`}
        onClick={() => navigate(`/deck/${song.genius_slug}`)}
      >
        <img
          src={`https://warp.dolpin.io/ipfs/${song.song_art_image_cid}`}
          alt={getSongTitle(song, language)}
          className="w-36 h-36 object-cover rounded-lg mb-2"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = "/images/placeholder.png";
          }}
        />
        <p className="text-md font-medium truncate">{getSongTitle(song, language)}</p>
        <p className="text-md text-neutral-400 truncate">{song.artist_name_original}</p>
      </div>
    );

    return (
      <div className="mb-2">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <ScrollMenu>
          {songs.map((song, index) => (
            <SongCard key={song.uuid} song={song} index={index} />
          ))}
        </ScrollMenu>
      </div>
    );
  };

  const fetchSongsByLanguage = useCallback(async () => {
    console.log('fetchSongsByLanguage called');
    if (!isAuthenticating && user?.did) {
      console.log('Fetching songs by language...');
      try {
        console.log('Calling songService.getSongsByLanguage("eng")');
        const englishSongs = await songService.getSongsByLanguage('eng');
        console.log('Fetched English songs:', englishSongs);
        setEnglishSongs(englishSongs);

        console.log('Calling songService.getSongsByLanguage("fra")');
        const frenchSongs = await songService.getSongsByLanguage('fra');
        console.log('Fetched French songs:', frenchSongs);
        setFrenchSongs(frenchSongs);

        console.log('Calling songService.getSongsByLanguage("spa")');
        const spanishSongs = await songService.getSongsByLanguage('spa');
        console.log('Fetched Spanish songs:', spanishSongs);
        setSpanishSongs(spanishSongs);

        console.log('Calling songService.getSongsByLanguage("ita")');
        const italianSongs = await songService.getSongsByLanguage('ita');
        console.log('Fetched Italian songs:', italianSongs);
        setItalianSongs(italianSongs);

      } catch (error) {
        console.error('Error fetching songs by language:', error);
      } finally {
        setHasFetched(true);
      }
    } else {
      console.log('Skipping fetchSongsByLanguage:', { isAuthenticating, userDid: user?.did });
    }
  }, [isAuthenticating, user, songService]);

  useEffect(() => {
    console.log('songService:', songService);
    if (songService && typeof songService.getSongsByLanguage === 'function' && !hasFetched) {
      fetchSongsByLanguage();
    } else if (hasFetched) {
      console.log('Songs have already been fetched');
    } else {
      console.error('songService or getSongsByLanguage is not available');
    }
  }, [songService, fetchSongsByLanguage, hasFetched]);

  useEffect(() => {
    console.log('English songs state updated:', englishSongs);
  }, [englishSongs]);

  useEffect(() => {
    console.log('French songs state updated:', frenchSongs);
  }, [frenchSongs]);

  useEffect(() => {
    console.log('Spanish songs state updated:', spanishSongs);
  }, [spanishSongs]);

  useEffect(() => {
    console.log('Italian songs state updated:', italianSongs);
  }, [italianSongs]);

  const fetchAllSongs = useCallback(async () => {
    if (!isAuthenticating && user?.did && !hasFetched) {
      console.log('Fetching all songs...');
      setIsLoadingSongs(true);
      try {
        const languages = ['eng', 'fra', 'spa', 'ita'];
        const songsByLanguage = await Promise.all(
          languages.map(async (lang) => {
            const songs = await songService.getSongsByLanguage(lang);
            return { [lang]: songs };
          })
        );
        const mergedSongs = Object.assign({}, ...songsByLanguage);
        setAllSongs(mergedSongs);
        setHasFetched(true);
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setIsLoadingSongs(false);
      }
    }
  }, [isAuthenticating, user, hasFetched]);

  useEffect(() => {
    fetchAllSongs();
  }, [fetchAllSongs]);

  if (isLoading || isLoadingSongs) {
    return <LoadingScreen />;
  }

  // Log the current state before rendering
  console.log('Current state:', { englishSongs, frenchSongs, spanishSongs, italianSongs });

  const isEnglishBrowser = i18n.language.startsWith('en');

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div className="container mx-auto px-4 py-8 h-full overflow-y-auto custom-scrollbar">
        {decks.length > 0 && (
          <div className="mb-8">
            <SectionHeader title={t('decksList.yourSongs')} />
            {decks.map((deck) => (
              <Link key={deck.id} to={`/deck/${deck.genius_slug}`}>
                <div className="block mb-4 bg-neutral-800 hover:bg-neutral-700 rounded-md overflow-hidden shadow-sm">
                  <div className="flex items-center p-3 relative">
                    <img
                      src={`https://warp.dolpin.io/ipfs/${deck.img_cid}`}
                      alt={deck.name}
                      className="w-12 h-12 bg-neutral-600 rounded-lg overflow-hidden object-cover mr-3"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        e.currentTarget.src = "/images/placeholder.png";
                      }}
                    />
                    <div className="flex-grow">
                      <h2 className="text-lg font-semibold text-neutral-100 truncate">
                        {truncateTitle(deck.name, 30)}
                      </h2>
                      <p className="text-sm text-neutral-300 truncate">
                        {truncateTitle(deck.artist, 30)}
                      </p>
                    </div>
                    <div className="absolute right-24 w-10 text-center text-lg font-medium">
                      {deckStatuses[deck.id]?.new_count || 0}
                    </div>
                    <div className="absolute right-12 w-10 text-center text-lg font-medium">
                      {deckStatuses[deck.id]?.learning_count || 0}
                    </div>
                    <div className="absolute right-0 w-10 text-center text-lg font-medium">
                      {deckStatuses[deck.id]?.due_count || 0}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {isEnglishBrowser ? (
            <>
              <SongGrid songs={allSongs['spa'] || []} title={t('decksList.learnSpanish')} language={i18n.language} />
              <SongGrid songs={allSongs['fra'] || []} title={t('decksList.learnFrench')} language={i18n.language} />
              <SongGrid songs={allSongs['ita'] || []} title={t('decksList.learnItalian')} language={i18n.language} />
              <SongGrid songs={allSongs['eng'] || []} title={t('decksList.learnEnglish')} language={i18n.language} />
            </>
          ) : (
            <>
              <SongGrid songs={allSongs['eng'] || []} title={t('decksList.learnEnglish')} language={i18n.language} />
              <SongGrid songs={allSongs['fra'] || []} title={t('decksList.learnFrench')} language={i18n.language} />
              <SongGrid songs={allSongs['spa'] || []} title={t('decksList.learnSpanish')} language={i18n.language} />
              <SongGrid songs={allSongs['ita'] || []} title={t('decksList.learnItalian')} language={i18n.language} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DecksListPage;
