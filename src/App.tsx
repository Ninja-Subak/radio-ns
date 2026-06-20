/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { RadioStation, AmbientSound, EQMode } from './types';
import { DEFAULT_STATIONS } from './data/stations';
import { RadioTuner } from './components/RadioTuner';
import { LiveVisualizer } from './components/LiveVisualizer';
import { PresetGrid } from './components/PresetGrid';
import { AmbientMixer } from './components/AmbientMixer';
import { AddStationForm } from './components/AddStationForm';
import { AcousticPanel } from './components/AcousticPanel';
import { globalAudioEngine } from './utils/audioEngine';
import { 
  Radio, 
  Power, 
  Disc, 
  Music, 
  AlertTriangle, 
  Volume2, 
  Heart,
  Maximize2
} from 'lucide-react';

export default function App() {
  // --- 1. State Hydration from Local Storage ---
  const [stations, setStations] = useState<RadioStation[]>(() => {
    try {
      const saved = localStorage.getItem('radio_custom_stations');
      if (saved) {
        const custom = JSON.parse(saved);
        return [...DEFAULT_STATIONS, ...custom];
      }
    } catch (e) {
      console.warn('Failed parsing custom stations from storage', e);
    }
    return DEFAULT_STATIONS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('radio_favorites');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return ['lofi', 'synthwave']; // default favorites
  });

  // --- 2. Radio Console States ---
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrequency, setCurrentFrequency] = useState(89.1);
  const [activeStationId, setActiveStationId] = useState<string | null>('lofi');
  
  const [masterVolume, setMasterVolume] = useState(() => {
    try {
      const saved = localStorage.getItem('radio_volume');
      if (saved) return parseFloat(saved);
    } catch (_) {}
    return 0.8;
  });

  const [currentEQ, setCurrentEQ] = useState<EQMode>('Normal');
  const [sleepTimerDuration, setSleepTimerDuration] = useState(0); // in seconds

  const [ambientSounds, setAmbientSounds] = useState<AmbientSound[]>([
    { id: 'rain', name: 'rain', label: '감미로운 가을 빗소리', volume: 0.3, isPlaying: false },
    { id: 'ocean', name: 'ocean', label: '잔잔한 하와이 파도 소리', volume: 0.2, isPlaying: false },
    { id: 'campfire', name: 'campfire', label: '따뜻한 모닥불 타는 소리', volume: 0.25, isPlaying: false },
    { id: 'wind', name: 'wind', label: '평온한 솔바람 소리', volume: 0.2, isPlaying: false },
  ]);

  // Audio loading status
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  // --- 2.5. Mechanical Tuning & Scanning Engine States ---
  const [isScanning, setIsScanning] = useState(false);
  const [scanDirection, setScanDirection] = useState<'up' | 'down'>('up');
  
  // 전 대역 전체 자동 신호 스캔 가동 엔진 상태
  const [isFullBandScanning, setIsFullBandScanning] = useState(false);
  const [fullBandScanProgress, setFullBandScanProgress] = useState(0);
  const [fullBandScanAlert, setFullBandScanAlert] = useState<string | null>(null);

  const [inlineRegistering, setInlineRegistering] = useState(false);
  const [inlineName, setInlineName] = useState('');
  const [inlineUrl, setInlineUrl] = useState('');
  const [inlineGenre, setInlineGenre] = useState('My Custom');
  const [inlineError, setInlineError] = useState('');

  // Reference to track stream loading timeout
  const timeoutRef = useRef<number | null>(null);

  // --- 3. Local Storage Sync ---
  useEffect(() => {
    try {
      const customOnes = stations.filter((st) => st.isCustom);
      localStorage.setItem('radio_custom_stations', JSON.stringify(customOnes));
    } catch (_) {}
  }, [stations]);

  useEffect(() => {
    localStorage.setItem('radio_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('radio_volume', masterVolume.toString());
  }, [masterVolume]);

  // --- 4. Main Player Routing System & Fine Frequency Scanning ---
  useEffect(() => {
    if (!isPowerOn) {
      globalAudioEngine.pauseStream();
      globalAudioEngine.setStaticVolume(0);
      setIsPlaying(false);
      setIsLoadingStream(false);
      setStreamError(null);
      return;
    }

    // Guard stream router if automated motorized frequency sweeping is underway
    if (isScanning) {
      return;
    }

    // Find nearest station
    let nearest: RadioStation | null = null;
    let minDistance = 999;
    
    stations.forEach((st) => {
      const dist = Math.abs(st.frequency - currentFrequency);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = st;
      }
    });

    if (isPlaying) {
      setIsLoadingStream(false);
      setStreamError(null);

      if (nearest && minDistance < 0.05) {
        // Direct station locks on nicely (Direct FM Reception)
        setIsLoadingStream(true);
        globalAudioEngine.playStream(nearest.url);
        globalAudioEngine.setStaticVolume(0);
        setActiveStationId(nearest.id);

        // Clear previous timeout and set error fallback
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
          setIsLoadingStream(false);
        }, 3200);

      } else if (nearest && minDistance <= 0.3) {
        // Frequency is slightly off: play stream mixed with static crunch
        const distanceFactor = minDistance / 0.3; // 0 (closed) to 1 (far)
        setIsLoadingStream(true);
        globalAudioEngine.playStream(nearest.url);
        globalAudioEngine.setStaticVolume(distanceFactor); // dynamic noise blend
        setActiveStationId(nearest.id);

        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
          setIsLoadingStream(false);
        }, 3200);

      } else {
        // White space: no station hits. Play fully raw static noise
        globalAudioEngine.pauseStream();
        globalAudioEngine.setStaticVolume(1.0);
        setActiveStationId(null);
      }
    } else {
      globalAudioEngine.pauseStream();
      globalAudioEngine.setStaticVolume(0);
    }

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [currentFrequency, isPlaying, isPowerOn, stations, isScanning]);

  // --- 4.5. Automated Scanning Sweep Loop & Form Resetter ---
  useEffect(() => {
    setInlineRegistering(false);
    setInlineName('');
    setInlineUrl('');
    setInlineError('');
  }, [currentFrequency]);

  useEffect(() => {
    if (!isPowerOn || !isScanning) return;

    // Disengage active streaming audio and maximize static white noise for the motorized sweep feel
    globalAudioEngine.pauseStream();
    globalAudioEngine.setStaticVolume(1.0);

    const sweepInterval = setInterval(() => {
      setCurrentFrequency((prev) => {
        let next = prev + (scanDirection === 'up' ? 0.1 : -0.1);
        next = Math.round(next * 10) / 10;

        // Roll over boundaries
        if (next > 108.0) {
          next = 87.5;
        } else if (next < 87.5) {
          next = 108.0;
        }

        // 1. Check exact match with existing radio station frequencies
        const matchedStation = stations.find((st) => Math.abs(st.frequency - next) < 0.05);
        if (matchedStation) {
          setIsScanning(false);
          setIsPlaying(true);
          return matchedStation.frequency;
        }

        // 2. Check overlap with unmapped carrier-wave signal hotspots
        const hotspots = [88.5, 92.1, 95.5, 98.1, 100.5, 102.7, 105.3, 107.5];
        const isHotspot = hotspots.some((h) => Math.abs(h - next) < 0.05);
        if (isHotspot) {
          setIsScanning(false);
          return next;
        }

        return next;
      });
    }, 150);

    return () => {
      clearInterval(sweepInterval);
    };
  }, [isPowerOn, isScanning, scanDirection, stations]);

  // --- 4.6. 전 대역 신호 일과 고속 탐색 및 일괄 채널 개국 엔진 ---
  useEffect(() => {
    if (!isPowerOn || !isFullBandScanning) return;

    // 스트림 오디오는 일시 중지하고 일체 전파 노이즈 극대화
    globalAudioEngine.pauseStream();
    globalAudioEngine.setStaticVolume(1.0);
    setIsPlaying(false);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5; // 약 2초간 진행 (5 * 20 = 100)
      setFullBandScanProgress(Math.min(progress, 100));

      // 주파수 바늘을 고속으로 지이잉 교란
      setCurrentFrequency((prev) => {
        let next = prev + 1.3;
        if (next > 108.0) next = 87.5 + (next - 108.0);
        return Math.round(next * 10) / 10;
      });

      if (progress >= 100) {
        clearInterval(progressInterval);
        
        // 탐지 대상 핫스팟 목록
        const hotspots = [88.5, 92.1, 95.5, 98.1, 100.5, 102.7, 105.3, 107.5];
        
        // 미등록 스펙트럼들 확인
        const toRegister: RadioStation[] = [];
        const SCAN_HOTSPOT_TEMPLATES: { [key: number]: { name: string; url: string; genre: string; desc: string } } = {
          88.5: { 
            name: "FM 88.5 Retro Synthwave", 
            url: "https://stream.zeno.fm/f3bby88b9g8uv", 
            genre: "신스웨이브",
            desc: "어두운 밤 도심을 질주하는 아날로그 신디사이저와 드럼 머신 비트의 기계식 복고 주파수." 
          },
          92.1: { 
            name: "FM 92.1 Midnight Classic Jazz", 
            url: "https://live.jazz24.org/jazz24-mp3", 
            genre: "재즈 클래식",
            desc: "고유한 노이즈 텍스처를 품고 전송되는 정통 실시간 시애틀 재즈 전문 해외 국영 방송 노선." 
          },
          95.5: { 
            name: "FM 95.5 K-Indie Horizon", 
            url: "https://stream.zeno.fm/0ka26ndvbe8uv", 
            genre: "K-인디",
            desc: "감성적인 어쿠스틱 핑거스타일 선율과 새벽녘 잔인하도록 포근한 대한민국 독립 음악 채널." 
          },
          98.1: { 
            name: "FM 98.1 Royal Symphony Orchestra", 
            url: "https://stream.zeno.fm/f3bby88b9g8uv", 
            genre: "오케스트라",
            desc: "바흐, 모차르트부터 베토벤까지 유럽 황실 악단의 장엄하고 깊이감 넘치는 아쿠스틱 오케스트라 명곡 리스트." 
          },
          100.5: { 
            name: "FM 100.5 Lo-Fi Sleepless Night", 
            url: "https://stream.zeno.fm/0ka26ndvbe8uv", 
            genre: "힐링 로파이",
            desc: "잠 못 이루는 새벽, 작업과 학업에 고도의 차분함과 아늑함을 수놓아주는 노스탤지어 로파이 전파 대역." 
          },
          102.7: { 
            name: "FM 102.7 Global Billboard Gold", 
            url: "https://stream.zeno.fm/f3bby88b9g8uv", 
            genre: "팝 / 록",
            desc: "세대를 막론하고 전 세계 골든 디스크 명반들만을 정제하여 송수신하는 가벼운 위성 팝 수신망." 
          },
          105.3: { 
            name: "FM 105.3 Ipanema Bosa Nova", 
            url: "https://live.jazz24.org/jazz24-mp3", 
            genre: "보사노바",
            desc: "태양이 내리쬐는 부드러운 해안가 카페의 기타 아펠지오와 달콤하게 속삭이는 보컬 수선 레이어." 
          },
          107.5: { 
            name: "FM 107.5 Liquid Ambient Focus", 
            url: "https://stream.zeno.fm/0ka26ndvbe8uv", 
            genre: "앰비언트",
            desc: "뇌파를 유인하는 모노톤의 자연 및 주파수 변조 패드 선율로 스트레스를 해소하는 깊은 몰입용 사운드스케이프." 
          }
        };

        hotspots.forEach((h) => {
          const isAlreadyRegistered = stations.some((st) => Math.abs(st.frequency - h) < 0.05);
          if (!isAlreadyRegistered) {
            const tpl = SCAN_HOTSPOT_TEMPLATES[h];
            if (tpl) {
              const customId = `custom_scan_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
              toRegister.push({
                id: customId,
                name: tpl.name,
                frequency: h,
                url: tpl.url,
                genre: tpl.genre,
                description: tpl.desc,
                country: "신호수색",
                topic: "음악",
                isCustom: true
              });
            }
          }
        });

        if (toRegister.length > 0) {
          setStations((prev) => [...prev, ...toRegister]);
          // 제일 첫 번째로 등록된 주파수로 주파수 이동
          const targetFreq = toRegister[0].frequency;
          setCurrentFrequency(targetFreq);
          setFullBandScanAlert(`전 대역 수색 완료! 신규 수신 채널 ${toRegister.length}개국을 새로 감지하고 수신 등록을 완수했습니다!`);
        } else {
          setFullBandScanAlert("전 대역 수색 완료! 이미 모든 수선 전선이 활성화되어 더 이상 추가할 무등록 전파 신호가 없습니다.");
        }

        setIsFullBandScanning(false);
        setIsPlaying(true);
        setTimeout(() => setFullBandScanAlert(null), 5000);
      }
    }, 100);

    return () => {
      clearInterval(progressInterval);
    };
  }, [isPowerOn, isFullBandScanning, stations]);

  // Sync Master Volume and EQ modifications
  useEffect(() => {
    if (isPowerOn) {
      globalAudioEngine.setVolume(masterVolume);
      globalAudioEngine.applyEQ(currentEQ);
    }
  }, [masterVolume, currentEQ, isPowerOn]);

  // Sync ambient sounds
  useEffect(() => {
    ambientSounds.forEach((sd) => {
      if (isPowerOn && sd.isPlaying) {
        globalAudioEngine.setAmbientVolume(sd.id, sd.volume);
      } else {
        globalAudioEngine.setAmbientVolume(sd.id, 0);
      }
    });
  }, [ambientSounds, isPowerOn]);

  // Timer Countdown Logic
  useEffect(() => {
    let timerInterval: any = null;
    if (isPowerOn && sleepTimerDuration > 0) {
      timerInterval = setInterval(() => {
        setSleepTimerDuration((prev) => {
          if (prev <= 1) {
            // Sleep Timer ends: turn off and mute
            setIsPlaying(false);
            setIsPowerOn(false);
            globalAudioEngine.pauseStream();
            globalAudioEngine.setStaticVolume(0);
            return 0;
          }

          // Last 15 seconds volume fade out sequence
          if (prev <= 15) {
            const fadeRatio = (prev - 1) / 15;
            globalAudioEngine.setVolume(masterVolume * fadeRatio);
          }

          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isPowerOn, sleepTimerDuration, masterVolume]);

  // Clean up global Audio Engine when unmounted completely
  const [isBypassActive, setIsBypassActive] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'idle' | 'loading' | 'active' | 'inactive'>('idle');

  useEffect(() => {
    globalAudioEngine.registerBypassCallback((active) => {
      setIsBypassActive(active);
    });
    setIsBypassActive(globalAudioEngine.getBypassMode());

    globalAudioEngine.registerStreamStatusCallback((status, errorDetail) => {
      setStreamStatus(status);
      if (status === 'loading') {
        setIsLoadingStream(true);
        setStreamError(null);
      } else if (status === 'active') {
        setIsLoadingStream(false);
        setStreamError(null);
      } else if (status === 'inactive') {
        setIsLoadingStream(false);
        setStreamError(errorDetail || '주파수 전송 정보 없음 (방송 비활성화)');
      } else if (status === 'idle') {
        setIsLoadingStream(false);
        setStreamError(null);
      }
    });
  }, []);

  const handleToggleBypassMode = () => {
    const nextBypass = !isBypassActive;
    globalAudioEngine.setBypassMode(nextBypass);
    setIsBypassActive(nextBypass);
  };

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
    };

    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
      globalAudioEngine.destroy();
    };
  }, []);

  // --- 5. Custom Button Handler Functions ---
  const handlePowerToggle = () => {
    const nextPower = !isPowerOn;
    
    // Resume context on first click for security permission
    globalAudioEngine.resumeContext();
    
    setIsPowerOn(nextPower);
    if (nextPower) {
      setIsPlaying(true); // Auto-play stream when powering on
    } else {
      setIsPlaying(false);
      setSleepTimerDuration(0);
    }
  };

  const handleSelectStation = (st: RadioStation) => {
    if (!isPowerOn) return;
    setCurrentFrequency(st.frequency);
    setIsPlaying(true);
  };

  const handleToggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(fId => fId !== id));
    } else {
      setFavorites(prev => [...prev, id]);
    }
  };

  const handleAddCustomStation = (newSt: Omit<RadioStation, 'id'>) => {
    const customId = `custom_${Date.now()}`;
    const stationObj: RadioStation = {
      ...newSt,
      id: customId,
      isCustom: true,
    };
    setStations((prev) => [...prev, stationObj]);
  };

  const handleDeleteCustomStation = (id: string) => {
    setStations((prev) => prev.filter((st) => st.id !== id));
    if (activeStationId === id) {
      setActiveStationId(null);
    }
  };

  const handleToggleAmbientSound = (id: string) => {
    if (!isPowerOn) return;
    // Activate context security bypass
    globalAudioEngine.resumeContext();

    setAmbientSounds((prev) =>
      prev.map((sd) => (sd.id === id ? { ...sd, isPlaying: !sd.isPlaying } : sd))
    );
  };

  const handleAmbientVolumeChange = (id: string, vol: number) => {
    setAmbientSounds((prev) =>
      prev.map((sd) => (sd.id === id ? { ...sd, volume: vol } : sd))
    );
  };

  const handleSleepTimerSet = (minutes: number) => {
    if (!isPowerOn) return;
    setSleepTimerDuration(minutes * 60);
  };

  // Find currently active station matching current frequency (exact or nearest)
  const getActiveStationDetails = () => {
    if (!isPowerOn) return null;
    const station = stations.find((st) => Math.abs(st.frequency - currentFrequency) < 0.05);
    return station || null;
  };

  const currentStation = getActiveStationDetails();
  const hasValidSignal = currentStation !== null;

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-300 py-6 px-4 md:py-12 md:px-8 selection:bg-amber-500 selection:text-neutral-900">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* ================= HEADER SECTION ================= */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-850 pb-5 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500 rounded-lg text-neutral-950 animate-pulse">
                <Radio className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-neutral-100 tracking-tight">
                아날로그 하이파이 인터넷 라디오 플레이어
              </h1>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              실시간 온라인 스트리밍 수신과 사운드 합성 믹서기능을 합친 프레스티지 비주얼 오디오 시스템
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono bg-neutral-850 text-neutral-400 px-3 py-1.5 rounded-lg border border-neutral-800">
              STATIONS: {stations.length} • CUSTOMS: {stations.filter(s => s.isCustom).length}
            </span>
          </div>
        </header>

        {/* ================= MAIN INTERFACE BENTO GRID ================= */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 5 COLS: CORE PHYSICAL RADIO hardware SLATE */}
          <section className="lg:col-span-5 flex flex-col gap-5">
            
            {/* The Walnut wood / Black metal bezel controller body */}
            <div className="bg-neutral-900 border-x-4 border-b-6 border-amber-950/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden ring-1 ring-neutral-850 bg-gradient-to-b from-neutral-850 to-neutral-900">
              {/* Premium dark timber top highlight line */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-900 via-[#3a2016] to-amber-900" />
              
              <div className="flex items-center justify-between mb-5">
                <span className="text-[9px] font-mono text-neutral-500 font-bold uppercase tracking-widest leading-none">
                  INTELLIGENT TUNER MODEL X-800
                </span>
                
                {/* Hardware POWER mechanical button */}
                <button
                  id="hardware-power-btn"
                  onClick={handlePowerToggle}
                  className={`relative px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-mono font-bold cursor-pointer transition-all border ${
                    isPowerOn
                      ? 'bg-red-950/55 text-red-400 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                      : 'bg-neutral-950 text-neutral-600 border-neutral-850 hover:text-neutral-400'
                  }`}
                  title={isPowerOn ? '라디오 시스템 전원 끄기' : '라디오 시스템 전원 켜기'}
                >
                  <Power className={`w-3.5 h-3.5 ${isPowerOn ? 'text-red-500 animate-ping absolute' : ''}`} />
                  <Power className={`w-3.5 h-3.5 ${isPowerOn ? 'text-red-500 z-10' : ''}`} />
                  <span>{isPowerOn ? 'POWER ON' : 'STANDBY'}</span>
                </button>
              </div>

              {/* VFD / CRT SCREEN CONSOLE HOUSING */}
              <div className="bg-neutral-950 border-2 border-neutral-800 rounded-2xl p-4 shadow-inner mb-5 relative">
                {/* Background screen ambient glow overlay */}
                {isPowerOn && (
                  <div className="absolute inset-0 bg-amber-500/[0.015] shadow-[inset_0_0_40px_rgba(245,158,11,0.02)] pointer-events-none rounded-2xl" />
                )}

                <div className="flex justify-between items-start mb-4 gap-4">
                  
                  {/* Big Glowing character-LED nixie frequency indicator */}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-neutral-500 tracking-wider">주파수 대역</span>
                    <div className="flex items-baseline gap-1 mt-1 font-mono">
                      <span className={`text-4xl font-bold tracking-tighter transition-all ${
                        isPowerOn 
                          ? 'text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] font-bold' 
                          : 'text-neutral-850'
                      }`}>
                        {currentFrequency.toFixed(1)}
                      </span>
                      <span className={`text-xs font-bold ${
                        isPowerOn ? 'text-amber-500/70 font-semibold' : 'text-neutral-850'
                      }`}>
                        MHz
                      </span>
                    </div>
                  </div>

                  {/* Spinning Graphic cassette disk reels for visual feedback */}
                  <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-850 rounded-xl p-2.5">
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] font-mono text-neutral-500 leading-none">SIGNAL BAND</span>
                      <span className={`text-[10px] font-mono font-bold mt-1.5 leading-none ${
                        isPowerOn 
                          ? (hasValidSignal ? 'text-emerald-400' : 'text-red-500') 
                          : 'text-neutral-700'
                      }`}>
                        {isPowerOn ? (hasValidSignal ? 'STEREO RECEIVE' : 'NO CARRIER') : 'OFF-AIR'}
                      </span>
                    </div>
                    
                    <div className="relative">
                      <Disc 
                        className={`w-7 h-7 text-neutral-750 transition-colors ${
                          isPowerOn && isPlaying && hasValidSignal ? 'text-amber-500 animate-spin' : ''
                        }`} 
                        style={{ animationDuration: '4s' }}
                      />
                    </div>
                  </div>

                </div>

                {/* Information text layout inside screen */}
                <div className="border-t border-neutral-900 pt-3 flex flex-col gap-1.5 min-h-[55px]">
                  {isPowerOn ? (
                    currentStation ? (
                      <div>
                        {/* Favorite Badge */}
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-500/90 flex items-center gap-1 font-mono uppercase bg-amber-950/30 border border-amber-900/30 px-1.5 py-0.5 rounded">
                              {currentStation.genre}
                            </span>
                            {/* Live broadcast health indicator LED */}
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold leading-none border transition-all ${
                              streamStatus === 'active' 
                                ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400' 
                                : streamStatus === 'loading'
                                ? 'bg-amber-950/30 border-amber-900/40 text-amber-400 animate-pulse'
                                : streamStatus === 'inactive'
                                ? 'bg-rose-950/30 border-rose-900/40 text-rose-400'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                streamStatus === 'active' ? 'bg-emerald-400 shadow-[0_0_4px_#34d399]' :
                                streamStatus === 'loading' ? 'bg-amber-400 animate-ping' :
                                streamStatus === 'inactive' ? 'bg-rose-500 shadow-[0_0_4px_#f43f5e]' : 'bg-neutral-500'
                              }`} />
                              {streamStatus === 'active' ? 'ACTIVE (방송 활성)' :
                               streamStatus === 'loading' ? '동조 대기...' :
                               streamStatus === 'inactive' ? 'OFFLINE (송출 중단)' : 'STANDBY'}
                            </span>
                          </div>
                          {favorites.includes(currentStation.id) && (
                            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 shrink-0" />
                          )}
                        </div>
                        <h2 className="text-sm font-semibold text-neutral-100 mt-1">
                          {currentStation.name}
                        </h2>
                        {currentStation.description && (
                          <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                            {currentStation.description}
                          </p>
                        )}
                      </div>
                    ) : (
                      inlineRegistering ? (
                        <div className="text-neutral-200 flex flex-col gap-2 py-1 select-none">
                          <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                            <span className="text-[10px] font-mono text-amber-500 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              FM {currentFrequency.toFixed(1)} MHz 신규 채널 개국
                            </span>
                            <button
                              type="button"
                              onClick={() => setInlineRegistering(false)}
                              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-[10px] px-1.5 py-0.5 rounded cursor-pointer leading-none font-mono"
                            >
                              취소
                            </button>
                          </div>

                          {/* Quick template pickers */}
                          <div className="flex items-center gap-1.5 py-0.5">
                            <span className="text-[9px] font-mono text-neutral-500">인기 프리셋:</span>
                            <div className="flex gap-1">
                              {[
                                { name: 'K-Rock', url: 'https://stream.zeno.fm/f3bby88b9g8uv', genre: 'K-Rock' },
                                { name: 'Lo-Fi', url: 'https://stream.zeno.fm/0ka26ndvbe8uv', genre: '로파이' },
                                { name: 'Jazz FM', url: 'https://live.jazz24.org/jazz24-mp3', genre: '재즈' }
                              ].map((tpl, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    setInlineName(`FM ${currentFrequency.toFixed(1)} ${tpl.name}`);
                                    setInlineUrl(tpl.url);
                                    setInlineGenre(tpl.genre);
                                  }}
                                  className="bg-neutral-900 hover:bg-amber-950/40 border border-neutral-800 hover:border-amber-600/30 text-neutral-400 hover:text-amber-400 text-[9px] px-2 py-0.5 rounded-lg cursor-pointer font-mono"
                                >
                                  {tpl.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quick validation error message banner */}
                          {inlineError && (
                            <div className="text-[9.5px] font-mono font-bold text-rose-500 bg-rose-950/20 border border-rose-900/30 px-2 py-1 rounded">
                              ⚠️ {inlineError}
                            </div>
                          )}

                          {/* Quick inputs */}
                          <div className="space-y-1.5">
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="text"
                                placeholder="방송국명 (예: 내방 락방송)"
                                value={inlineName}
                                onChange={(e) => {
                                  setInlineName(e.target.value);
                                  setInlineError('');
                                }}
                                className="col-span-2 bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-[10.5px] p-1.5 text-neutral-200 focus:outline-none rounded-lg"
                              />
                              <input
                                type="text"
                                placeholder="장르 (예: J-Pop)"
                                value={inlineGenre}
                                onChange={(e) => {
                                  setInlineGenre(e.target.value);
                                  setInlineError('');
                                }}
                                className="bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-[10.5px] p-1.5 text-neutral-200 focus:outline-none rounded-lg font-mono text-center"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="인터넷 라디오 스트림 주소 (http...)"
                              value={inlineUrl}
                              onChange={(e) => {
                                  setInlineUrl(e.target.value);
                                  setInlineError('');
                              }}
                              className="w-full bg-neutral-950 border border-neutral-850 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-[10.5px] p-1.5 text-neutral-200 focus:outline-none rounded-lg font-mono"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (!inlineName.trim()) {
                                setInlineError('방송국 명칭을 입력해주세요.');
                                return;
                              }
                              if (!inlineUrl.trim() || !inlineUrl.startsWith('http')) {
                                setInlineError('스트리밍 주소 URL은 http로 시작해야 합니다.');
                                return;
                              }
                              if (stations.some((st) => Math.abs(st.frequency - currentFrequency) < 0.05)) {
                                setInlineError('이미 이 주파수에 등록된 방송국이 존재합니다.');
                                return;
                              }

                              handleAddCustomStation({
                                name: inlineName.trim(),
                                frequency: currentFrequency,
                                url: inlineUrl.trim(),
                                genre: inlineGenre.trim() || 'Custom',
                                description: '기계식 아날로그 다이얼 자동 스냅으로 탐색되어 개국된 신호 채널 수신망.',
                                country: '사용자',
                                topic: '음악'
                              });
                              setInlineRegistering(false);
                              setIsPlaying(true);
                            }}
                            className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[10.5px] font-mono rounded-lg transition-all cursor-pointer mt-1"
                          >
                            방송국 등록 완료 및 개국하기 ⚡
                          </button>
                        </div>
                      ) : (
                        <div className="text-neutral-500 flex flex-col gap-2 justify-center h-full py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-semibold text-rose-500/70">
                              - EMPTY FREQUENCY -
                            </span>
                            {/* If frequency aligns with an empty signal transmitter hotspots */}
                            {[88.5, 92.1, 95.5, 98.1, 100.5, 102.7, 105.3, 107.5].some((h) => Math.abs(h - currentFrequency) < 0.05) && (
                              <span className="text-[9.5px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded animate-pulse select-none flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                공중 파형 신호 감지됨!
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-neutral-650 leading-normal">
                            채널이 프리셋되지 않은 대역입니다. 주파수 수신기를 정밀 동조하거나 채널 수신국을 개설하여 매핑할 수 있습니다.
                          </p>

                          <button
                            type="button"
                            onClick={() => {
                              setInlineRegistering(true);
                              setInlineName(`FM ${currentFrequency.toFixed(1)} 사용자 라디오`);
                              setInlineUrl('');
                              setInlineGenre('My Custom');
                              setInlineError('');
                            }}
                            className="w-full py-1.5 bg-neutral-950 hover:bg-amber-955/50 border border-neutral-800 hover:border-amber-600/40 text-neutral-400 hover:text-amber-400 font-mono text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all mt-1"
                          >
                            📻 이 주파수 수신국 등록 채널 개설하기
                          </button>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-neutral-700 text-xs py-2 font-mono flex items-center justify-center gap-1.5 text-center h-full">
                      <Power className="w-4 h-4" />
                      전원을 켜주시면 스트리밍 수신이 즉각 실행됩니다.
                    </div>
                  )}
                </div>

                {/* LIVE WAVE OSCILLOSCOPE SCREEN SECTION */}
                <div className="mt-4">
                  <LiveVisualizer 
                    isPlaying={isPlaying} 
                    isPowerOn={isPowerOn} 
                    currentFrequency={currentFrequency}
                    hasSignal={hasValidSignal}
                    isBypassActive={isBypassActive}
                  />
                </div>

                {/* Play, Pause indicator LED layout */}
                {isPowerOn && (
                  <div className="mt-2.5 flex items-center justify-between border-t border-neutral-900/80 pt-2 px-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying && hasValidSignal ? 'bg-amber-500 animate-pulse shadow-[0_0_4px_#f59e0b]' : 'bg-neutral-800'}`} />
                        <span className="text-[8px] font-mono text-neutral-500">PLAY</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${!isPlaying ? 'bg-amber-500 shadow-[0_0_4px_#f59e0b]' : 'bg-neutral-800'}`} />
                        <span className="text-[8px] font-mono text-neutral-500">PAUSE</span>
                      </div>
                      <div className="flex items-center gap-1 ml-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isBypassActive ? 'bg-emerald-400 shadow-[0_0_4px_#10b981]' : 'bg-neutral-800'}`} />
                        <span className="text-[8px] font-mono text-neutral-500" title="CORS 보호 장치 가동됨">CORS 우회</span>
                      </div>
                    </div>
                    {isLoadingStream && (
                      <span className="text-[9px] font-mono text-amber-500 animate-pulse font-bold">
                        수신 캐시 다운로드 중...
                      </span>
                    )}
                  </div>
                )}

              </div>

              {/* 전 대역 수색 완료 팝업 알림 배너 */}
              {fullBandScanAlert && (
                <div className="mt-3 p-3 bg-emerald-950/85 border border-emerald-500/30 text-emerald-300 rounded-xl text-[11px] font-mono flex items-start gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.12)] animate-pulse select-none">
                  <span className="text-emerald-400 font-bold shrink-0">📡 SYSTEM:</span>
                  <p className="flex-1 leading-normal">{fullBandScanAlert}</p>
                </div>
              )}

              {/* TUNING COMPONENT INTEGRATION */}
              <RadioTuner 
                currentFrequency={currentFrequency} 
                stations={stations} 
                onFrequencyChange={setCurrentFrequency}
                isPowerOn={isPowerOn}
                isScanning={isScanning}
                scanDirection={scanDirection}
                onStartScan={(dir) => {
                  setScanDirection(dir);
                  setIsScanning(true);
                }}
                onStopScan={() => {
                  setIsScanning(false);
                  setIsPlaying(true);
                }}
                isFullBandScanning={isFullBandScanning}
                fullBandScanProgress={fullBandScanProgress}
                onFullBandScanAndRegister={() => {
                  if (!isFullBandScanning) {
                    setIsFullBandScanning(true);
                  }
                }}
              />

              {/* Master Control Board toggling static manually */}
              {isPowerOn && (
                <div className="mt-4 flex flex-col gap-2 rounded-xl bg-neutral-950 border border-neutral-850 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-[10px] font-mono text-neutral-400 font-medium">재생 및 안전성 설정</span>
                    </div>
                    
                    {/* Mini info banner about bypass */}
                    {isBypassActive && (
                      <span className="text-[9px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-950/30 px-1.5 py-0.5 rounded">
                        안전 청취 기능 가동 중
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1 pt-1 border-t border-neutral-900">
                    {/* Left: Play Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        id="radio-play-btn"
                        onClick={() => setIsPlaying(true)}
                        className={`px-3 py-1 text-[10px] font-semibold font-mono rounded cursor-pointer transition-colors ${
                          isPlaying ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30' : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300 border border-transparent'
                        }`}
                      >
                        PLAY
                      </button>
                      <button
                        id="radio-pause-btn"
                        onClick={() => {
                          setIsPlaying(false);
                          globalAudioEngine.pauseStream();
                          globalAudioEngine.setStaticVolume(0);
                        }}
                        className={`px-3 py-1 text-[10px] font-semibold font-mono rounded cursor-pointer transition-colors ${
                          !isPlaying ? 'bg-neutral-800 text-white font-bold border border-neutral-750' : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300 border border-transparent'
                        }`}
                      >
                        PAUSE
                      </button>
                    </div>

                    {/* Right: Security Bypass Toggle */}
                    <button
                      onClick={handleToggleBypassMode}
                      className={`px-2 py-1 text-[10px] font-semibold font-mono rounded cursor-pointer transition-all border ${
                        isBypassActive
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                          : 'bg-neutral-900 text-neutral-500 border-neutral-850 hover:text-neutral-300'
                      }`}
                      title="브라우저 CORS 정책으로 인해 몇몇 라디오 스트리밍 주소의 소리가 차단되는 현상을 100% 우회하여 안전하게 소리가 들리도록 연동하는 기능입니다."
                    >
                      {isBypassActive ? '보안 우회: ON' : '보안 우회: OFF'}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* ACOUSTIC AND SLEEP TIMER SLATE PANEL */}
            <AcousticPanel 
              currentEQ={currentEQ} 
              onEQChange={setCurrentEQ} 
              masterVolume={masterVolume} 
              onVolumeChange={setMasterVolume} 
              sleepTimerDuration={sleepTimerDuration} 
              onSleepTimerSet={handleSleepTimerSet} 
              isPowerOn={isPowerOn} 
            />

          </section>

          {/* RIGHT 7 COLS: STATIONS INDEX & AUDIO MIXERS */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            
            {/* STATIONS PRESET GRID DECK */}
            <PresetGrid 
              stations={stations}
              favorites={favorites}
              activeStationId={activeStationId}
              streamStatus={streamStatus}
              onSelectStation={handleSelectStation}
              onToggleFavorite={handleToggleFavorite}
              onDeleteCustomStation={handleDeleteCustomStation}
              isPowerOn={isPowerOn}
            />

            {/* 2-COLUMN SPLIT GRID FOR NATURAL MIXER & CUSTOM TUNER FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Natural Ambient procedural sounds mixer */}
              <AmbientMixer 
                ambientSounds={ambientSounds} 
                onVolumeChange={handleAmbientVolumeChange} 
                onTogglePlay={handleToggleAmbientSound} 
                isPowerOn={isPowerOn}
              />

              {/* Custom Station Opener Form */}
              <AddStationForm 
                onAddStation={handleAddCustomStation} 
                existingStations={stations} 
                isPowerOn={isPowerOn}
              />

            </div>

          </section>

        </main>
        
        {/* ================= FOOTER ADVISORY ================= */}
        <footer className="text-center py-6 border-t border-neutral-900 mt-6 select-none font-mono text-[10px] text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            이 브라우저 라디오는 HTML5 오디오 스트리밍 API와 Web Audio API 발진 회로를 결합하여 작성되었습니다.
          </span>
          <span>© 2026 하이파이 인터넷 라디오 플레이어 콘솔</span>
        </footer>

      </div>
    </div>
  );
}
