import { useState, useEffect, useRef } from 'react';

export const useAudioTime = (audioUrl: string) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.pause();
      }
    };
  }, [audioUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const setAudioTime = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return { currentTime, isPlaying, togglePlayPause, setCurrentTime: setAudioTime, pauseAudio };
};