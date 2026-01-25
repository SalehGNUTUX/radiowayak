
import React, { useEffect, useRef } from 'react';

interface HorizontalVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

const HorizontalVisualizer: React.FC<HorizontalVisualizerProps> = ({ analyser, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animationRef.current = requestAnimationFrame(render);
      
      if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (!analyser || !isPlaying) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      // تأثير التدرج اللوني للموجات
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');

      ctx.fillStyle = gradient;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height;
        
        // رسم الموجات من المنتصف للأعلى والأسفل لخلق شكل متناظر
        ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };

    render();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isPlaying]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default HorizontalVisualizer;
