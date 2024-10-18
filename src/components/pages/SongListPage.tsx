import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { songService } from '../../services/orbis/songService';
import { Song } from '../../types';
import SongListItem from '../core/SongListItem';
import { motion } from 'framer-motion';
import loadingImage from '/images/loading-image.png';

const SongListPage: React.FC = () => {
  const { t } = useTranslation();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const fetchedSongs = await songService.getSongs();
        setSongs(fetchedSongs);
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError('Failed to load songs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const LoadingScreen = useMemo(() => () => (
    <div className="flex-grow flex items-center justify-center h-full">
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-6 text-neutral-200">{t('songList.errorLoadingSongs')}</h1>
        <p className="text-neutral-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-neutral-200">{t('songList.allSongs')}</h1>
      {songs.length > 0 ? (
        songs.map((song) => (
          <SongListItem key={song.uuid} song={song} />
        ))
      ) : (
        <p className="text-neutral-300">{t('songList.noSongsAvailable')}</p>
      )}
    </div>
  );
};

export default React.memo(SongListPage);
