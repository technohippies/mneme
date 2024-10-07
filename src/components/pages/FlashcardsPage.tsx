import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Flashcard } from '../core/Flashcard';
import CloseHeader from '../layout/CloseHeader';
import { phraseService } from '../../services/orbis/phraseService';
import { userLearningDataService } from '../../services/orbis/userDataLearningService';
import { calculateFSRS, initializeCard } from '../../utils/fsrsAlgorithm';
import { getCurrentUserDID } from '../../services/orbis/config';
import { FlashcardType, UserLearningData, PhraseStatus } from '../../types';
import { quantum } from 'ldrs';
import { useAuthenticateCeramic } from '../../services/orbis/authService';
import { createUserSongService } from '../../services/orbis/userSongService';
import { songService } from '../../services/orbis/songService';

quantum.register();

const FlashcardsPage: React.FC = () => {
  const { geniusSlug } = useParams<{ geniusSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isStudyAgain = location.state?.isStudyAgain || false;
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const authenticateCeramic = useAuthenticateCeramic();
  const initializationRef = useRef(false);
  const userSongService = useMemo(() => createUserSongService(authenticateCeramic), [authenticateCeramic]);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const initializeData = useCallback(async () => {
    if (!geniusSlug || initializationRef.current) return;
    
    initializationRef.current = true;
    setIsLoading(true);
    try {
        const userDid = await getCurrentUserDID();
        if (!userDid) throw new Error('User not authenticated');

        console.log('[FlashcardsPage] User DID:', userDid);
        console.log('[FlashcardsPage] Fetching song for genius slug:', geniusSlug);

        const song = await songService.getSongByGeniusSlug(geniusSlug);
        if (!song) throw new Error(`No song found for genius slug: ${geniusSlug}`);

        console.log('[FlashcardsPage] Fetched song:', song);

        const songUuid = song.uuid;
        console.log('[FlashcardsPage] Song UUID:', songUuid);

        // Fetch phrase status to get the number of cards to study
        const phraseStatus: PhraseStatus = await userLearningDataService.getPhraseStatus(songUuid, userDid);
        console.log('[FlashcardsPage] Phrase status:', phraseStatus);

        const maxNewCardsPerDay = 20;
        const newCardsToStudy = Math.min(maxNewCardsPerDay - phraseStatus.studied_today, phraseStatus.new_count);
        const totalCardsToStudy = newCardsToStudy + phraseStatus.learning_count + phraseStatus.due_count;
        console.log('[FlashcardsPage] Calculated cards to study:', { newCardsToStudy, totalCardsToStudy, isStudyAgain });

        // Fetch all cards that need to be studied
        const cardsToStudy = await userLearningDataService.fetchCardsToStudy(songUuid, totalCardsToStudy, newCardsToStudy, isStudyAgain);
        console.log('[FlashcardsPage] Cards to study:', cardsToStudy);

        if (cardsToStudy.length === 0) {
            console.log('[FlashcardsPage] No cards to study at this time.');
            setFlashcards([]);
        } else {
            const mappedFlashcards = await Promise.all(cardsToStudy.map(async (cardId) => {
                console.log(`[FlashcardsPage] Processing card ID: ${cardId}`);
                const [cardSongUuid, phraseId] = cardId.split('-').reduce((acc, part, index, array) => {
                    if (index === array.length - 1) {
                        acc[1] = part;
                    } else {
                        acc[0] += (acc[0] ? '-' : '') + part;
                    }
                    return acc;
                }, ['', '']);

                console.log(`[FlashcardsPage] Parsed card ID - Song UUID: ${cardSongUuid}, Phrase ID: ${phraseId}`);

                if (cardSongUuid !== songUuid) {
                    console.error(`[FlashcardsPage] Mismatch in song UUID. Expected: ${songUuid}, Got: ${cardSongUuid}`);
                    return null;
                }
                if (!phraseId) {
                    console.error(`[FlashcardsPage] Invalid card ID: ${cardId}`);
                    return null;
                }
                
                console.log(`[FlashcardsPage] Fetching phrase for ID: ${phraseId}`);
                const phrase = await phraseService.getPhraseById(phraseId, songUuid);
                if (!phrase) {
                    console.error(`[FlashcardsPage] Phrase not found for card ${cardId}`);
                    return null;
                }
                
                console.log(`[FlashcardsPage] Fetched phrase:`, phrase);
                
                return {
                    ...phrase,
                    isFlipped: false,
                    id: cardId,
                    text: phrase.text,
                    text_cmn: phrase.text_cmn,
                };
            }));
            console.log('[FlashcardsPage] Mapped flashcards:', mappedFlashcards);
            const validFlashcards = mappedFlashcards.filter((card): card is FlashcardType => card !== null);
            console.log('[FlashcardsPage] Valid flashcards:', validFlashcards);
            setFlashcards(validFlashcards);
        }
    } catch (error) {
        console.error('[FlashcardsPage] Error initializing data:', error);
        setFlashcards([]);
    } finally {
        setIsLoading(false);
    }
  }, [geniusSlug, authenticateCeramic, userSongService, isStudyAgain]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const handleFlip = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleAnswer = async (grade: 1 | 3) => {
    const currentCard = flashcards[currentCardIndex];
    console.log(`[FlashcardsPage] Handling answer for card ${currentCard.id} with grade ${grade}, isStudyAgain: ${isStudyAgain}`);
    
    const updatedLearningData = await calculateUpdatedLearningData(currentCard, grade, isStudyAgain);
    console.log('[FlashcardsPage] Updated learning data:', updatedLearningData);
    
    // Save the data immediately and wait for it to complete
    try {
        await userLearningDataService.saveUserLearningData(updatedLearningData, authenticateCeramic);
        console.log(`[FlashcardsPage] Successfully saved learning data for card ${currentCard.id}`);
    } catch (error) {
        console.error(`[FlashcardsPage] Error saving learning data for card ${currentCard.id}:`, error);
    }

    // Remove the flipped state for the current card
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentCard.id);
      return newSet;
    });

    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prevIndex => prevIndex + 1);
    } else {
      navigate(`/study-completion/${geniusSlug}`);
    }
  };

  const calculateUpdatedLearningData = async (card: FlashcardType, grade: 1 | 3, isStudyAgain: boolean): Promise<UserLearningData> => {
    console.log('[FlashcardsPage] Calculating updated learning data:', { cardId: card.id, grade, isStudyAgain });
    const now = new Date();
    const flashcardId = `${card.song_uuid}-${card.phrase_id}`;
    const existingLearningData = await userLearningDataService.getUserLearningData(flashcardId);
    
    let currentData: UserLearningData;
    if (existingLearningData) {
        currentData = existingLearningData;
    } else {
        const initialCard = initializeCard();
        currentData = {
            ...initialCard,
            flashcard_id: flashcardId,
            last_review: now.toISOString(),
            next_review: now.toISOString(),
            is_removed: false,
            is_new: true,
            is_learning: false,
            is_due: false,
            studied_today: false,
            last_interval: 0,
            same_day_reviews: 0
        };
    }
    
    if (isStudyAgain) {
        return {
            ...currentData,
            last_review: now.toISOString(),
            studied_today: true,
            same_day_reviews: (currentData.same_day_reviews || 0) + 1
        };
    }
    
    const timeSinceLastReview = (now.getTime() - new Date(currentData.last_review).getTime()) / (24 * 60 * 60 * 1000);

    const fsrsResult = calculateFSRS({
        difficulty: currentData.difficulty,
        stability: currentData.stability,
        reps: currentData.reps,
        lapses: currentData.lapses,
        lastInterval: currentData.last_interval,
        timeSinceLastReview,
        grade
    });

    let nextReviewDate: Date;
    if (grade === 1) { // "Again" button
        nextReviewDate = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
    } else if (fsrsResult.interval < 1) {
        nextReviewDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now
    } else {
        nextReviewDate = new Date(now.getTime() + fsrsResult.interval * 24 * 60 * 60 * 1000);
    }

    return {
        reps: Math.max(0, fsrsResult.reps),
        lapses: Math.max(0, fsrsResult.lapses),
        stability: Math.max(0, fsrsResult.stability),
        difficulty: Math.max(1, Math.min(10, fsrsResult.difficulty)),
        is_removed: false,
        last_review: now.toISOString(),
        next_review: nextReviewDate.toISOString(),
        flashcard_id: flashcardId,
        last_interval: Math.max(0, fsrsResult.interval),
        retrievability: Math.max(0, Math.min(1, fsrsResult.retrievability)),
        is_new: false,
        is_learning: true,
        is_due: false,
        studied_today: true,
        same_day_reviews: 0
    };
  };

  const handleClose = () => {
    navigate(`/deck/${geniusSlug}`);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-900">
        <l-quantum size="45" speed="1.75" color="white"></l-quantum>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="h-screen flex flex-col bg-neutral-900 text-white">
        <CloseHeader onAction={handleClose} type="close" title="Flashcards" />
        <div className="flex-grow flex items-center justify-center">
          <p>No flashcards available to study at this time.</p>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="h-screen flex flex-col bg-neutral-900">
      <CloseHeader onAction={handleClose} type="close" />
      <div className="flex-grow flex flex-col overflow-hidden">
        {flashcards.length > 0 ? (
          <Flashcard
            id={currentCard.id}
            text={currentCard.text}
            text_cmn={currentCard.text_cmn}
            tts_cid={currentCard.tts_cid}
            audio_cid={currentCard.audio_cid}
            background_image_cid={currentCard.background_image_cid}
            isFlipped={flippedCards.has(currentCard.id)}
            onFlip={() => handleFlip(currentCard.id)}
            onAgain={() => handleAnswer(1)}
            onGood={() => handleAnswer(3)}
          />
        ) : (
          <div className="flex-grow flex items-center justify-center text-white">
            <p>No cards to study at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsPage;