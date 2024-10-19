import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Song } from '../../types';

interface SongListItemProps {
  song: Song;
  language: string | null;
}

const SongListItem: React.FC<SongListItemProps> = ({ song, language }) => {
  const imageSrc = useMemo(() => {
    if (song.song_art_image_cid) {
      return `https://warp.dolpin.io/ipfs/${song.song_art_image_cid}`;
    }
    return '/images/placeholder.png';
  }, [song.song_art_image_cid]);

  const truncateTitle = (title: string | null | undefined, maxLength: number) => {
    if (!title) return '';
    return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
  };

  const songTitle = useMemo(() => {
    if (language === 'kor' && song.song_title_kor) {
      return song.song_title_kor;
    }
    return song.song_title_eng || '';
  }, [song, language]);

  const artistName = useMemo(() => {
    if (language === 'kor' && song.artist_name_kor) {
      return song.artist_name_kor;
    }
    return song.artist_name_original || '';
  }, [song, language]);

  return (
    <Link 
      to={`/deck/${song.genius_slug}`}
      className="block bg-neutral-800 hover:bg-neutral-700 rounded-md overflow-hidden shadow-sm transition-colors duration-200"
    >
      <div className="flex items-center p-3 relative">
        <img
          src={imageSrc}
          alt={songTitle || 'Song cover'}
          className="w-12 h-12 bg-neutral-600 rounded-lg overflow-hidden object-cover mr-3"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = "/images/placeholder.png";
          }}
        />
        <div className="flex-grow">
          <h2 className="text-lg font-semibold text-neutral-100 truncate">
            {truncateTitle(songTitle, 30)}
          </h2>
          <p className="text-sm text-neutral-300 truncate">
            {truncateTitle(artistName, 30)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(SongListItem);
