import { db, ORBIS_USER_LEARNING_DATA_MODEL_ID, ORBIS_USER_DECKS_MODEL_ID, ORBIS_CONTEXT_ID } from './config';
import { phraseService } from './phraseService';
import { initializeCard } from '../../utils/fsrsAlgorithm';
import { UserLearningData, PhraseStatus } from '../../types';
import { getCurrentUserDID } from './config';

const getFlashcardIdsForDeck = async (songUuid: string): Promise<string[]> => {
    try {
        const phrases = await phraseService.getPhrases(songUuid);
        const flashcardIds = phrases.map(phrase => `${songUuid}-${phrase.phrase_id}`);
        console.log(`Generated ${flashcardIds.length} flashcard IDs for song ${songUuid}`);
        return flashcardIds;
    } catch (error) {
        console.error("Error in getFlashcardIdsForDeck:", error);
        throw error;
    }
};

export const getPhraseStatus = async (songUuid: string, userDid: string): Promise<PhraseStatus> => {
    try {
        const flashcardIds = await getFlashcardIdsForDeck(songUuid);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const epoch = new Date(0);

        const { rows: learningData } = await db
            .select()
            .from(ORBIS_USER_LEARNING_DATA_MODEL_ID)
            .where({
                controller: userDid,
                flashcard_id: { $in: flashcardIds }
            })
            .orderBy(['indexed_at', 'desc'])
            .context(ORBIS_CONTEXT_ID)
            .run();

        console.log('Raw learning data:', JSON.stringify(learningData, null, 2));

        let newCount = 0;
        let learningCount = 0;
        let dueCount = 0;
        let studiedToday = 0;

        const seenFlashcards = new Map();

        learningData.forEach(data => {
            if (!seenFlashcards.has(data.flashcard_id) || data.reps > seenFlashcards.get(data.flashcard_id).reps) {
                seenFlashcards.set(data.flashcard_id, data);
            }
        });

        seenFlashcards.forEach((data, flashcardId) => {
            const lastReview = new Date(data.last_review);

            console.log(`Processing flashcard ${flashcardId}:`);
            console.log(`  Last review: ${lastReview}`);
            console.log(`  Reps: ${data.reps}`);

            if (lastReview >= today) {
                studiedToday++;
                learningCount++;
                console.log('  Status: Learning (Studied today)');
            } else if (lastReview.getTime() === epoch.getTime() || data.reps === 0) {
                newCount++;
                console.log('  Status: New');
            } else {
                dueCount++;
                console.log('  Status: Due');
            }
        });

        // Add any uninitialized flashcards to the new count
        newCount += flashcardIds.length - seenFlashcards.size;

        console.log('Phrase status calculation:', {
            newCount,
            learningCount,
            dueCount,
            studiedToday,
            totalCards: flashcardIds.length,
            processedCards: seenFlashcards.size
        });

        return {
            new_count: newCount,
            learning_count: learningCount,
            due_count: dueCount,
            studied_today: studiedToday
        };
    } catch (error) {
        console.error("Error in getPhraseStatus:", error);
        throw error;
    }
};

