import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quantum } from 'ldrs';
import { useTranslation } from 'react-i18next';
import { createUserSongService } from '../../services/orbis/userSongService';
import { useAuthenticateCeramic } from '../../services/orbis/authService';
import { songService } from '../../services/orbis/songService';
import { DeckType, PhraseStatus } from '../../types';
import { userLearningDataService } from '../../services/orbis/userDataLearningService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { truncateTitle } from '../../lib/utils'; // Make sure this utility function is available

// Register the quantum loader
quantum.register();

const DecksListPage: React.FC = () => {
  const { t } = useTranslation();
  const [decks, setDecks] = useState<DeckType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const authenticateCeramic = useAuthenticateCeramic();
  const userSongService = useMemo(() => createUserSongService(() => authenticateCeramic()), [authenticateCeramic]);
  const { user, isAuthenticating, login } = useAuth();
  const [deckStatuses, setDeckStatuses] = useState<{ [key: string]: PhraseStatus }>({});
  const navigate = useNavigate();

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
            artist: songDetails?.artist_name_eng || 'Unknown Artist',
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

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center mb-2 relative">
      <h1 className="text-neutral-200 text-xl font-bold">{title}</h1>
      <div className="absolute right-28 w-10 text-center text-neutral-400 text-md">New</div>
      <div className="absolute right-16 w-10 text-center text-neutral-400 text-md">Learn</div>
      <div className="absolute right-4 w-10 text-center text-neutral-400 text-md">Due</div>
    </div>
  );

  const LoadingScreen = useMemo(() => () => (
    <div className="flex-grow flex items-center justify-center h-full">
      <l-quantum
        size="45"
        speed="1.75" 
        color="white" 
      ></l-quantum>
    </div>
  ), []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8 h-full flex flex-col">
      {decks.length > 0 ? (
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
                  <div className="absolute right-28 w-10 text-center text-lg font-medium">
                    {deckStatuses[deck.id]?.new_count || 0}
                  </div>
                  <div className="absolute right-16 w-10 text-center text-lg font-medium">
                    {deckStatuses[deck.id]?.learning_count || 0}
                  </div>
                  <div className="absolute right-4 w-10 text-center text-lg font-medium">
                    {deckStatuses[deck.id]?.due_count || 0}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center">
          <p className="text-neutral-300 text-lg mb-4">{t('decksList.noSongsAdded')}</p>
          <Button
            variant="blue"
            size="lg"
            className="w-full max-w-md"
            onClick={() => navigate('/songs')}
          >
            {t('decksList.browse')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DecksListPage;