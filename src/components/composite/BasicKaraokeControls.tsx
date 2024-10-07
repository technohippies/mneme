import React, { useEffect, useRef, useCallback } from 'react';
import { LyricsDisplay } from '../core/LyricsDisplay';
import { MicrophonePermissionButton } from '../core/MicrophonePermissionButton';
import { MicAudioVisualizer } from '../core/MicAudioVisualizer';
import { ScoreDisplay } from '../core/ScoreDisplay';
import { Button } from '../ui/button';
import { waveform, orbit, trefoil } from 'ldrs';
import { useAudioTime } from '../../hooks/useAudioTime';
import { Phrase, Lyric } from '../../types/index';
import { PlusCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Register the loaders
waveform.register();
orbit.register();
trefoil.register();

export interface BasicKaraokeControlsProps {
  phrases: Phrase[];
  audioUrl: string;
  onPhraseComplete: (phraseId: string, performance: 'good' | 'again') => void;
  onRecordingComplete: (audioBlob: Blob) => Promise<{ score: number | undefined, scoreReceived: boolean }>;
  onAddSong: () => void;
  isInDeck: boolean;
  currentPhraseIndex: number;
  setCurrentPhraseIndex: React.Dispatch<React.SetStateAction<number>>;
  lastReceivedScore: number | undefined;
  scoreError: string | null;
  showScore: boolean; // Add this line
  setShowScore: React.Dispatch<React.SetStateAction<boolean>>; // Add this line
}

export const BasicKaraokeControls: React.FC<BasicKaraokeControlsProps> = ({
  phrases,
  audioUrl,
  onPhraseComplete,
  onRecordingComplete,
  onAddSong,
  isInDeck,
  currentPhraseIndex,
  setCurrentPhraseIndex,
  lastReceivedScore,
  scoreError,
  showScore,
  setShowScore,
}) => {
  const { t } = useTranslation();
  const [micPermissionGranted, setMicPermissionGranted] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [score, setScore] = React.useState<number | undefined>(undefined);
  const [practiceScore, setPracticeScore] = React.useState<number | undefined>(undefined);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isPracticing, setIsPracticing] = React.useState(false);
  const [showStopButton, setShowStopButton] = React.useState(false);
  const [hasPracticed, setHasPracticed] = React.useState(false);
  const { currentTime, isPlaying, togglePlayPause, setCurrentTime, pauseAudio } = useAudioTime(audioUrl);
  const audioRef = useRef<MediaRecorder | null>(null);
  const { i18n } = useTranslation();
  const latestScoreRef = React.useRef<number | undefined>(undefined);
  const latestPracticeScoreRef = React.useRef<number | undefined>(undefined);

  useEffect(() => {
    // console.log('BasicKaraokeControls - Current language:', i18n.language);
  }, [i18n.language]);

  const getTranslatedText = (phrase: Phrase): string => {
    const currentLanguage = i18n.language;
    switch (currentLanguage) {
      case 'cmn':
        return phrase.text_cmn || phrase.text;
      case 'jpn':
        return phrase.text_jpn || phrase.text;
      case 'kor':
        return phrase.text_kor || phrase.text;
      default:
        return phrase.text;
    }
  };

  const handleStopRecording = useCallback(async () => {
    setIsProcessing(true);

    if (audioRef.current && audioRef.current.state === 'recording') {
      audioRef.current.stop();
      const audioBlob = await new Promise<Blob>((resolve) => {
        audioRef.current!.addEventListener('dataavailable', (event) => {
          resolve(event.data);
        });
      });

      try {
        console.log('Calling onRecordingComplete with audioBlob:', audioBlob);
        const result = await onRecordingComplete(audioBlob);
        console.log('onRecordingComplete result:', result);
        
        if (result.scoreReceived && result.score !== undefined) {
          const parsedScore = result.score;
          console.log('Setting score:', parsedScore, 'isPracticing:', isPracticing);
          if (isPracticing) {
            setPracticeScore(parsedScore);
          } else {
            setScore(parsedScore);
          }
          setShowScore(true);
        } else {
          console.error('Invalid score received:', result);
          // Set a default score or error state
          setScore(undefined);
          setShowScore(true); // Still show the score display, which will now show an error
        }
      } catch (error) {
        console.error('Error in handleStopRecording:', error);
        setScore(undefined);
        setShowScore(true);
      }
    } else {
      console.error('MediaRecorder is not in recording state');
    }

    setIsProcessing(false);
    setIsRecording(false);
    setShowStopButton(false);
  }, [onRecordingComplete, isPracticing]);

  const handlePhraseEnd = useCallback(async () => {
    // console.log('handlePhraseEnd called');
    setIsRecording(false);
    pauseAudio();
    await handleStopRecording();
  }, [pauseAudio, handleStopRecording]);

  useEffect(() => {
    if (phrases.length === 0) {
      console.error('No phrases provided to BasicKaraokeControls');
      return;
    }
    if (micPermissionGranted && isRecording && !isPracticing) {
      const currentPhrase = phrases[currentPhraseIndex];
      if (currentTime >= parseFloat(currentPhrase.end_time)) {
        console.log('Phrase end detected, calling handlePhraseEnd');
        handlePhraseEnd();
      }
    }
  }, [currentTime, phrases, currentPhraseIndex, micPermissionGranted, isRecording, isPracticing, handlePhraseEnd]);

  const handleMicPermissionGranted = () => {
    setMicPermissionGranted(true);
    setIsRecording(true);
    startRecording();
    if (!isPlaying && !isPracticing) {
      togglePlayPause();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRef.current = new MediaRecorder(stream);
      audioRef.current.start();
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const handlePerformanceChoice = (choice: 'good' | 'again') => {
    console.log('handlePerformanceChoice called with:', choice);
    console.log('Current score:', score);
    console.log('Has practiced:', hasPracticed);

    if (choice === 'again') {
      console.log('User chose "Again"');
      if (!hasPracticed && score !== undefined && score < 50) {
        console.log('Conditions met for practice mode');
        setIsPracticing(true);
        setHasPracticed(true);
        setShowStopButton(true);
        setIsRecording(true);
        startRecording();
        console.log('Practice mode activated');
      } else {
        console.log('Conditions not met for practice mode, restarting phrase');
        const currentPhrase = phrases[currentPhraseIndex];
        setCurrentTime(parseFloat(currentPhrase.start_time));
        setScore(undefined);
        setPracticeScore(undefined);
        setHasPracticed(false);
        setIsPracticing(false);
        setIsRecording(true);
        startRecording();
        if (!isPlaying) {
          togglePlayPause();
        }
      }
    } else if (choice === 'good') {
      console.log('User chose "Good", moving to next phrase');
      onPhraseComplete(phrases[currentPhraseIndex].phrase_id, choice);
      const nextIndex = (currentPhraseIndex + 1) % phrases.length;
      setCurrentPhraseIndex(nextIndex);
      setCurrentTime(parseFloat(phrases[nextIndex].start_time));
      setScore(undefined);
      setPracticeScore(undefined);
      setHasPracticed(false);
      setIsPracticing(false);
      setIsRecording(true);
      startRecording();
      if (!isPlaying) {
        togglePlayPause();
      }
      setShowScore(false);
    }
  };

  const handleStopPractice = async () => {
    await handleStopRecording();
    setShowStopButton(false);
    setIsPracticing(false);
  };

  const currentPhrase = phrases[currentPhraseIndex] || null;

  const lyricsArray: Lyric[] = currentPhrase ? [{
    startTime: parseFloat(currentPhrase.start_time),
    endTime: parseFloat(currentPhrase.end_time),
    englishText: currentPhrase.text ? currentPhrase.text.replace(/\\n/g, '\n') : '',
    translatedText: getTranslatedText(currentPhrase),
    text_cmn: currentPhrase.text_cmn,
    text_jpn: currentPhrase.text_jpn,
    text_kor: currentPhrase.text_kor,
    words: (currentPhrase.text || '').replace(/\\n/g, ' ')
      .split(' ')
      .filter(word => word.trim() !== '')
      .map((word, index, array) => {
        const totalDuration = parseFloat(currentPhrase.end_time) - parseFloat(currentPhrase.start_time);
        const wordDuration = totalDuration / array.length;
        const startTime = parseFloat(currentPhrase.start_time) + index * wordDuration;
        return {
          word,
          startTime,
          endTime: startTime + wordDuration,
          wordIndex: index,
        };
      }),
  }] : [];

  const [addSongState, setAddSongState] = React.useState<'add' | 'adding' | 'added'>(isInDeck ? 'added' : 'add');

  const handleAddSongClick = async () => {
    setAddSongState('adding');
    try {
      await onAddSong();
      setAddSongState('added');
    } catch (error) {
      console.error('Error adding song:', error);
      setAddSongState('add');
      // Optionally, you can show an error message to the user here
    }
  };

  useEffect(() => {
    if (isInDeck) {
      setAddSongState('added');
    }
  }, [isInDeck]);

  useEffect(() => {
    latestScoreRef.current = score;
  }, [score]);

  useEffect(() => {
    latestPracticeScoreRef.current = practiceScore;
  }, [practiceScore]);

  // Add this useEffect to log when lastReceivedScore changes
  React.useEffect(() => {
    console.log('lastReceivedScore updated:', lastReceivedScore);
  }, [lastReceivedScore]);

  const displayScore = isPracticing ? practiceScore : (lastReceivedScore ?? score);

  // Add this just before the return statement in the component
  console.log('Render state:', {
    micPermissionGranted,
    isRecording,
    isPracticing,
    isProcessing,
    score,
    hasPracticed,
    showScore
  });

  return (
    <div className="karaoke-controls flex flex-col h-full w-full bg-neutral-900 text-white relative">
      {currentPhrase && currentPhrase.background_image_cid && (
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={`https://ipfs.filebase.io/ipfs/${currentPhrase.background_image_cid}`}
            alt="Phrase Background" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
      )}
      <div className="flex-grow flex flex-col justify-center items-center overflow-y-auto px-4 relative z-10">
        {lyricsArray.length > 0 ? (
          <LyricsDisplay
            lyrics={lyricsArray}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            highlightColor="bg-red-700"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <l-orbit size="48" speed="1.5" color="white"></l-orbit>
          </div>
        )}
      </div>
      <div className="controls-container w-full p-4 flex flex-col space-y-4 relative z-20">
        {/* Add Song button or Added indicator */}
        <div className="flex justify-end">
          <div className="flex flex-col items-center justify-center">
            {addSongState === 'added' && (
              <>
                <CheckCircle size={32} className="text-green-500" />
                <span className="text-xs mt-1">{t('karaokeControls.added')}</span>
              </>
            )}
            {addSongState === 'adding' && (
              <div className="flex flex-col items-center justify-center">
                <l-trefoil
                  size="32"
                  stroke="4"
                  stroke-length="0.15"
                  bg-opacity="0.1"
                  speed="1.4" 
                  color="white" 
                ></l-trefoil>
                <span className="text-xs mt-1">{t('karaokeControls.adding')}</span>
              </div>
            )}
            {addSongState === 'add' && (
              <>
                <button
                  onClick={handleAddSongClick}
                  className="text-white hover:text-orange-300 transition-colors"
                  aria-label={t('karaokeControls.addSong')}
                >
                  <PlusCircle size={32} />
                </button>
                <span className="text-xs mt-1">{t('karaokeControls.addSong')}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex-grow flex flex-col justify-end space-y-4">
          <div className="h-16 flex items-center justify-center">
            {micPermissionGranted && (isRecording || isPracticing) && !isProcessing && (
              <MicAudioVisualizer isRecording={isRecording || isPracticing} />
            )}
            {isProcessing && (
              <l-waveform
                size="35"
                stroke="3.5"
                speed="1" 
                color="white" 
              ></l-waveform>
            )}
            {!isRecording && !isPracticing && !isProcessing && showScore && (
              <ScoreDisplay 
                score={displayScore}
                isProcessing={isProcessing}
                error={scoreError}
              />
            )}
          </div>
          <div className="h-12">
            {!micPermissionGranted ? (
              <MicrophonePermissionButton onPermissionGranted={handleMicPermissionGranted} />
            ) : !isRecording && !isPracticing && !isProcessing ? (
              <div className="flex w-full space-x-2">
                <Button 
                  variant="secondary"
                  className="w-1/2"
                  onClick={() => handlePerformanceChoice('again')}
                >
                  {!hasPracticed && score !== undefined && score < 50 ? t('karaokeControls.practice') : t('karaokeControls.again')}
                </Button>
                <Button 
                  variant="blue"
                  className="w-1/2"
                  onClick={() => handlePerformanceChoice('good')}
                >
                  {t('karaokeControls.good')}
                </Button>
              </div>
            ) : isPracticing && showStopButton ? (
              <Button 
                variant="secondary"
                className="w-full"
                onClick={handleStopPractice}
              >
                {t('karaokeControls.stopPractice')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};