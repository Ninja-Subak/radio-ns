/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { globalAudioEngine } from '../utils/audioEngine';
import { Activity, Sparkles, BarChart2 } from 'lucide-react';

interface LiveVisualizerProps {
  isPlaying: boolean;
  isPowerOn: boolean;
  currentFrequency: number;
  hasSignal: boolean;
}

export const LiveVisualizer: React.FC<LiveVisualizerProps> = ({
  isPlaying,
  isPowerOn,
  currentFrequency,
  hasSignal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visualMode, setVisualMode] = useState<'wave' | 'bars'>('wave');
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI canvas resolution
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = 80;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let phase = 0;

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      // Draw electronic blueprint grid background
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.05)'; // Deep red grid
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Check if power is off
      if (!isPowerOn) {
        // Draw flat dead-line
        ctx.beginPath();
        ctx.strokeStyle = '#3f3f46'; // zinc-700
        ctx.lineWidth = 2;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const analyser = globalAudioEngine.analyser;
      let bufferLength = analyser ? analyser.frequencyBinCount : 128;
      let dataArray = new Uint8Array(bufferLength);

      let isActive = isPlaying;

      if (analyser && isActive) {
        if (visualMode === 'bars') {
          analyser.getByteFrequencyData(dataArray);
        } else {
          analyser.getByteTimeDomainData(dataArray);
        }
      } else {
        // Mock procedural data if AudioContext is not fully initialized, or stream CORS is restricted,
        // or we are on an empty tuning station (empty static)!
        bufferLength = 128;
        dataArray = new Uint8Array(bufferLength);
        
        // If has no signal, render typical static crackling (ultra high frequency random spikes)
        if (!hasSignal && isPlaying) {
          for (let i = 0; i < bufferLength; i++) {
            dataArray[i] = Math.floor(Math.random() * 256);
          }
        } else if (hasSignal && isPlaying) {
          // Play simulation of active music
          phase += 0.15;
          for (let i = 0; i < bufferLength; i++) {
            const angle = (i / bufferLength) * Math.PI * 6 + phase;
            const sine = Math.sin(angle) * Math.cos(angle * 0.4);
            const noise = (Math.random() - 0.5) * 0.15; // sweet noise overlay
            const audioVal = Math.floor((sine + noise + 1.0) * 127); // scale to 0-255
            dataArray[i] = audioVal;
          }
        } else {
          // Power is on but standby (silence)
          for (let i = 0; i < bufferLength; i++) {
            dataArray[i] = 127; // middle level
          }
        }
      }

      // Render Visual Wave/Bars
      if (visualMode === 'wave') {
        const hasActiveSound = isPlaying;
        ctx.beginPath();
        // Dynamic color: golden amber for signal, red hot for raw static noise, muted teal for standby
        let strokeColor = 'rgba(236, 72, 153, 0.85)'; // pink-500
        
        if (hasActiveSound) {
          strokeColor = hasSignal 
            ? 'rgba(245, 158, 11, 0.9)' // Amber-500 glow
            : 'rgba(239, 68, 68, 0.85)'; // raw red static
        } else {
          strokeColor = 'rgba(6, 182, 212, 0.4)'; // Standby cyan
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;
        // Subtle drop shadow for neon tube glow look
        ctx.shadowBlur = 8;
        ctx.shadowColor = strokeColor;

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0; // normalised around 1.0
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      } else {
        // BARS (frequency S-meter spectrum)
        const barWidth = (width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        const hasActiveSound = isPlaying;
        let glowColor = hasActiveSound 
          ? (hasSignal ? 'rgba(245,158,11,1)' : 'rgba(239,68,68,1)')
          : 'rgba(6,182,212,1)';

        for (let i = 0; i < bufferLength; i++) {
          // map byte value 0-255
          const val = isPlaying ? dataArray[i] : (dataArray[i] > 127 ? dataArray[i] - 127 : 0);
          barHeight = (val / 255.0) * height * 0.85;

          // Gradient color fills per bar
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, 'rgba(38, 38, 38, 0.2)');
          gradient.addColorStop(0.5, glowColor.replace('1)', '0.5)'));
          gradient.addColorStop(1, glowColor);

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

          x += barWidth;
        }
      }

      // Draw subtle analog glass curve reflection
      const reflection = ctx.createLinearGradient(0, 0, 0, height);
      reflection.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      reflection.addColorStop(0.3, 'rgba(255, 255, 255, 0.03)');
      reflection.addColorStop(0.31, 'rgba(255, 255, 255, 0)');
      reflection.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = reflection;
      ctx.fillRect(0, 0, width, height);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isPowerOn, currentFrequency, hasSignal, visualMode]);

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 relative shadow-inner overflow-hidden">
      {/* VFD Glass display frame marker */}
      <div className="absolute top-1.5 left-3 flex items-center gap-1.5 z-10 select-none">
        <Activity className={`w-3.5 h-3.5 ${isPowerOn ? 'text-amber-500' : 'text-neutral-600'}`} />
        <span className="text-[9px] font-mono tracking-widest text-neutral-400 font-bold uppercase">
          CRT VACUUM WAVEFORM
        </span>
      </div>

      {/* Visualiser mode controller inside panel */}
      {isPowerOn && (
        <div className="absolute bottom-1.5 right-2 flex items-center bg-neutral-900 border border-neutral-800 rounded-md py-0.5 px-1 z-10">
          <button
            onClick={() => setVisualMode('wave')}
            className={`p-1 rounded text-[10px] font-mono cursor-pointer flex items-center gap-1 leading-none ${
              visualMode === 'wave' ? 'bg-amber-500 text-neutral-950 font-bold shadow' : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="아날로그 오실로스코프 파형"
          >
            <Sparkles className="w-2.5 h-2.5" />
            파형
          </button>
          <button
            onClick={() => setVisualMode('bars')}
            className={`p-1 rounded text-[10px] font-mono cursor-pointer flex items-center gap-1 leading-none ${
              visualMode === 'bars' ? 'bg-amber-500 text-neutral-950 font-bold shadow animate-none' : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="스펙트럼 분석 이퀄라이저"
          >
            <BarChart2 className="w-2.5 h-2.5" />
            스펙트럼
          </button>
        </div>
      )}

      {/* Actual Drawing Canvas */}
      <canvas 
        ref={canvasRef} 
        className="block w-full h-[80px] bg-neutral-950 transition-opacity" 
        style={{ filter: isPowerOn ? 'contrast(1.2)' : 'none' }}
      />
    </div>
  );
};
