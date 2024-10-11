import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FlashcardProps, FlashcardRef } from '../../types';
import { Volume2, Pause, Music } from 'lucide-react';
import { dotStream } from 'ldrs';
import ReactCardFlip from 'react-card-flip';
import { useSpring, animated } from 'react-spring';

dotStream.register();

export const Flashcard = forwardRef<FlashcardRef, FlashcardProps>((props, ref) => {
    const [ttsAudio, setTtsAudio] = useState<HTMLAudioElement | null>(null);
    const [songAudio, setSongAudio] = useState<HTMLAudioElement | null>(null);
    const [ttsLoading, setTtsLoading] = useState(false);
    const [songLoading, setSongLoading] = useState(false);

    const [{ x }, api] = useSpring(() => ({ x: 0 }));

    useImperativeHandle(ref, () => ({
        moveCardLeft: () => {
            api.start({ x: -500, immediate: false });
        },
        flip: () => {
            props.onFlip();
        },
        reset: () => {
            api.start({ x: 0, immediate: true });
        }
    }));

    useEffect(() => {
        stopAllAudio();
        api.start({ x: 0, immediate: true });
    }, [props.id, api]);

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
                onClick={(e) => {
                    e.stopPropagation(); // Prevent event from bubbling up
                    handleAudioPlay(type);
                }}
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

    const cardContent = (isFront: boolean) => (
        <div className="w-full h-[400px] bg-neutral-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <div 
                className="flex-grow flex flex-col items-center justify-center p-6 overflow-y-auto"
                onClick={props.onFlip}
            >
                <div className="w-full flex flex-col items-center justify-center">
                    {isFront ? renderText(props.text, '') : renderText(props.text, props.text_cmn)}
                </div>
            </div>
            <div className="h-14 bg-neutral-700 flex items-center" onClick={(e) => e.stopPropagation()}>
                {renderAudioControl('tts')}
                <div className="w-px h-8 bg-neutral-600"></div>
                {renderAudioControl('song')}
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-3xl mx-auto px-4">
            <animated.div
                style={{
                    x,
                    touchAction: 'none',
                }}
            >
                <ReactCardFlip isFlipped={props.isFlipped} flipDirection="horizontal">
                    <div key="front">
                        {cardContent(true)}
                    </div>
                    <div key="back">
                        {cardContent(false)}
                    </div>
                </ReactCardFlip>
            </animated.div>
        </div>
    );
});