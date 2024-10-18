import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BasicKaraokeControls, BasicKaraokeControlsProps } from './BasicKaraokeControls';
import { useWalletClient } from 'wagmi';
import { sendAudioMessage, startMessageStream, parseScoreFromMessage, setMessageStreamCallback } from '../../services/xmtpService';
import { createUserSongService } from '../../services/orbis/userSongService';
import { useAuthenticateCeramic } from '../../services/orbis/authService';
import { getCurrentUserDID } from '../../services/orbis/config';
import { userLearningDataService } from '../../services/orbis/userDataLearningService';
import { DecodedMessage } from '@xmtp/xmtp-js';
import { Song } from '../../types/index';

export const KaraokeControls: React.FC<Omit<BasicKaraokeControlsProps, 'currentPhraseIndex' | 'setCurrentPhraseIndex' | 'lastReceivedScore' | 'showScore' | 'setShowScore' | 'currentSong'> & { currentSong: Song }> = (props) => {
  const { data: walletClient } = useWalletClient();
  const authenticateCeramic = useAuthenticateCeramic();
  const userSongService = React.useMemo(() => createUserSongService(authenticateCeramic), [authenticateCeramic]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [lastReceivedScore, setLastReceivedScore] = useState<number | undefined>(undefined);
  const latestScoreRef = useRef<number | undefined>(undefined);
  const scorePromiseResolverRef = useRef<((value: number | undefined) => void) | null>(null);
  const [currentPairId, setCurrentPairId] = useState<string | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  // Remove isXmtpInitialized state and setupXMTP function

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
      // Use an empty function instead of null
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

  const handleAddSong = async () => {
    const songUuid = props.phrases[0]?.song_uuid;
    const userDid = await getCurrentUserDID();

    if (!songUuid || !userDid) {
      console.error('Missing song UUID or user DID');
      return;
    }

    try {
      await userSongService.addSongToDeck(songUuid);
      await userLearningDataService.initializeUserLearningDataForSong(songUuid, userDid, authenticateCeramic);
      console.log('Data initialized for song:', songUuid);
    } catch (error) {
      console.error('Error initializing data:', error);
    }

    props.onAddSong();
  };

  return (
    <BasicKaraokeControls
      {...props}
      onRecordingComplete={handleRecordingComplete}
      onAddSong={handleAddSong}
      currentPhraseIndex={currentPhraseIndex}
      setCurrentPhraseIndex={setCurrentPhraseIndex}
      lastReceivedScore={lastReceivedScore}
      showScore={showScore}
      setShowScore={setShowScore}
      scoreError={scoreError}
      currentSong={props.currentSong}
    />
  );
};
