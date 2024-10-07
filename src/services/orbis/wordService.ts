import { db, ORBIS_WORD_MODEL_ID } from './config';
import { Word } from '../../types';

// Define the OrderByParams type locally
type OrderByParams = [string, "asc" | "desc"];

export const wordService = {
  async getWords(phraseId: string): Promise<Word[]> {
    console.log('wordService: getWords called with phraseId', phraseId);
    try {
      const orderBy: OrderByParams = ['start_time', 'asc'];
      const { rows } = await db
        .select()
        .from(ORBIS_WORD_MODEL_ID)
        .where({ phrase_id: phraseId })
        .orderBy(orderBy)
        .run();
      console.log('wordService: getWords result', rows);
      return rows.map((row, index) => ({
        ...row,
        word_index: index // Add this line to include the word_index
      })) as Word[];
    } catch (error) {
      console.error('wordService: getWords error', error);
      throw error;
    }
  },

  async getWordById(wordId: string): Promise<Word | null> {
    console.log('wordService: getWordById called with wordId', wordId);
    try {
      const { rows } = await db
        .select()
        .from(ORBIS_WORD_MODEL_ID)
        .where({ stream_id: wordId })
        .run();
      console.log('wordService: getWordById result', rows[0] || null);
      return rows.length > 0 ? rows[0] as Word : null;
    } catch (error) {
      console.error('wordService: getWordById error', error);
      throw error;
    }
  },
};
