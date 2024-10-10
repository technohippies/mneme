import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { quantum } from 'ldrs';
import CloseHeader from '../layout/CloseHeader';
import { phraseService } from '../../services/orbis/phraseService';
import { songService } from '../../services/orbis/songService';
import { Phrase } from '../../types';
import { Button } from "../ui/button";

quantum.register();

interface MatchPhrase extends Phrase {
  isMatched: boolean;
  isSelected: boolean;
  type: 'primary' | 'secondary';
}

const MatchStudyPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { geniusSlug } = useParams<{ geniusSlug: string }>();
  const navigate = useNavigate();
  const [phrases, setPhrases] = useState<MatchPhrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<MatchPhrase | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isLoadingNewGame, setIsLoadingNewGame] = useState(false);

  // Remove this line as it's not being used
  // const { state } = location;

  const fetchPhrases = useCallback(async () => {
    setIsLoadingNewGame(true);
    if (!geniusSlug) {
      setError('No song selected. Please choose a song from the list.');
      setIsLoading(false);
      setIsLoadingNewGame(false);
      return;
    }

    try {
      const song = await songService.getSongByGeniusSlug(geniusSlug);
      if (!song) {
        throw new Error(`Song not found for geniusSlug: ${geniusSlug}`);
      }

      const phrasesData = await phraseService.getPhrases(song.uuid);
      console.log('Raw phrases data:', phrasesData);

      const uniquePhrasesMap = new Map<string, Phrase>();

      for (const phrase of phrasesData) {
        const key = `${phrase.text}|${phrase.text_cmn}`;
        if (!uniquePhrasesMap.has(key)) {
          uniquePhrasesMap.set(key, phrase);
        }
      }

      const shuffledUniquePhrases = shuffleArray(Array.from(uniquePhrasesMap.values()));
      const selectedPhrases = shuffledUniquePhrases.slice(0, 6);

      console.log('Selected unique phrases:', selectedPhrases);

      const matchPhrases: MatchPhrase[] = selectedPhrases.flatMap(phrase => [
        { ...phrase, isMatched: false, isSelected: false, type: 'primary' },
        { ...phrase, isMatched: false, isSelected: false, type: 'secondary' }
      ]);

      console.log('Final match phrases:', matchPhrases);

      setPhrases(shuffleArray(matchPhrases));

      setIsLoading(false);
      setIsLoadingNewGame(false);
      setIsTimerRunning(true);
    } catch (error) {
      console.error('Error fetching phrases:', error);
      setError('Failed to load phrases. Please try again.');
      setIsLoading(false);
      setIsLoadingNewGame(false);
    }
  }, [geniusSlug]);

  useEffect(() => {
    fetchPhrases();
  }, [fetchPhrases]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    console.log('Phrases state updated:', phrases);
  }, [phrases]);

  const handleClose = () => {
    const currentPath = window.location.pathname;
    const deckPath = currentPath.replace(/\/match$/, '');
    console.log('Navigating to:', deckPath);
    navigate(deckPath);
  };

  const handleMatch = (phrase: MatchPhrase) => {
    if (phrase.isMatched) return;

    if (!selectedPhrase) {
      setSelectedPhrase(phrase);
      setPhrases(prevPhrases => 
        prevPhrases.map(p => 
          p.phrase_id === phrase.phrase_id && p.type === phrase.type ? { ...p, isSelected: true } : p
        )
      );
    } else if (selectedPhrase.phrase_id === phrase.phrase_id && selectedPhrase.type !== phrase.type) {
      setPhrases(prevPhrases => 
        prevPhrases.map(p => 
          p.phrase_id === phrase.phrase_id ? { ...p, isMatched: true, isSelected: false } : p
        )
      );
      setSelectedPhrase(null);

      // Check if all phrases are matched after this match
      const updatedPhrases = phrases.map(p => 
        p.phrase_id === phrase.phrase_id ? { ...p, isMatched: true, isSelected: false } : p
      );
      const allMatched = updatedPhrases.every(p => p.isMatched);
      if (allMatched) {
        setIsTimerRunning(false);
        setIsGameComplete(true);
      }
    } else {
      setPhrases(prevPhrases => 
        prevPhrases.map(p => ({ ...p, isSelected: false }))
      );
      setSelectedPhrase(null);
    }
  };

  const handlePlayAgain = () => {
    setTimer(0);
    setIsGameComplete(false);
    setIsTimerRunning(false); // Ensure timer doesn't start until phrases are loaded
    fetchPhrases();
  };

  const getPhraseText = (phrase: MatchPhrase) => {
    if (phrase.type === 'primary') {
      return i18n.language === 'eng' ? phrase.text : phrase.text_cmn;
    } else {
      return i18n.language === 'eng' ? phrase.text_cmn : phrase.text;
    }
  };

  if (isLoading || isLoadingNewGame) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-900">
        <l-quantum size="45" speed="1.75" color="white"></l-quantum>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col bg-neutral-900 text-white">
        <CloseHeader onAction={handleClose} type="close" />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-900 text-white">
      <CloseHeader onAction={handleClose} type="close" />
      <div className="flex-grow p-4 overflow-auto">
        <div className="text-center mb-4">
          <p className="text-2xl font-bold">{formatTime(timer)}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {phrases.map(phrase => (
            <button
              key={`${phrase.phrase_id}-${phrase.type}`}
              onClick={() => handleMatch(phrase)}
              className={`p-4 rounded-lg ${
                phrase.isMatched ? 'bg-green-700' : 
                phrase.isSelected ? 'bg-blue-600' : 
                'bg-neutral-800'
              } flex items-center justify-center min-h-[100px] w-full ${
                phrase.isMatched ? 'opacity-0 pointer-events-none' : ''
              }`}
              disabled={phrase.isMatched}
            >
              <p className="text-sm text-center break-words">
                {getPhraseText(phrase)}
              </p>
            </button>
          ))}
        </div>
      </div>
      {isGameComplete && (
        <div className="sticky bottom-0 p-4 bg-neutral-900 border-t border-neutral-800">
          <Button onClick={handlePlayAgain} variant="blue" className="w-full">
            {t('matchStudy.playAgain')}
          </Button>
        </div>
      )}
    </div>
  );
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default MatchStudyPage;