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
    <div className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <CloudRain className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-mono text-neutral-200 uppercase/bold tracking-wider font-bold">
            백그라운드 자연음 합성 믹서
          </h3>
        </div>
        <span className="text-[10px] font-mono text-neutral-500">실시간 아날로그 합성</span>
      </div>

      <div className="space-y-4 flex-1">
        {ambientSounds.map((sd) => {
          const isActive = sd.isPlaying;

          return (
            <div 
              key={sd.id}
              className={`bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                isActive ? 'border-amber-500/30 bg-neutral-950/80' : ''
              }`}
            >
              {/* Sound metadata label */}
              <div className="flex items-center gap-2.5">
                <button
                  id={`toggle-ambient-${sd.id}`}
                  onClick={() => onTogglePlay(sd.id)}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-400 shadow-md' 
                      : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                  }`}
                  title={`${sd.label} 오디오 토글`}
                >
                  {getIcon(sd.id, isActive, 'w-4 h-4')}
                </button>

                <div className="flex flex-col">
                  <span className={`text-xs font-semibold ${isActive ? 'text-neutral-200' : 'text-neutral-400'}`}>
                    {sd.label}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-500">
                    {isActive ? `VOL ${(sd.volume * 100).toFixed(0)}%` : 'MUTED'}
                  </span>
                </div>
              </div>

              {/* Slider Controller */}
              <div className="flex-1 flex items-center gap-2">
                <VolumeX className="w-3.5 h-3.5 text-neutral-600" />
                <input
                  id={`slider-ambient-${sd.id}`}
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sd.volume}
                  disabled={!sd.isPlaying}
                  onChange={(e) => onVolumeChange(sd.id, parseFloat(e.target.value))}
                  className="w-full cursor-pointer focus:outline-none"
                />
                <Volume2 className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500/80' : 'text-neutral-600'}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
