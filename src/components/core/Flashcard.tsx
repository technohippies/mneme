import React, { useState, useEffect, useRef } from 'react';
import { FlashcardProps } from '../../types';
import { Volume2, Pause, Music } from 'lucide-react';
import { dotStream } from 'ldrs';

dotStream.register();

export const Flashcard: React.FC<FlashcardProps> = (props) => {
    const [ttsAudio, setTtsAudio] = useState<HTMLAudioElement | null>(null);
    const [songAudio, setSongAudio] = useState<HTMLAudioElement | null>(null);
    const [ttsLoading, setTtsLoading] = useState(false);
    const [songLoading, setSongLoading] = useState(false);
    const prevIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (props.id !== prevIdRef.current) {
            stopAllAudio();
            prevIdRef.current = props.id;
        }

        return () => {
            stopAllAudio();
        };
    }, [props.id]);

    const stopAllAudio = () => {
        if (ttsAudio) {
            ttsAudio.pause();
            ttsAudio.currentTime = 0;
        }
        if (songAudio) {
            songAudio.pause();
            songAudio.currentTime = 0;
        }
        setTtsAudio(null);
        setSongAudio(null);
    };

    const handleAudioPlay = (type: 'tts' | 'song') => {
        stopAllAudio();
        const cid = type === 'tts' ? props.tts_cid : props.audio_cid;
        if (!cid) return;

        const setLoading = type === 'tts' ? setTtsLoading : setSongLoading;
        const setAudio = type === 'tts' ? setTtsAudio : setSongAudio;

        setLoading(true);
        const audio = new Audio(`https://warp.dolpin.io/ipfs/${cid}`);
        audio.oncanplaythrough = () => {
            setLoading(false);
            audio.play();
            setAudio(audio);
        };
        audio.onended = () => {
            setAudio(null);
        };
    };

    const renderText = (text: string, textCmn: string) => {
        const textLines = text.split('\\n');
        const textCmnLines = textCmn.split('\\n');
        
        return textLines.map((line, index) => (
            <React.Fragment key={index}>
                <p className="text-xl sm:text-xl text-center mb-2 text-neutral-200">{line}</p>
                {textCmnLines[index] && (
                    <p className="text-2xl sm:text-lg text-center mb-4 text-neutral-300">{textCmnLines[index]}</p>
                )}
            </React.Fragment>
        ));
    };

    const renderAudioControl = (type: 'tts' | 'song') => {
        const isPlaying = type === 'tts' ? !!ttsAudio : !!songAudio;
        const isLoading = type === 'tts' ? ttsLoading : songLoading;
        const Icon = type === 'tts' ? Volume2 : Music;

        return (
            <div 
                className="flex-1 flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => handleAudioPlay(type)}
            >
                {isLoading ? (
                    <l-dot-stream size="20" speed="2.5" color="#FFFFFF"></l-dot-stream>
                ) : isPlaying ? (
                    <Pause className="w-6 h-6 text-neutral-300" />
                ) : (
                    <Icon className="w-6 h-6 text-neutral-300" />
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full w-full max-w-md mx-auto">
            <div className="flex-grow flex flex-col">
                <div className="flex-grow flex flex-col items-center justify-center p-4">
                    <div className="w-full h-[400px] bg-neutral-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
                        <div className="flex-grow flex flex-col items-center justify-center p-6 overflow-y-auto">
                            <div className="w-full flex flex-col items-center justify-center">
                                {props.isFlipped ? renderText(props.text, props.text_cmn) : renderText(props.text, '')}
                            </div>
                        </div>
                        {/* Audio controls - integrated into the card */}
                        <div className="h-14 bg-neutral-700 flex items-center">
                            {renderAudioControl('tts')}
                            <div className="w-px h-8 bg-neutral-600"></div>
                            {renderAudioControl('song')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};