export const initializeUserLearningDataForSong = async (
    songUuid: string, 
    userDid: string,
    authenticateCeramic: () => Promise<any>
): Promise<void> => {
    if (!ORBIS_USER_LEARNING_DATA_MODEL_ID || !ORBIS_USER_DECKS_MODEL_ID || !ORBIS_CONTEXT_ID) {
        console.error('Missing environment variables');
        throw new Error('Configuration error: Missing environment variables');
    }

    try {
        console.log('Checking initialization status for song:', songUuid);
        const initializationStatus = await checkDeckInitialization(songUuid, userDid);

        console.log('Initialization status:', initializationStatus);

        if (initializationStatus.isFullyInitialized) {
            console.log('Flashcards already initialized for this song, skipping initialization');
            return;
        }

        console.log('Initializing learning data for song:', songUuid, 'and user:', userDid);
        
        // Fetch all phrases for the song
        const phrases = await phraseService.getPhrases(songUuid);
        console.log('Phrases for song:', phrases);

        const initialLearningDataBatch = phrases.map(phrase => {
            const initialState = initializeCard();
            return {
                reps: initialState.reps,
                lapses: initialState.lapses,
                stability: initialState.stability,
                difficulty: initialState.difficulty,
                is_removed: false,
                next_review: new Date(0).toISOString(),
                flashcard_id: `${songUuid}-${phrase.phrase_id}`,
                last_interval: initialState.interval,
                retrievability: initialState.retrievability,
                last_review: new Date(0).toISOString()
            };
        });

        console.log('Initial learning data batch:', JSON.stringify(initialLearningDataBatch, null, 2));

        if (initialLearningDataBatch.length === 0) {
            console.log("No new flashcards to initialize");
            return;
        }

        const isAuthenticated = await authenticateCeramic();
        if (!isAuthenticated) {
            throw new Error('Failed to authenticate with Ceramic');
        }

        console.log("Inserting bulk data...");
        const { success, errors } = await db
            .insertBulk(ORBIS_USER_LEARNING_DATA_MODEL_ID)
            .values(initialLearningDataBatch)
            .context(ORBIS_CONTEXT_ID)
            .run();

        console.log("Bulk insert result:", JSON.stringify({ success, errors }, null, 2));

        if (errors.length) {
            console.error("Errors occurred during bulk insert:", errors);
        }

        console.log("Bulk insert success:", success);
        console.log("Initialization complete");

        // Ensure the song is in the user's deck
        const existingSong = await db
            .select()
            .from(ORBIS_USER_DECKS_MODEL_ID)
            .where({ controller: userDid, song_uuid: songUuid })
            .context(ORBIS_CONTEXT_ID)
            .run();

        if (existingSong.rows.length === 0) {
            await db
                .insert(ORBIS_USER_DECKS_MODEL_ID)
                .value({
                    song_uuid: songUuid,
                    date_added: new Date().toISOString(),
                    last_practiced: new Date().toISOString(),
                    status: 'active'
                })
                .context(ORBIS_CONTEXT_ID)
                .run();
            console.log("Song added to user's deck");
        } else {
            console.log("Song already in user's deck");
        }
    } catch (error) {
        console.error("Error in initializeUserLearningDataForSong:", error);
        throw error;
    }
};

const saveUserLearningData = async (
    learningData: UserLearningData,
    authenticateCeramic: () => Promise<any>
): Promise<void> => {
    if (!ORBIS_USER_LEARNING_DATA_MODEL_ID || !ORBIS_CONTEXT_ID) {
        console.error('Missing environment variables');
        throw new Error('Configuration error: Missing environment variables');
    }

    console.log('Attempting to save learning data for flashcard:', learningData.flashcard_id);

    try {
        const isAuthenticated = await authenticateCeramic();
        if (!isAuthenticated) {
            throw new Error('Failed to authenticate with Ceramic');
        }

        // Prepare data for saving, excluding controller and ensuring correct types
        const dataToSave = {
            reps: Number(learningData.reps),
            lapses: Number(learningData.lapses),
            stability: Math.max(Number(learningData.stability), 0),
            difficulty: Number(learningData.difficulty),
            is_removed: Boolean(learningData.is_removed),
            last_review: learningData.last_review,
            next_review: learningData.next_review,
            flashcard_id: learningData.flashcard_id,
            last_interval: Number(learningData.last_interval),
            retrievability: Number(learningData.retrievability)
        };

        console.log('Saving learning data:', JSON.stringify(dataToSave, null, 2));

        // Always insert a new entry
        const result = await db
            .insert(ORBIS_USER_LEARNING_DATA_MODEL_ID)
            .value(dataToSave)
            .context(ORBIS_CONTEXT_ID)
            .run();

        console.log('Save operation result:', JSON.stringify(result, null, 2));

        if (result.id) {
            console.log('Successfully saved learning data for flashcard:', learningData.flashcard_id);
        } else {
            console.error('Failed to save learning data for flashcard:', learningData.flashcard_id);
        }
    } catch (error) {
        console.error('Error saving learning data for flashcard:', learningData.flashcard_id, error);
        throw error;
    }
};

