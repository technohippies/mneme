import { db, ORBIS_USER_DECKS_MODEL_ID, ORBIS_USER_LEARNING_DATA_MODEL_ID, ORBIS_CONTEXT_ID, getCurrentUserDID } from './config';

export const createUserSongService = (authenticateCeramic: () => Promise<any>) => ({
  addSongToDeck: async (songUuid: string): Promise<boolean> => {
    console.log('addSongToDeck called with songUuid:', songUuid);
    try {
      const session = await authenticateCeramic();
      
      if (!session) {
        console.error('Failed to authenticate with Ceramic');
        return false;
      }

      const userDID = await getCurrentUserDID();
      console.log('User DID:', userDID);
      console.log('ORBIS_USER_DECKS_MODEL_ID:', ORBIS_USER_DECKS_MODEL_ID);
      console.log('ORBIS_CONTEXT_ID:', ORBIS_CONTEXT_ID);

      if (!userDID || !ORBIS_USER_DECKS_MODEL_ID || !ORBIS_CONTEXT_ID) {
        console.error('User not authenticated or missing environment variables');
        return false;
      }

      console.log('Checking if song is already in user\'s deck');
      const existingSong = await db
        .select()
        .from(ORBIS_USER_DECKS_MODEL_ID)
        .where({ controller: userDID, song_uuid: songUuid })
        .context(ORBIS_CONTEXT_ID)
        .run();

      console.log('Existing song query result:', existingSong);

      if (existingSong.rows.length > 0) {
        console.log('Song already in user\'s deck');
        return false; // Changed to false to indicate no new addition
      }

      console.log('Adding song to user\'s deck');
      const insertResult = await db
        .insert(ORBIS_USER_DECKS_MODEL_ID)
        .value({
          song_uuid: songUuid,
          date_added: new Date().toISOString(),
          last_practiced: new Date().toISOString(),
          status: 'active'
        })
        .context(ORBIS_CONTEXT_ID)
        .run();

      console.log('Insert result:', insertResult);
      console.log('Song added to deck:', songUuid);
      return true;
    } catch (error) {
      console.error('Error adding song to deck:', error);
      return false;
    }
  },

  getUserDecks: async (): Promise<any[]> => {
    try {
      const session = await authenticateCeramic();
      
      if (!session) {
        console.error('Failed to authenticate with Ceramic');
        return [];
      }

      const userDID = await getCurrentUserDID();
      if (!userDID || !ORBIS_USER_DECKS_MODEL_ID || !ORBIS_CONTEXT_ID) {
        console.error('User not authenticated or missing environment variables');
        return [];
      }

      const result = await db
        .select()
        .from(ORBIS_USER_DECKS_MODEL_ID)
        .where({ controller: userDID })
        .context(ORBIS_CONTEXT_ID)
        .run();

      console.log('User decks:', result.rows);
      return result.rows;
    } catch (error) {
      console.error('Error getting user decks:', error);
      return [];
    }
  },

  updateDeckStatus: async (songUuid: string, status: string): Promise<boolean> => {
    try {
      const session = await authenticateCeramic();
      
      if (!session) {
        console.error('Failed to authenticate with Ceramic');
        return false;
      }

      const userDID = await getCurrentUserDID();
      if (!userDID || !ORBIS_USER_DECKS_MODEL_ID || !ORBIS_CONTEXT_ID) {
        console.error('User not authenticated or missing environment variables');
        return false;
      }

      // First, we need to find the specific deck entry
      const existingDeck = await db
        .select()
        .from(ORBIS_USER_DECKS_MODEL_ID)
        .where({ controller: userDID, song_uuid: songUuid })
        .context(ORBIS_CONTEXT_ID)
        .run();

      if (existingDeck.rows.length === 0) {
        console.error('Deck not found for the given song UUID');
        return false;
      }

      const deckId = existingDeck.rows[0].id; // Assuming the ID field is named 'id'

      // Now we can update the specific deck entry
      await db
        .update(deckId)
        .set({
          status: status,
          last_practiced: new Date().toISOString()
        })
        .run();

      console.log('Deck status updated:', songUuid, status);
      return true;
    } catch (error) {
      console.error('Error updating deck status:', error);
      return false;
    }
  },

  isSongInUserDeck: async (songUuid: string): Promise<boolean> => {
    try {
      const session = await authenticateCeramic();
      
      if (!session) {
        console.error('Failed to authenticate with Ceramic');
        return false;
      }

      const userDID = await getCurrentUserDID();
      if (!userDID || !ORBIS_USER_DECKS_MODEL_ID || !ORBIS_CONTEXT_ID) {
        console.error('User not authenticated or missing environment variables');
        return false;
      }

      const result = await db
        .select()
        .from(ORBIS_USER_DECKS_MODEL_ID)
        .where({ controller: userDID, song_uuid: songUuid })
        .context(ORBIS_CONTEXT_ID)
        .run();

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking if song is in user deck:', error);
      return false;
    }
  },

  isSongLearningDataInitialized: async (songUuid: string, userDid: string): Promise<boolean> => {
    try {
      const session = await authenticateCeramic();
      
      if (!session) {
        console.error('Failed to authenticate with Ceramic');
        return false;
      }

      console.log('Checking if song learning data is initialized:', songUuid, userDid);

      const result = await db
        .select()
        .from(ORBIS_USER_LEARNING_DATA_MODEL_ID)
        .where({ 
          flashcard_id: { $regex: `^${songUuid}-` },
          controller: userDid 
        })
        .context(ORBIS_CONTEXT_ID)
        .run();

      console.log('Song learning data initialization check result:', JSON.stringify(result, null, 2));

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking if song learning data is initialized:', error);
      return false;
    }
  }
});
