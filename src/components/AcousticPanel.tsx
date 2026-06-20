/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { EQMode } from '../types';
import { Sliders, Timer, Volume2, FlameKindling } from 'lucide-react';

interface AcousticPanelProps {
  currentEQ: EQMode;
  onEQChange: (mode: EQMode) => void;
  masterVolume: number;
  onVolumeChange: (vol: number) => void;
  sleepTimerDuration: number; // in seconds, 0 means inactive
  onSleepTimerSet: (minutes: number) => void;
  isPowerOn: boolean;
}

export const AcousticPanel: React.FC<AcousticPanelProps> = ({
  currentEQ,
  onEQChange,
  masterVolume,
  onVolumeChange,
  sleepTimerDuration,
  onSleepTimerSet,
  isPowerOn,
}) => {
  const eqModes: EQMode[] = ['Normal', 'Retro-Warm', 'Bass Boost', 'Concert Hall', 'Vocal', 'Clear Sky'];

  // Format second duration to elegant countdown string
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-5 flex flex-col h-full gap-5">
      
      {/* 1. Master Volume Mixer Board */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono font-bold text-neutral-200 uppercase/bold tracking-wider">
              마스터 음량 페이더 (Master Volume)
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            {masterVolume === 0 ? 'MUTE' : `${(masterVolume * 100).toFixed(0)}%`}
          </span>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center gap-4 relative overflow-hidden">
          {/* Decibel tick markers behind progress bar */}
          <div className="absolute inset-x-0 bottom-1 h-3 flex justify-between px-6 pointer-events-none opacity-45">
            {[-Infinity, -40, -20, -10, -5, 0, 3, 6].map((db, i) => (
              <span key={i} className="text-[7px] font-mono text-neutral-500 leading-none">
                {db === -Infinity ? '∞' : `${db > 0 ? '+' : ''}${db}`}
              </span>
            ))}
          </div>

          <input
            id="fader-volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            disabled={!isPowerOn}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full cursor-pointer focus:outline-none py-1"
            title="마스터 라운드 음량 페이더"
          />
        </div>
      </div>

      {/* 2. Equalizer Preset Push-Buttons */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sliders className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-mono font-bold text-neutral-200 uppercase/bold tracking-wider">
            어쿠스틱 EQ 프리셋 (Acoustic Equalizer)
          </span>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
          {eqModes.map((mode) => {
            const isSelected = currentEQ === mode && isPowerOn;
            return (
              <button
                id={`eq-preset-${mode.replace(' ', '-')}`}
                key={mode}
                disabled={!isPowerOn}
                onClick={() => onEQChange(mode)}
                className={`text-[10px] font-mono py-2 px-1.5 border rounded-xl text-center font-bold cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-950/45 border-amber-500 text-amber-400 shadow-[0_2px_8px_rgba(245,158,11,0.2)]'
                    : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 disabled:hover:text-neutral-400'
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sleep Timer (취면 예약 기능) */}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono font-bold text-neutral-200 uppercase/bold tracking-wider">
              취면 취침 예약 타이머
            </span>
          </div>
          {isPowerOn && sleepTimerDuration > 0 && (
            <div className="px-2 py-0.5 bg-red-950/40 border border-red-900/65 rounded text-[10px] text-red-400 font-mono font-bold animate-pulse">
              ⏱ {formatCountdown(sleepTimerDuration)} 남음
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
          {[0, 15, 30, 45, 60].map((mins) => {
            const isMatching = 
              mins === 0 
                ? sleepTimerDuration === 0 
                : Math.abs(sleepTimerDuration - mins * 60) < 15;

            return (
              <button
                id={`sleep-timer-${mins}`}
                key={mins}
                disabled={!isPowerOn}
                onClick={() => onSleepTimerSet(mins)}
                className={`flex-1 text-center py-2 text-[10px] font-mono font-bold rounded-lg cursor-pointer transition-all ${
                  isMatching && isPowerOn
                    ? 'bg-amber-500 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-neutral-200 disabled:opacity-30 disabled:hover:text-neutral-400'
                }`}
              >
                {mins === 0 ? 'OFF' : `${mins}M`}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
