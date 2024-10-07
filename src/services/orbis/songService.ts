import { db, ORBIS_SONG_MODEL_ID } from './config';
import { Song } from '../../types';

const isValidSong = (song: any): song is Song => {
  return (
    song &&
    typeof song.uuid === 'string' &&
    song.uuid.trim() !== '' &&
    typeof song.song_title_eng === 'string' &&
    song.song_title_eng.trim() !== '' &&
    typeof song.artist_name_eng === 'string' &&
    song.artist_name_eng.trim() !== ''
  );
};

export const songService = {
  async getSongs(): Promise<Song[]> {
    // console.log('songService: getSongs called');
    try {
      const { rows } = await db
        .select()
        .from(ORBIS_SONG_MODEL_ID)
        .run();
      
      const validSongs = rows.filter(isValidSong);
      // console.log('songService: getSongs result', validSongs);
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
        song.artist_name_eng.toLowerCase().includes(lowerQuery))
      );
      
      // console.log('songService: searchSongs result', filteredSongs);
      return filteredSongs as Song[];
    } catch (error) {
      console.error('songService: searchSongs error', error);
      throw error;
    }
  },

  async getSongByGeniusSlug(genius_slug: string): Promise<Song | null> {
    // console.log('songService: getSongByGeniusSlug called with genius_slug', genius_slug);
    try {
      const { rows } = await db
        .select()
        .from(ORBIS_SONG_MODEL_ID)
        .where({ genius_slug: genius_slug })
        .run();

      // console.log('songService: getSongByGeniusSlug raw result', rows);
      const song = rows.length > 0 && isValidSong(rows[0]) ? rows[0] as Song : null;
      // console.log('songService: getSongByGeniusSlug processed result', song);
      return song;
    } catch (error) {
      console.error('songService: getSongByGeniusSlug error', error);
      throw error;
    }
  },
};