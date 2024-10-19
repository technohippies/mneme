import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BasicKaraokeControls, BasicKaraokeControlsProps } from './BasicKaraokeControls';
import { useWalletClient } from 'wagmi';
import { sendAudioMessage, startMessageStream, parseScoreFromMessage, setMessageStreamCallback } from '../../services/xmtpService';
import { DecodedMessage } from '@xmtp/xmtp-js';
import { Song } from '../../types/index';

type KaraokeControlsProps = Omit<BasicKaraokeControlsProps, 'currentPhraseIndex' | 'setCurrentPhraseIndex' | 'lastReceivedScore' | 'showScore' | 'setShowScore' | 'currentSong'> & {
  currentSong: Song | null;
  onAddSong: () => Promise<void>;
};

export const KaraokeControls: React.FC<KaraokeControlsProps> = (props) => {
  const { data: walletClient } = useWalletClient();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [lastReceivedScore, setLastReceivedScore] = useState<number | undefined>(undefined);
  const latestScoreRef = useRef<number | undefined>(undefined);
  const scorePromiseResolverRef = useRef<((value: number | undefined) => void) | null>(null);
  const [currentPairId, setCurrentPairId] = useState<string | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const handleMessage = useCallback((message: DecodedMessage) => {
    console.log('Received message in stream:', message);
    const scoreData = parseScoreFromMessage(message);
    if (scoreData) {
      if (scoreData.pairId === currentPairId) {
        console.log('Parsed score data:', scoreData);
        if (scoreData.error) {
          setScoreError(scoreData.error);
          setLastReceivedScore(undefined);
        } else if (scoreData.score !== undefined) {
          latestScoreRef.current = scoreData.score;
          setLastReceivedScore(scoreData.score);
          setScoreError(null);
        }
        setShowScore(true);
        if (scorePromiseResolverRef.current) {
          scorePromiseResolverRef.current(scoreData.score);
          scorePromiseResolverRef.current = null;
        }
      }
    }
  }, [currentPairId]);

  useEffect(() => {
    setMessageStreamCallback(handleMessage);
    startMessageStream().catch(console.error);
    return () => {
      setMessageStreamCallback(() => {});
    };
  }, [handleMessage]);

  const handleRecordingComplete = useCallback(async (audioBlob: Blob): Promise<{ score: number | undefined, scoreReceived: boolean }> => {
    console.log('handleRecordingComplete called with audioBlob:', audioBlob);
    if (!walletClient) {
      console.error('Wallet client not initialized');
      return { score: undefined, scoreReceived: false };
    }

    try {
      console.log('Sending audio message...');
      const result = await sendAudioMessage(walletClient, audioBlob, props.phrases[currentPhraseIndex]);
      console.log('Audio sent to XMTP with phrase data:', result);
      
      setCurrentPairId(result.pairId);
      
      console.log('Waiting for score...');
      const scorePromise = new Promise<number | undefined>((resolve) => {
        scorePromiseResolverRef.current = resolve;
        setTimeout(() => {
          if (scorePromiseResolverRef.current === resolve) {
            console.error('Timeout waiting for score');
            scorePromiseResolverRef.current = null;
            setScoreError('Timeout: No score');
            setShowScore(true);
            resolve(undefined);
          }
        }, 30000); // 30 seconds timeout
      });

      const score = await scorePromise;
      console.log('Received score:', score);
      return { score, scoreReceived: score !== undefined || scoreError !== null };
    } catch (error) {
      console.error('Error in handleRecordingComplete:', error);
      setScoreError('Error processing recording');
      setShowScore(true);
      return { score: undefined, scoreReceived: false };
    }
  }, [walletClient, props.phrases, currentPhraseIndex]);

  return (
    <BasicKaraokeControls
      {...props}
      onRecordingComplete={handleRecordingComplete}
      currentPhraseIndex={currentPhraseIndex}
      setCurrentPhraseIndex={setCurrentPhraseIndex}
      lastReceivedScore={lastReceivedScore}
      showScore={showScore}
      setShowScore={setShowScore}
      scoreError={scoreError}
      currentSong={props.currentSong || undefined}
    />
  );
};
