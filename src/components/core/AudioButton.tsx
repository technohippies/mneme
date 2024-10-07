import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../ui/button";
import { Volume2, Pause } from 'lucide-react';
import { dotStream } from 'ldrs';

dotStream.register();

interface AudioButtonProps {
  cid: string;
  label: string;
  onPlay: (cid: string) => void;
}

const AudioButton: React.FC<AudioButtonProps> = ({ cid, label, onPlay }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleClick = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsLoading(true);
      onPlay(cid);
      const audio = new Audio(`https://warp.dolpin.io/ipfs/${cid}`);
      audio.oncanplaythrough = () => {
        setIsLoading(false);
        setIsPlaying(true);
        audio.play();
      };
      audio.onended = () => {
        setIsPlaying(false);
      };
      audioRef.current = audio;
    }
  };

  return (
    <Button
      variant="secondary"
      className="w-full"
      onClick={handleClick}
      disabled={!cid}
    >
      {isLoading ? (
        <l-dot-stream size="20" speed="2.5" color="currentColor"></l-dot-stream>
      ) : isPlaying ? (
        <Pause className="w-4 h-4 mr-2" />
      ) : (
        <Volume2 className="w-4 h-4 mr-2" />
      )}
      {label}
    </Button>
  );
};

export default AudioButton;