import { db, ORBIS_PHRASE_MODEL_ID, ORBIS_CONTEXT_ID } from './config';
import { Phrase, PhraseStatus } from '../../types';
import { getCurrentUserDID } from './config';
import { songService } from './songService';
import { userLearningDataService } from './userDataLearningService';
import i18n from '../../i18n';
import { SupportedLocale } from '../../config/languages';

const MAX_NEW_CARDS = 20;

export const phraseService = {
  async getPhrases(songUuid: string): Promise<Phrase[]> {
    // console.log('phraseService: getPhrases called with songUuid', songUuid);
    try {
      const { rows } = await db
        .select()
        .from(ORBIS_PHRASE_MODEL_ID)
        .where({ song_uuid: songUuid })
        .orderBy(['start_time', 'asc']) // Add this line to sort by start_time
        .run();

      const phrases = rows as Phrase[];
      return this.addTranslationsToPhrase(phrases);
    } catch (error) {
      console.error('phraseService: getPhrases error', error);
      throw error;
    }
  },

  async addTranslationsToPhrase(phrases: Phrase[]): Promise<Phrase[]> {
    const currentLang = localStorage.getItem('userLanguage') as SupportedLocale || i18n.language as SupportedLocale;
    // console.log('Current language in phraseService:', currentLang);
    return phrases.map(phrase => {
      const translationKey = `text_${currentLang}` as keyof Phrase;
      const translation = phrase[translationKey] as string | undefined;
      // console.log('Full phrase object:', phrase);
      // console.log(`Translation for ${currentLang}:`, translation);
      return {
        ...phrase,
        translatedText: translation || phrase.text || '',
        text_cmn: phrase.text_cmn || '',
        text_jpn: phrase.text_jpn || '',
        text_kor: phrase.text_kor || '',
      };
    });
  },

  async getPhraseById(phraseId: string, expectedSongUuid: string): Promise<Phrase | null> {
    // console.log(`Fetching phrase with ID: ${phraseId} for song UUID: ${expectedSongUuid}`);
    try {
      const result = await db
        .select()
        .from(ORBIS_PHRASE_MODEL_ID)
        .where({ phrase_id: phraseId, song_uuid: expectedSongUuid })
        .context(ORBIS_CONTEXT_ID)
        .run();

      // console.log(`Raw query result for phrase ${phraseId}:`, result.rows);

      if (result.rows.length > 0) {
        const phrase = result.rows[0] as Phrase;
        // console.log(`Processed phrase for ID ${phraseId}:`, phrase);
        return phrase;
      } else {
        console.log(`No phrase found with ID: ${phraseId} for song UUID: ${expectedSongUuid}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching phrase with ID ${phraseId}:`, error);
      return null;
    }
  },

  async getPhraseStatus(songUuid: string): Promise<PhraseStatus> {
    // console.log('phraseService: getPhraseStatus called with songUuid', songUuid);
    try {
      const userDID = await getCurrentUserDID();
      console.log('Current user DID:', userDID);

      if (!userDID) {
        throw new Error('User DID is null. User might not be authenticated.');
      }

      const song = await songService.getSongByUuid(songUuid);
      console.log('Song details:', song);

      const allPhrases = await this.getPhrases(songUuid);

      let newCount = 0;
      let learningCount = 0;
      let dueCount = 0;
      let studiedToday = 0;

      for (const phrase of allPhrases) {
        const flashcardId = `${songUuid}-${phrase.phrase_id}`;
        const learningData = await userLearningDataService.getUserLearningData(flashcardId);

        if (learningData) {
          if (learningData.is_new) {
            if (newCount < MAX_NEW_CARDS) {
              newCount++;
              dueCount++; // Count new cards as due
            }
          } else if (learningData.studied_today) { // Change this line
            learningCount++;
            studiedToday++;
          } else if (userLearningDataService.isDue(learningData)) {
            dueCount++;
          } else {
            learningCount++;
          }
        } else {
          if (newCount < MAX_NEW_CARDS) {
            newCount++;
            dueCount++; // Count new cards as due
          }
        }

        if (newCount + learningCount + dueCount >= MAX_NEW_CARDS) {
          break;
        }
      }

      // console.log('Calculation details:', {
      //   totalPhrases: allPhrases.length,
      //   newCount,
      //   learningCount,
      //   dueCount,
      //   studiedToday
      // });

      const status: PhraseStatus = {
        new_count: newCount,
        learning_count: learningCount,
        due_count: dueCount,
        studied_today: studiedToday
      };

      // console.log('Final phrase status:', status);
      return status;
    } catch (error) {
      console.error('Error in getPhraseStatus:', error);
      throw error;
    }
  },

  getPhrasesByGeniusSlug: async (geniusSlug: string): Promise<Phrase[]> => {
    // First, get the song UUID using the genius slug
    const song = await songService.getSongByGeniusSlug(geniusSlug);
    if (!song) {
      throw new Error(`No song found for genius slug: ${geniusSlug}`);
    }

    // Then, get the phrases for that song
    return phraseService.getPhrases(song.uuid);
  },
};
