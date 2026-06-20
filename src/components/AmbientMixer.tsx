/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AmbientSound } from '../types';
import { Volume2, VolumeX, CloudRain, ShieldAlert, Flame, Waves, Wind } from 'lucide-react';

interface AmbientMixerProps {
  ambientSounds: AmbientSound[];
  onVolumeChange: (id: string, volume: number) => void;
  onTogglePlay: (id: string) => void;
  isPowerOn: boolean;
}

export const AmbientMixer: React.FC<AmbientMixerProps> = ({
  ambientSounds,
  onVolumeChange,
  onTogglePlay,
  isPowerOn,
}) => {

  const getIcon = (id: string, isPlaying: boolean, extraClass: string) => {
    switch (id) {
      case 'rain':
        return <CloudRain className={`${extraClass} ${isPlaying ? 'text-blue-400' : 'text-neutral-500'}`} />;
      case 'ocean':
        return <Waves className={`${extraClass} ${isPlaying ? 'text-cyan-400' : 'text-neutral-500'}`} />;
      case 'campfire':
        return <Flame className={`${extraClass} ${isPlaying ? 'text-orange-500 animate-pulse' : 'text-neutral-500'}`} />;
      case 'wind':
        return <Wind className={`${extraClass} ${isPlaying ? 'text-teal-400' : 'text-neutral-500'}`} />;
      default:
        return <Volume2 className={extraClass} />;
    }
  };

  return (
    <div className="bg-white border border-neutral-300 rounded-2xl p-6 flex flex-col h-full shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" />
          <h3 className="text-sm font-sans text-neutral-850 uppercase tracking-wider font-extrabold">
            백그라운드 자연음 합성 믹서
          </h3>
        </div>
        <span className="text-[10px] font-mono text-neutral-505 bg-amber-50/70 px-2.5 py-1 rounded border border-amber-200">실시간 아날로그 합성</span>
      </div>

      <div className="space-y-3.5 flex-1">
        {ambientSounds.map((sd) => {
          const isActiveAndOn = sd.isPlaying && isPowerOn;

          return (
            <div 
              key={sd.id}
              className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 shadow-sm ${
                isActiveAndOn 
                  ? 'border-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.06)] bg-amber-50/20' 
                  : 'bg-neutral-50/60 border-neutral-200 hover:border-neutral-300 hover:bg-white'
              }`}
            >
              {/* Sound metadata label */}
              <div className="flex items-center gap-3">
                <button
                  id={`toggle-ambient-${sd.id}`}
                  disabled={!isPowerOn}
                  onClick={() => onTogglePlay(sd.id)}
                  className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                    isActiveAndOn 
                      ? 'bg-amber-500 border-amber-500 text-white shadow-md scale-105' 
                      : 'bg-white border-neutral-250 text-neutral-500 hover:text-neutral-700 hover:border-neutral-450'
                  }`}
                  title={`${sd.label} 오디오 토글`}
                >
                  {getIcon(sd.id, isActiveAndOn, 'w-4 h-4')}
                </button>

                <div className="flex flex-col">
                  <span className={`text-xs font-extrabold ${isPowerOn ? 'text-neutral-800' : 'text-neutral-400'}`}>
                    {sd.label}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 mt-0.5">
                    {isActiveAndOn ? `VOL ${(sd.volume * 100).toFixed(0)}%` : 'MUTED'}
                  </span>
                </div>
              </div>

              {/* Slider Controller */}
              <div className="flex-1 flex items-center gap-2.5">
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  id={`slider-ambient-${sd.id}`}
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sd.volume}
                  disabled={!isPowerOn || !sd.isPlaying}
                  onChange={(e) => onVolumeChange(sd.id, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-20 disabled:cursor-not-allowed focus:outline-none"
                />
                <Volume2 className={`w-3.5 h-3.5 ${isActiveAndOn ? 'text-amber-600 font-extrabold' : 'text-neutral-400'}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
