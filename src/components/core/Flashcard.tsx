import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { FlashcardProps } from '../../types';
import RoundedAudioButton from './RoundedAudioButton';

export const Flashcard: React.FC<FlashcardProps> = (props) => {
    const [ttsAudio, setTtsAudio] = useState<HTMLAudioElement | null>(null);
    const [songAudio, setSongAudio] = useState<HTMLAudioElement | null>(null);
    const prevIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Check if the card has changed
        if (props.id !== prevIdRef.current) {
            stopAllAudio();
            // Update the ref to the current card id
            prevIdRef.current = props.id;
        }

        // Cleanup function
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

    const handleAudioPlay = (audio: HTMLAudioElement, type: 'tts' | 'song') => {
        stopAllAudio();
        if (type === 'tts') {
            setTtsAudio(audio);
        } else {
            setSongAudio(audio);
        }
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

    const handleFlip = () => {
        stopAllAudio();
        props.onFlip();
    };

    const handleAnswer = (callback: () => void) => {
        stopAllAudio();
        callback();
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-grow bg-neutral-800 flex flex-col w-full h-full text-neutral-200">
                <div className="flex-grow flex flex-col">
                    <div className="flex-grow flex flex-col items-center justify-center p-4 overflow-y-auto">
                        <div className="w-full flex flex-col items-center justify-center mb-4">
                            {props.isFlipped ? renderText(props.text, props.text_cmn) : renderText(props.text, '')}
                        </div>
                    </div>
                    {/* Audio controls - fixed position */}
                    <div className="flex justify-center items-center space-x-8 p-4">
                        {props.tts_cid && (
                            <RoundedAudioButton
                                key={`tts-${props.id}`}
                                cid={props.tts_cid}
                                onPlay={(audio) => handleAudioPlay(audio, 'tts')}
                                onStop={stopAllAudio}
                            />
                        )}
                        {props.audio_cid && (
                            <RoundedAudioButton
                                key={`song-${props.id}`}
                                cid={props.audio_cid}
                                onPlay={(audio) => handleAudioPlay(audio, 'song')}
                                onStop={stopAllAudio}
                            />
                        )}
                    </div>
                </div>
                <div className="p-2 sm:p-4">
                    {!props.isFlipped ? (
                        <Button 
                            className="w-full py-6 sm:py-6 text-base sm:text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            onClick={handleFlip}
                        >
                            Flip
                        </Button>
                    ) : (
                        <div className="flex w-full space-x-2">
                            <Button 
                                className="w-1/2 py-6 sm:py-6 text-base sm:text-lg bg-neutral-600 hover:bg-neutral-700 text-white font-bold"
                                onClick={() => handleAnswer(props.onAgain)}
                            >
                                Again
                            </Button>
                            <Button 
                                className="w-1/2 py-6 sm:py-6 text-base sm:text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                onClick={() => handleAnswer(props.onGood)}
                            >
                                Good
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};