import { db, ORBIS_SONG_MODEL_ID } from './config';
import { Song } from '../../types';
import { Searcher } from 'fast-fuzzy';

const isValidSong = (song: any): song is Song => {
  return (
    song &&
    typeof song.uuid === 'string' &&
    typeof song.song_title_eng === 'string' &&
    typeof song.artist_name_original === 'string' &&
    song.uuid.trim() !== '' &&
    song.song_title_eng.trim() !== '' &&
    song.artist_name_original.trim() !== ''
  );
};

export const songService = {
  async getSongs(): Promise<Song[]> {
    try {
      const { rows } = await db
        .select()
        .from(ORBIS_SONG_MODEL_ID)
        .run();
      
      return rows.filter(isValidSong);
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
  },

  async getSongByUuid(uuid: string): Promise<Song | null> {
    try {
      const { rows } = await db
        .select()
        .from(ORBIS_SONG_MODEL_ID)
        .where({ uuid })
        .run();
      
      return rows.length > 0 && isValidSong(rows[0]) ? rows[0] : null;
    } catch (error) {
      console.error('Error fetching song by UUID:', error);
      throw error;
    }
  },

  async searchSongs(query: string, language: string | null = null): Promise<Song[]> {
    try {
      console.log('songService: Searching songs with query:', query, 'Language:', language);
      let filteredSongs: Song[];
      
      if (language) {
        filteredSongs = await this.getSongsByLanguage(language);
      } else {
        filteredSongs = await this.getSongs();
      }
      
      console.log('songService: Filtered songs before search:', filteredSongs);

      const cleanQuery = query.trim().toLowerCase();

      if (cleanQuery === '') {
        return filteredSongs.slice(0, 20); // Return first 20 songs if query is empty
      }

      // Perform exact matching first
      const exactMatches = filteredSongs.filter(song => 
        song.song_title_eng.toLowerCase().includes(cleanQuery) ||
        song.artist_name_original.toLowerCase().includes(cleanQuery)
      );

      // If we have exact matches, return them
      if (exactMatches.length > 0) {
        console.log('songService: Exact matches found:', exactMatches);
        return exactMatches.slice(0, 20);
      }

      // If no exact matches, use fuzzy search
      const searcher = new Searcher(filteredSongs, {
        keySelector: (song) => `${song.song_title_eng} ${song.artist_name_original}`,
        threshold: 0.6, // Increased threshold for stricter matching
      });

      const searchResults = searcher.search(cleanQuery);
      
      console.log('songService: Fuzzy search results:', searchResults);

      return searchResults.slice(0, 20); // Limit to top 20 results
    } catch (error) {
      console.error('Error searching songs:', error);
      throw error;
    }
  },

  calculateRelevance(song: Song, query: string): number {
    let relevance = 0;
    const title = song.song_title_eng.toLowerCase();
    const artist = song.artist_name_original.toLowerCase();

    if (title.startsWith(query)) relevance += 3;
    if (artist.startsWith(query)) relevance += 2;
    if (title.includes(query)) relevance += 1;
    if (artist.includes(query)) relevance += 1;

    return relevance;
  },

  async getSongByGeniusSlug(genius_slug: string): Promise<Song | null> {
    try {
      const { rows } = await db
        .select()
        .from(ORBIS_SONG_MODEL_ID)
        .where({ genius_slug })
        .run();

      if (rows.length > 0 && isValidSong(rows[0])) {
        const song = rows[0];
        song.translatedTitles = Object.fromEntries(
          Object.entries(song)
            .filter(([key, value]) => 
              key.startsWith('song_title_') && key !== 'song_title_eng' && typeof value === 'string'
            )
            .map(([key, value]) => [key, value as string])
        );
        return song;
      }
      return null;
    } catch (error) {
      console.error('Error fetching song by Genius slug:', error);
      throw error;
    }
  },

  async getSongsByLanguage(language: string): Promise<Song[]> {
    try {
      const { rows } = await db
        .select()
        .from(ORBIS_SONG_MODEL_ID)
        .where({ language })
        .limit(50) // Increased from 15 to 50
        .run();
      
      return rows.filter(isValidSong).map(song => ({
        ...song,
        song_title: song[`song_title_${language}` as keyof Song] as string || song.song_title_eng
      }));
    } catch (error) {
      console.error(`Error fetching songs for language ${language}:`, error);
      throw error;
    }
  },
};

export const logCeramicConnectionStatus = async () => {
  try {
    const isConnected = await db.isUserConnected();
    console.log('Is user connected to Ceramic:', isConnected);
    if (isConnected) {
      const user = await db.getConnectedUser();
      console.log('Connected user:', user);
    }
  } catch (error) {
    console.error('Error checking Ceramic connection status:', error);
  }
};
