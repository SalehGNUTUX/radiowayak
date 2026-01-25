import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isPlaying: boolean;
  analyser: AnalyserNode | null;
}

let Visualizer: React.FC<VisualizerProps> = (props) => {
  let isPlaying = props.isPlaying;
  let analyser = props.analyser;
  let canvasRef = useRef<HTMLCanvasElement>(null);
  let animationRef = useRef<number | null>(null);
  let dataArrayRef = useRef<Uint8Array | null>(null);
  let fallbackDataRef = useRef<Uint8Array>(new Uint8Array(128));
  
  // مرجع لتخزين البيانات المنعمة لمنع القفزات المفاجئة في الحركة
  let smoothDataRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (analyser) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      smoothDataRef.current = new Float32Array(analyser.frequencyBinCount);
    }
  }, [analyser]);

  useEffect(() => {
    let canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let renderFrame = () => {
      if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
      
      let width = canvas.width;
      let height = canvas.height;
      let centerX = width / 2;
      let centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      let dataArray = dataArrayRef.current;
      let isSilent = true;

      if (analyser && dataArray && smoothDataRef.current) {
        analyser.getByteFrequencyData(dataArray);
        
        // معالجة البيانات المنعمة لضمان سلاسة الحركة (Interpolation)
        for (let i = 0; i < dataArray.length; i++) {
          // معامل التنعيم 0.12 يضمن تلاشي تدريجي ونعومة قصوى في الاستجابة
          smoothDataRef.current[i] += (dataArray[i] - smoothDataRef.current[i]) * 0.12;
          if (smoothDataRef.current[i] > 2) { isSilent = false; }
        }
      }

      if ((!analyser || isSilent) && isPlaying) {
          dataArray = fallbackDataRef.current;
          let timeValue = Date.now() / 1200; // أبطأ لزيادة النعومة
          for (let i = 0; i < 128; i++) {
             // موجة جيبية متداخلة لخلق تأثير "سائل"
             let val = 40 + Math.sin(i * 0.1 + timeValue) * 15 + Math.cos(i * 0.05 - timeValue * 0.5) * 10;
             dataArray[i] = val; 
          }
      } else if (!isPlaying) {
          return;
      }

      // محيط صورة الـ Album Art
      let radius = 128; 
      let barsCount = 180; 
      let angleStep = (Math.PI * 2) / barsCount;
      
      let usableDataLength = analyser ? Math.floor(analyser.frequencyBinCount * 0.65) : 128;

      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(139, 92, 246, 0.3)";

      for (let i = 0; i < barsCount; i++) {
        let relIndex = i < barsCount / 2 ? i : barsCount - i;
        let dataIndex = Math.floor((relIndex / (barsCount / 2)) * usableDataLength);
        
        // استخدام البيانات المنعمة إذا توفرت
        let freqValue = (analyser && smoothDataRef.current) ? smoothDataRef.current[dataIndex] : (dataArray ? dataArray[dataIndex] : 0);
        
        // جعل الارتفاعات أكثر استقرارا ونعومة
        let barHeight = 4 + (freqValue / 255 * 45); 
        
        let angle = (i * angleStep) - (Math.PI / 2);
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);

        let xStart = centerX + cos * radius;
        let yStart = centerY + sin * radius;
        
        let xEnd = centerX + cos * (radius - barHeight);
        let yEnd = centerY + sin * (radius - barHeight);

        let gradient = ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        gradient.addColorStop(0.4, "rgba(139, 92, 246, 0.5)");
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(renderFrame);
    };

    if (isPlaying) {
      renderFrame();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, analyser]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default Visualizer;