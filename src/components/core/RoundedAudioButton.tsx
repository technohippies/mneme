import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Loader2 } from "lucide-react";
import { Button } from '../ui/button';

interface RoundedAudioButtonProps {
  cid: string;
  onPlay: (audio: HTMLAudioElement) => void;
  onStop: () => void;
}

const RoundedAudioButton: React.FC<RoundedAudioButtonProps> = ({ cid, onPlay, onStop }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleClick = async () => {
    if (isLoading) return;

    if (!audioRef.current) {
      setIsLoading(true);
      try {
        const response = await fetch(`https://warp.dolpin.io/ipfs/${cid}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        audioRef.current = new Audio(url);
        audioRef.current.onended = () => setIsPlaying(false);
      } catch (error) {
        console.error('Error fetching audio:', error);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onStop();
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      onPlay(audioRef.current);
    }
  };

  return (
    <Button
      variant="secondary"
      size="icon"
      className="rounded-full w-16 h-16"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-8 w-8 animate-spin" />
      ) : isPlaying ? (
        <Pause className="h-8 w-8" />
      ) : (
        <Play className="h-8 w-8" />
      )}
    </Button>
  );
};

export default RoundedAudioButton;