const getUserLearningData = async (flashcardId: string): Promise<UserLearningData | null> => {
    if (!ORBIS_USER_LEARNING_DATA_MODEL_ID || !ORBIS_CONTEXT_ID) {
        console.error('Missing environment variables');
        throw new Error('Configuration error: Missing environment variables');
    }

    try {
        const result = await db
            .select()
            .from(ORBIS_USER_LEARNING_DATA_MODEL_ID)
            .where({ flashcard_id: flashcardId })
            .orderBy(["last_review", "desc"])
            .limit(1)
            .context(ORBIS_CONTEXT_ID)
            .run();

        if (result.rows.length > 0) {
            const latestData = result.rows[0] as UserLearningData;
            
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const lastReview = new Date(latestData.last_review);
            const nextReview = new Date(latestData.next_review);
            const INITIALIZATION_DATE = new Date(0);

            latestData.is_new = lastReview.getTime() === INITIALIZATION_DATE.getTime();
            latestData.studied_today = lastReview.toDateString() === today.toDateString();
            
            if (latestData.is_new) {
                latestData.is_learning = false;
                latestData.is_due = true;
            } else if (latestData.studied_today) {
                latestData.is_learning = true;
                latestData.is_due = false;
            } else {
                latestData.is_learning = false;
                latestData.is_due = nextReview <= today;
            }

            console.log(`Learning data for flashcard ${flashcardId}:`, {
                is_new: latestData.is_new,
                is_learning: latestData.is_learning,
                is_due: latestData.is_due,
                studied_today: latestData.studied_today,
                last_review: latestData.last_review,
                next_review: latestData.next_review,
                next_review_date: nextReview.toDateString(),
                today_date: today.toDateString()
            });

            return latestData;
        } else {
            console.log(`No learning data found for flashcard ${flashcardId}`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user learning data:', error);
        throw error;
    }
};

export const checkDeckInitialization = async (songUuid: string, userDid: string): Promise<{ isFullyInitialized: boolean, uninitializedFlashcards: string[] }> => {
    try {
        const flashcardIds = await getFlashcardIdsForDeck(songUuid);
        const { rows: learningData } = await db
            .select()
            .from(ORBIS_USER_LEARNING_DATA_MODEL_ID)
            .where({
                controller: userDid,
                flashcard_id: { $in: flashcardIds }
            })
            .context(ORBIS_CONTEXT_ID)
            .run();

        const initializedFlashcards = new Set(learningData.map(data => data.flashcard_id));
        const uninitializedFlashcards = flashcardIds.filter(id => !initializedFlashcards.has(id));

        return {
            isFullyInitialized: uninitializedFlashcards.length === 0,
            uninitializedFlashcards
        };
    } catch (error) {
        console.error("Error in checkDeckInitialization:", error);
        throw error;
    }
};

const getStudiedCardsCountForToday = async (songUuid: string, userDid: string): Promise<number> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { rows } = await db
        .select()
        .from(ORBIS_USER_LEARNING_DATA_MODEL_ID)
        .where({
            controller: userDid,
            last_review: { $gte: today.toISOString() },
            flashcard_id: { $startsWith: songUuid }
        })
        .context(ORBIS_CONTEXT_ID)
        .run();

    return rows.length;
};

const getCardsStudiedToday = async (songUuid: string, userDid: string): Promise<string[]> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(`Fetching cards studied today for song ${songUuid} and user ${userDid}`);
    console.log(`Today's date (for comparison): ${today.toISOString()}`);

    const { rows } = await db
        .select()
        .from(ORBIS_USER_LEARNING_DATA_MODEL_ID)
        .where({
            controller: userDid,
            last_review: { $gte: today.toISOString() },
            flashcard_id: { $startsWith: songUuid }
        })
        .context(ORBIS_CONTEXT_ID)
        .run();

    console.log('Cards studied today (raw data):', rows);

    const studiedCards = rows.map(row => row.flashcard_id);
    console.log('Cards studied today (flashcard IDs):', studiedCards);

    return studiedCards;
};
const fetchCardsToStudy = async (songUuid: string, totalCards: number, maxNewCards: number, isStudyAgain: boolean): Promise<string[]> => {
    console.log(`[userDataLearningService] Fetching cards to study for song ${songUuid}`);
    console.log(`[userDataLearningService] Total cards requested: ${totalCards}, Max new cards: ${maxNewCards}, Is Study Again: ${isStudyAgain}`);

    const allFlashcardIds = await getFlashcardIdsForDeck(songUuid);
    console.log(`[userDataLearningService] All flashcard IDs for song ${songUuid}:`, allFlashcardIds);

    const userDid = await getCurrentUserDID();
    if (!userDid) {
        console.error('[userDataLearningService] User not authenticated');
        return [];
    }

    const result = await db
        .select()
        .from(ORBIS_USER_LEARNING_DATA_MODEL_ID)
        .where({
            flashcard_id: { $in: allFlashcardIds },
            controller: userDid
        })
        .orderBy(['last_review', 'desc'])
        .context(ORBIS_CONTEXT_ID)
        .run();

    console.log(`[userDataLearningService] Found ${result.rows.length} learning data entries for this user and song`);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Group cards by flashcard_id, keeping only the most recent entry for each
    const latestCardData = result.rows.reduce((acc, card) => {
        if (!acc[card.flashcard_id] || new Date(card.last_review) > new Date(acc[card.flashcard_id].last_review)) {
            acc[card.flashcard_id] = card;
        }
        return acc;
    }, {} as Record<string, UserLearningData>);

    console.log('[userDataLearningService] Latest card data:', JSON.stringify(latestCardData, null, 2));

    const studiedTodayIds = new Set(Object.values(latestCardData)
        .filter(card => new Date(card.last_review) >= today)
        .map(card => card.flashcard_id));

    console.log(`[userDataLearningService] Cards studied today: ${studiedTodayIds.size}`);

    let availableCards: UserLearningData[];
    if (isStudyAgain) {
        availableCards = Object.values(latestCardData).filter(card => studiedTodayIds.has(card.flashcard_id));
    } else {
        availableCards = allFlashcardIds.map(id => {
            if (latestCardData[id]) {
                return latestCardData[id];
            } else {
                return {
                    flashcard_id: id,
                    last_review: new Date(0).toISOString(),
                    next_review: new Date(0).toISOString(),
                    reps: 0,
                    lapses: 0,
                    stability: 0,
                    difficulty: 0,
                    is_removed: false,
                    last_interval: 0,
                    retrievability: 0
                };
            }
        });
    }

    console.log(`[userDataLearningService] Available cards for ${isStudyAgain ? 'study again' : 'regular study'}: ${availableCards.length}`);

    const newCards = availableCards.filter(card => new Date(card.last_review).getTime() === new Date(0).getTime());
    const dueCards = availableCards.filter(card => {
        const nextReview = new Date(card.next_review);
        return nextReview <= now && new Date(card.last_review).getTime() !== new Date(0).getTime() && !studiedTodayIds.has(card.flashcard_id);
    });
    const learningCards = availableCards.filter(card => {
        const lastReview = new Date(card.last_review);
        return lastReview >= today && new Date(card.last_review).getTime() !== new Date(0).getTime();
    });

    console.log(`[userDataLearningService] Available new cards: ${newCards.length}, Due cards: ${dueCards.length}, Learning cards: ${learningCards.length}`);

    const newCardsToStudy = isStudyAgain ? 0 : Math.min(newCards.length, maxNewCards);

    console.log(`[userDataLearningService] New cards to study: ${newCardsToStudy}`);

    const cardsToStudy = isStudyAgain
        ? availableCards
        : [...dueCards, ...learningCards, ...newCards.slice(0, newCardsToStudy)].slice(0, totalCards);

    console.log(`[userDataLearningService] Final cards to study:`, cardsToStudy.map(card => card.flashcard_id));

    return cardsToStudy.map(card => card.flashcard_id);
};


export const userLearningDataService = {
    initializeUserLearningDataForSong,
    getUserLearningData,
    saveUserLearningData: (learningData: UserLearningData, authenticateCeramic: () => Promise<any>) => 
        saveUserLearningData(learningData, authenticateCeramic),
    checkDeckInitialization,
    isDue: (learningData: UserLearningData): boolean => {
        const now = new Date();
        const nextReview = new Date(learningData.next_review);
        return now >= nextReview;
    },
    getStudiedCardsCountForToday,
    getCardsStudiedToday,
    fetchCardsToStudy,
    getPhraseStatus,
    getFlashcardIdsForDeck
};