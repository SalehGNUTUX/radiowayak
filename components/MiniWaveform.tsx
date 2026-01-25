
import React, { useEffect, useRef } from 'react';

interface MiniWaveformProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

const MiniWaveform: React.FC<MiniWaveformProps> = ({ analyser, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser ? analyser.frequencyBinCount : 0;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Fallback animation when no audio flow but playing (initial buffer)
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = isPlaying ? 10 + Math.random() * 20 : 0;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = 2;
      const gutter = 1;
      const count = 15;
      const centerX = canvas.width / 2;
      
      for (let i = 0; i < count; i++) {
        const value = dataArray[i % bufferLength] || 0;
        const barHeight = (value / 255) * canvas.height * 0.8 + 2;
        
        ctx.fillStyle = '#3b82f6';
        // Draw bars symmetrically
        ctx.fillRect(centerX + (i * (barWidth + gutter)), (canvas.height - barHeight) / 2, barWidth, barHeight);
        ctx.fillRect(centerX - (i * (barWidth + gutter)), (canvas.height - barHeight) / 2, barWidth, barHeight);
      }
    };

    draw();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [analyser, isPlaying]);

  return <canvas ref={canvasRef} width={100} height={20} className="w-16 h-4 opacity-80" />;
};

export default MiniWaveform;
