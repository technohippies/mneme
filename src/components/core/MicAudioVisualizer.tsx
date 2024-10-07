import React, { useEffect, useRef } from 'react';

interface MicAudioVisualizerProps {
    isRecording: boolean;
}

export const MicAudioVisualizer: React.FC<MicAudioVisualizerProps> = ({ isRecording }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (isRecording) {
            const setupAudio = async () => {
                try {
                    if (!audioContextRef.current) {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        streamRef.current = stream;
                        audioContextRef.current = new AudioContext();
                        analyserRef.current = audioContextRef.current.createAnalyser();
                        const source = audioContextRef.current.createMediaStreamSource(stream);
                        source.connect(analyserRef.current);
                        analyserRef.current.fftSize = 256;
                        const bufferLength = analyserRef.current.frequencyBinCount;
                        dataArrayRef.current = new Uint8Array(bufferLength);
                    }
                    draw();
                } catch (err) {
                    console.error('Error accessing microphone:', err);
                }
            };
    
            setupAudio();
        } else {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
    
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [isRecording]);

    const draw = () => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;
    
        if (!canvas || !analyser || !dataArray) return;
    
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        const width = canvas.width;
        const height = canvas.height;
    
        analyser.getByteTimeDomainData(dataArray);
    
        ctx.clearRect(0, 0, width, height);
    
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(255, 255, 255)'; // White line
    
        ctx.beginPath();
    
        const sliceWidth = width * 1.0 / dataArray.length;
        let x = 0;
    
        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * height / 2;
    
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
    
            x += sliceWidth;
        }
    
        ctx.lineTo(canvas.width, height / 2);
        ctx.stroke();
    
        if (isRecording) {
            requestAnimationFrame(draw);
        }
    };

    return <canvas ref={canvasRef} className="w-full h-16" />;
};