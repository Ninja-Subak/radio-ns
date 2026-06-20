/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { RadioStation } from '../types';
import { Volume2, VolumeX, Radio, RotateCcw } from 'lucide-react';

interface RadioTunerProps {
  currentFrequency: number;
  stations: RadioStation[];
  onFrequencyChange: (freq: number) => void;
  isPowerOn: boolean;
  isScanning?: boolean;
  scanDirection?: 'up' | 'down';
  onStartScan?: (dir: 'up' | 'down') => void;
  onStopScan?: () => void;
  isFullBandScanning?: boolean;
  fullBandScanProgress?: number;
  onFullBandScanAndRegister?: () => void;
}

export const RadioTuner: React.FC<RadioTunerProps> = ({
  currentFrequency,
  stations,
  onFrequencyChange,
  isPowerOn,
  isScanning = false,
  scanDirection = 'up',
  onStartScan,
  onStopScan,
  isFullBandScanning = false,
  fullBandScanProgress = 0,
  onFullBandScanAndRegister,
}) => {
  const tunerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const minFreq = 87.5;
  const maxFreq = 108.0;
  const range = maxFreq - minFreq;

  // Render ticks for the analog display scale
  const ticks: number[] = [];
  for (let f = minFreq; f <= maxFreq; f = Math.round((f + 0.1) * 10) / 10) {
    ticks.push(f);
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPowerOn || !tunerRef.current) return;
    if (onStopScan) onStopScan(); // Disengage auto scan on manual touch
    setIsDragging(true);
    updateFrequencyFromX(e.clientX);
    tunerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !isPowerOn) return;
    updateFrequencyFromX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (tunerRef.current) {
      try { tunerRef.current.releasePointerCapture(e.pointerId); } catch (_) {}
    }
  };

  const updateFrequencyFromX = (clientX: number) => {
    if (!tunerRef.current) return;
    const rect = tunerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const rawFreq = minFreq + percentage * range;
    // Snap to nearest 0.1 MHz
    const formattedFreq = Math.round(rawFreq * 10) / 10;
    onFrequencyChange(formattedFreq);
  };

  // Fine tune helper triggers
  const handleFineTune = (amount: number) => {
    if (!isPowerOn) return;
    const nextFreq = Math.min(maxFreq, Math.max(minFreq, Math.round((currentFrequency + amount) * 10) / 10));
    onFrequencyChange(nextFreq);
  };

  // Safe offset position for needle (percentage of width)
  const needlePosition = ((currentFrequency - minFreq) / range) * 100;

  // Find nearest station to display on dial overlay
  const getNearestStationLabel = () => {
    let nearest: RadioStation | null = null;
    let minDistance = 999;
    
    stations.forEach((st) => {
      const dist = Math.abs(st.frequency - currentFrequency);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = st;
      }
    });

    if (nearest && minDistance <= 0.3) {
      return {
        label: `${(nearest as RadioStation).name} (FM ${(nearest as RadioStation).frequency} MHz)`,
        distance: minDistance,
        station: nearest as RadioStation,
      };
    }
    return null;
  };

  const nearestInfo = getNearestStationLabel();

  return (
    <div className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-5 shadow-inner">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-mono text-amber-500 uppercase tracking-widest">FM ANALOG DIAL SENSOR</span>
        </div>
        <span className="text-xs font-mono text-neutral-500">87.5 MHz - 108.0 MHz</span>
      </div>

      {/* Retro Scale window */}
      <div 
        id="radio-dial-scale"
        ref={tunerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative h-24 bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden select-none cursor-ew-resize transition-all ${
          isPowerOn ? 'opacity-100' : 'opacity-40 cursor-not-allowed'
        }`}
      >
        {/* Glow backlight inside tuner scale */}
        {isPowerOn && (
          <div className="absolute inset-0 bg-gradient-to-b from-amber-950/10 via-amber-950/5 to-transparent pointer-events-none" />
        )}

        {/* Dynamic tick marks */}
        <div 
          className="absolute inset-x-0 bottom-0 h-16 flex justify-between pointer-events-none px-4"
          style={{ width: '100%' }}
        >
          {ticks.map((freq, idx) => {
            const isWhole = Math.round(freq) === freq;
            const isHalf = Math.round(freq * 2) === freq * 2 && !isWhole;
            
            // Only show numbers for whole, or some specific intervals to avoid clutter
            const showLabel = isWhole && freq % 2 === 0;

            return (
              <div 
                key={idx} 
                className="flex flex-col items-center justify-end h-full"
                style={{ width: '1px' }}
              >
                {showLabel && (
                  <span className="text-[10px] font-mono text-neutral-500 mb-1 leading-none font-bold">
                    {freq}
                  </span>
                )}
                <div 
                  className={`w-[1px] transition-colors ${
                    isWhole 
                      ? 'h-8 bg-neutral-500' 
                      : isHalf 
                        ? 'h-5 bg-neutral-700' 
                        : 'h-3 bg-neutral-800'
                  } ${isPowerOn && Math.abs(currentFrequency - freq) < 0.05 ? 'bg-amber-400 w-[1.5px]' : ''}`} 
                />
              </div>
            );
          })}
        </div>

        {/* Highlight station spots along the scale */}
        {isPowerOn && stations.map((st) => {
          const pos = ((st.frequency - minFreq) / range) * 100;
          return (
            <div 
              key={st.id}
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer pointer-events-none"
              style={{ left: `${pos}%` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shadow-[0_0_6px_rgba(245,158,11,0.6)] animate-pulse" />
              <div className="absolute -bottom-8 scale-0 group-hover:scale-100 transition-transform bg-neutral-800 text-[9px] text-amber-400 font-mono py-0.5 px-1 rounded whitespace-nowrap z-30">
                {st.name} ({st.frequency})
              </div>
            </div>
          );
        })}

        {/* Sliding Amber Tuning Needle */}
        {isPowerOn && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-amber-500 transition-all duration-75 shadow-[0_0_8px_#f59e0b] pointer-events-none"
            style={{ left: `${needlePosition}%` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-500 rotate-45 border-t border-l border-amber-300 shadow-md" />
            <div className="absolute top-5 left-2 bg-amber-950/90 border border-amber-500 text-[10px] font-mono font-bold text-amber-400 px-1 py-0.5 rounded shadow whitespace-nowrap">
              {currentFrequency.toFixed(1)} MHz
            </div>
          </div>
        )}
      </div>

      {/* Dial Controls (Fine speed adjustments) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        {/* Fine Tuning controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="fine-tune-down"
            disabled={!isPowerOn}
            onClick={() => {
              if (onStopScan) onStopScan();
              handleFineTune(-0.1);
            }}
            className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300 font-medium cursor-pointer flex items-center gap-1"
          >
            ◀ 0.1 MHz
          </button>
          
          <button
            id="fine-tune-up"
            disabled={!isPowerOn}
            onClick={() => {
              if (onStopScan) onStopScan();
              handleFineTune(0.1);
            }}
            className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300 font-medium cursor-pointer flex items-center gap-1"
          >
            0.1 MHz ▶
          </button>

          {/* Automatic Signal Scan Buttons */}
          <button
            id="auto-scan-down"
            disabled={!isPowerOn}
            onClick={() => onStartScan && onStartScan('down')}
            className={`px-2.5 py-1.5 border rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer disabled:opacity-35 ${
              isScanning && scanDirection === 'down'
                ? 'bg-rose-950/60 border-rose-500 text-rose-400 font-bold animate-pulse'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
            title="아래 주파수 대역으로 자동 스냅 탐색"
          >
            ◀ AUTO SCAN
          </button>

          <button
            id="auto-scan-up"
            disabled={!isPowerOn}
            onClick={() => onStartScan && onStartScan('up')}
            className={`px-2.5 py-1.5 border rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer disabled:opacity-35 ${
              isScanning && scanDirection === 'up'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 font-bold animate-pulse'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
            title="위 주파수 대역으로 자동 스냅 탐색"
          >
            AUTO SCAN ▶
          </button>

          {isScanning && (
            <button
              id="stop-scan"
              onClick={onStopScan}
              className="px-3 py-1.5 bg-red-950 border border-red-500 text-red-400 text-xs font-mono font-bold rounded-lg cursor-pointer animate-pulse"
            >
              STOP
            </button>
          )}

          {/* Preset fast scan helper */}
          {isPowerOn && !isScanning && nearestInfo && nearestInfo.distance > 0 && nearestInfo.distance <= 0.3 && (
            <button
              id="auto-snap-tuner"
              onClick={() => onFrequencyChange(nearestInfo.station.frequency)}
              className="px-2.5 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-600/40 rounded-lg text-xs font-mono text-amber-400 font-semibold cursor-pointer animate-pulse flex items-center gap-1"
              title="가장 가까운 채널 정교화 스냅"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              자동 스냅 ({nearestInfo.station.frequency})
            </button>
          )}
        </div>

        {/* Station Name matching sensor display */}
        <div className="flex-1 text-right font-mono min-w-[200px]">
          {isPowerOn ? (
            nearestInfo ? (
              nearestInfo.distance === 0 ? (
                <div className="text-emerald-400 text-xs flex items-center justify-end gap-1 font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  신호 최적 수신 중: {nearestInfo.station.name}
                </div>
              ) : (
                <div className="text-amber-500/75 text-xs flex items-center justify-end gap-1 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60 animate-ping" />
                  주파수 미세 이탈 (잡음 감쇄 필요)
                </div>
              )
            ) : (
              <span className="text-red-500 text-xs font-medium">
                통신 감도 없음 (빈 주파수 노이즈 출력)
              </span>
            )
          ) : (
            <span className="text-neutral-600 text-xs text-right">장치 전원 꺼짐</span>
          )}
        </div>
      </div>

      {/* 전 대역 일제 주파수 서치 스캐너 모듈 */}
      {isPowerOn && (
        <div className="mt-4 p-3 bg-neutral-950/45 hover:bg-neutral-950/70 border border-neutral-900 border-dashed rounded-xl transition-all duration-300 text-left select-none">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded bg-amber-500/10 text-amber-500 shrink-0">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-amber-500/90 block truncate">
                FM Full-Spectrum Airwave Interceptor
              </span>
              <span className="text-[9.5px] text-neutral-400 block truncate font-sans">
                정밀 스펙트럼 수색 검출기
              </span>
            </div>
          </div>
          
          <p className="text-[10.5px] text-neutral-400 leading-normal font-sans mb-3 pr-1">
            공중 주파수 대역(87.5 ~ 108.0 MHz) 전 범위를 초고속 정밀 스캔하여 감지되는 원시 신호 핫스팟들을 분석해 수신가능한 방송 채널로 일괄 자동 개설합니다.
          </p>

          <div className="w-full">
            {isFullBandScanning ? (
              <div className="w-full bg-black/60 border border-amber-600/30 rounded-lg p-2.5 flex flex-col gap-2 select-none text-[11px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    광대역 주파수 탐색 및 변조 분석 중...
                  </span>
                  <span className="text-[10.5px] font-bold text-amber-500">{fullBandScanProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-100"
                    style={{ width: `${fullBandScanProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                id="full-band-scan-trigger"
                onClick={onFullBandScanAndRegister}
                className="w-full py-2 px-3 bg-neutral-900 hover:bg-amber-950 border border-neutral-800 hover:border-amber-600/40 text-amber-400 hover:text-amber-300 font-mono text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.4)] active:scale-[0.98]"
              >
                ⚡ 전 대역 신호 자동 검출 및 일괄 등록
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
