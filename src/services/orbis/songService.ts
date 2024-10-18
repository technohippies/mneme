import { db, ORBIS_SONG_MODEL_ID } from './config';
import { Song } from '../../types';

const isValidSong = (song: any): song is Song => {
  console.log('Validating song:', song);
  
  if (!song) {
    console.log('Song is null or undefined');
    return false;
  }

  const checks = [
    { field: 'uuid', type: 'string' },
    { field: 'song_title_eng', type: 'string' },
    { field: 'artist_name_original', type: 'string' }
  ];

  for (const check of checks) {
    if (typeof song[check.field] !== check.type) {
      console.log(`Invalid ${check.field}: expected ${check.type}, got ${typeof song[check.field]}`);
      return false;
    }
    if (song[check.field]?.trim() === '') {
      console.log(`Invalid ${check.field}: empty string`);
      return false;
    }
  }

  console.log('Song is valid');
  return true;
};

export const songService = {
  async getSongs(): Promise<Song[]> {
    console.log('songService: getSongs called');
    console.log('ORBIS_SONG_MODEL_ID:', ORBIS_SONG_MODEL_ID);
    try {
      console.log('Attempting to fetch songs...');
      const result = await db
        .select()
        .from(ORBIS_SONG_MODEL_ID)
        .run();
      
      console.log('Raw result:', result);
      
      const { rows } = result;
      console.log('Fetched rows:', rows);
      
      const validSongs = rows.filter(isValidSong);
      console.log('Valid songs:', validSongs);
      return validSongs;
    } catch (error) {
      console.error('songService: getSongs error', error);
      throw error;
    }
  },

  async getSongByUuid(uuid: string): Promise<Song | null> {
    // console.log('songService: getSongByUuid called with uuid', uuid);
    try {
      const { rows } = await db
        .select()
        .from(ORBIS_SONG_MODEL_ID)
        .where({ uuid })
        .run();
      
      const song = rows.length > 0 && isValidSong(rows[0]) ? rows[0] as Song : null;
      // console.log('songService: getSongByUuid result', song);
      return song;
    } catch (error) {
      // console.error('songService: getSongByUuid error', error);
      throw error;
    }
  },

  async searchSongs(query: string): Promise<Song[]> {
    // console.log('songService: searchSongs called with query', query);
    try {
      const { rows } = await db
        .select()
        .from(ORBIS_SONG_MODEL_ID)
        .run();
      
      const lowerQuery = query.toLowerCase();
      const filteredSongs = rows.filter((song: any) => 
        isValidSong(song) &&
        (song.song_title_eng.toLowerCase().includes(lowerQuery) ||
        song.artist_name_original.toLowerCase().includes(lowerQuery))
      );
      
      // console.log('songService: searchSongs result', filteredSongs);
      return filteredSongs as Song[];
    } catch (error) {
      console.error('songService: searchSongs error', error);
      throw error;
    }
  },

  async getSongByGeniusSlug(genius_slug: string): Promise<Song | null> {
    try {
      const { rows } = await db
        .select()
        .from(ORBIS_SONG_MODEL_ID)
        .where({ genius_slug: genius_slug })
        .run();

      const song = rows.length > 0 && isValidSong(rows[0]) ? rows[0] as Song : null;
      
      if (song) {
        song.translatedTitles = Object.fromEntries(
          Object.entries(song)
            .filter(([key, value]) => 
              key.startsWith('song_title_') && key !== 'song_title_eng' && typeof value === 'string'
            )
            .map(([key, value]) => [key, value as string])
        );
      }
      
      return song;
    } catch (error) {
      console.error('songService: getSongByGeniusSlug error', error);
      throw error;
    }
  },

  async getSongsByLanguage(language: string): Promise<Song[]> {
    console.log(`Fetching songs for language: ${language}`);
    try {
      const result = await db
        .select()
        .from(ORBIS_SONG_MODEL_ID)
        .where({ language: language })
        .limit(15)
        .run();
      
      const { rows } = result;
      const validSongs = rows.filter(isValidSong).map(song => {
        const titleKey = `song_title_${language}` as keyof Song;
        return {
          ...song,
          song_title: song[titleKey] as string || song.song_title_eng
        };
      });
      console.log(`Valid songs for ${language}:`, validSongs.length);
      
      return validSongs as Song[];
    } catch (error) {
      console.error(`songService: getSongsByLanguage error for ${language}:`, error);
      throw error;
    }
  },
};

// Add this function to test the connection
export const logCeramicConnectionStatus = async () => {
  const isConnected = await db.isUserConnected();
  console.log('Is user connected to Ceramic:', isConnected);
  if (isConnected) {
    const user = await db.getConnectedUser();
    console.log('Connected user:', user);
  }
};
