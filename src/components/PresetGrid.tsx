/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { RadioStation } from '../types';
import { Bookmark, BookmarkCheck, Trash2, Heart, Search, HelpCircle, Radio } from 'lucide-react';

interface PresetGridProps {
  stations: RadioStation[];
  favorites: string[];
  activeStationId: string | null;
  streamStatus?: 'idle' | 'loading' | 'active' | 'inactive';
  onSelectStation: (st: RadioStation) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteCustomStation: (id: string) => void;
  isPowerOn: boolean;
}

export const PresetGrid: React.FC<PresetGridProps> = ({
  stations,
  favorites,
  activeStationId,
  streamStatus = 'idle',
  onSelectStation,
  onToggleFavorite,
  onDeleteCustomStation,
  isPowerOn,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'custom' | 'onair'>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('전체');
  const [selectedTopic, setSelectedTopic] = useState<string>('전체');
  
  // Real-time playability cache verification state
  const [verifiedPlayable, setVerifiedPlayable] = useState<{ [id: string]: boolean }>(() => {
    const initial: { [id: string]: boolean } = {};
    stations.forEach((st) => {
      // Initialize only robust safe https sources as potentially checked
      initial[st.id] = typeof st.url === 'string' && st.url.startsWith('https://');
    });
    return initial;
  });
  const [isVerifying, setIsVerifying] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Search/Filter logical sequence (defined early to prevent temporal dead zone in useEffect hooks)
  const filteredStations = stations.filter((st) => {
    const matchesSearch = 
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.country && st.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (st.topic && st.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      st.frequency.toString().includes(searchQuery);

    const matchesTab = 
      filterType === 'all' ||
      (filterType === 'favorites' && favorites.includes(st.id)) ||
      (filterType === 'custom' && st.isCustom === true) ||
      (filterType === 'onair' && verifiedPlayable[st.id] === true);

    // Country Filter
    const matchesCountry = 
      selectedCountry === '전체' || 
      st.country === selectedCountry ||
      (st.isCustom && selectedCountry === '사용자');

    // Topic Filter
    const matchesTopic = 
      selectedTopic === '전체' || 
      st.topic === selectedTopic;

    return matchesSearch && matchesTab && matchesCountry && matchesTopic;
  });

  // Background Stream Probe Thread using smart HTMLAudioElement probes
  useEffect(() => {
    let active = true;
    setIsVerifying(true);

    const checkChannelPlayability = (url: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (typeof url !== 'string' || !url.startsWith('https://')) {
          resolve(false);
          return;
        }

        const audio = new Audio();
        audio.muted = true;
        audio.volume = 0;
        
        let resolved = false;

        const cleanup = () => {
          try {
            audio.removeEventListener('loadedmetadata', handleSuccess);
            audio.removeEventListener('canplay', handleSuccess);
            audio.removeEventListener('error', handleFailure);
            audio.removeEventListener('stalled', handleFailure);
            audio.removeEventListener('abort', handleFailure);
            audio.pause();
            audio.src = '';
            audio.load();
          } catch (e) {
            // Ignore clean up errors
          }
        };

        const handleSuccess = () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          cleanup();
          resolve(true);
        };

        const handleFailure = () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          cleanup();
          resolve(false);
        };

        audio.addEventListener('loadedmetadata', handleSuccess);
        audio.addEventListener('canplay', handleSuccess);
        audio.addEventListener('error', handleFailure);
        audio.addEventListener('stalled', handleFailure);
        audio.addEventListener('abort', handleFailure);

        const timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            cleanup();
            resolve(false);
          }
        }, 2200); // 2.2 second real-time response grace window

        try {
          audio.src = url;
          audio.load();
        } catch (e) {
          clearTimeout(timeoutId);
          handleFailure();
        }
      });
    };

    const checkAll = async () => {
      const targetStations = stations;
      
      // Batch channels to prevent concurrent connection limits
      const batchSize = 4;
      for (let i = 0; i < targetStations.length; i += batchSize) {
        if (!active) break;
        const batch = targetStations.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (st) => {
          const isPlayable = await checkChannelPlayability(st.url);
          if (active) {
            setVerifiedPlayable(prev => ({
              ...prev,
              [st.id]: isPlayable
            }));
          }
        }));
      }
      
      if (active) {
        setIsVerifying(false);
      }
    };

    checkAll();

    return () => {
      active = false;
    };
  }, [stations]);

  // 자동 인입 정렬 스크롤 및 필터 초기화 정합 엔진
  useEffect(() => {
    if (activeStationId) {
      const isCurrentlyVisible = filteredStations.some(st => st.id === activeStationId);
      if (!isCurrentlyVisible) {
        setFilterType('all');
        setSelectedCountry('전체');
        setSelectedTopic('전체');
        setSearchQuery('');
        
        const timer = setTimeout(() => {
          const cardEl = document.getElementById(`station-card-${activeStationId}`);
          if (cardEl) {
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 150);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          const cardEl = document.getElementById(`station-card-${activeStationId}`);
          if (cardEl) {
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 80);
        return () => clearTimeout(timer);
      }
    }
  }, [activeStationId]);

  // Helper to map country to flag emoji
  const getCountryEmoji = (country?: string) => {
    if (!country) return '🌍 ';
    switch (country) {
      case '대한민국': return '🇰🇷 ';
      case '미국': return '🇺🇸 ';
      case '영국': return '🇬🇧 ';
      case '스위스': return '🇨🇭 ';
      case '프랑스': return '🇫🇷 ';
      case '일본': return '🇯🇵 ';
      case '이탈리아': return '🇮🇹 ';
      case '독일': return '🇩🇪 ';
      default: return '🌍 ';
    }
  };

  return (
    <div className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-5 flex flex-col h-full">
      {/* Category Tabs & Search Bar */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
            <h3 className="text-sm font-mono text-neutral-200 uppercase/bold tracking-wider font-bold">
              라디오 채널 수신국 ({stations.length})
            </h3>
          </div>

          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-400 w-full md:max-w-[200px]">
            <Search className="w-3.5 h-3.5 mr-2 text-neutral-500" />
            <input
              type="text"
              placeholder="채널 번호, 이름, 장르..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-neutral-200 placeholder-neutral-500 w-full text-xs"
            />
          </div>
        </div>

        {/* Filters Selectors */}
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`text-center py-2 text-xs font-medium rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-neutral-800 text-amber-400 shadow font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              전체 채널
            </button>
            <button
              onClick={() => setFilterType('favorites')}
              className={`text-center py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
                filterType === 'favorites'
                  ? 'bg-neutral-800 text-pink-400 shadow font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Heart className="w-3 h-3 fill-pink-500/20 text-pink-400" />
              즐겨찾기 ({favorites.length})
            </button>
            <button
              onClick={() => setFilterType('custom')}
              className={`text-center py-2 text-xs font-medium rounded-lg transition-all ${
                filterType === 'custom'
                  ? 'bg-neutral-800 text-emerald-400 shadow font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              사용자 채널
            </button>
            <button
              onClick={() => setFilterType('onair')}
              className={`text-center py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                filterType === 'onair'
                  ? 'bg-neutral-850 border border-emerald-500/40 text-emerald-400 shadow font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="현재 실시간으로 정상 청취 및 연결 수신이 가능한 오디오 채널망들을 여과합니다."
            >
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                !isPowerOn || !activeStationId
                  ? 'bg-neutral-600'
                  : streamStatus === 'loading'
                  ? 'bg-amber-500 animate-pulse'
                  : streamStatus === 'active'
                  ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                  : 'bg-emerald-500'
              }`}></span>
              현재 방송 가능 ({isVerifying ? (
                <span className="text-[10px] text-amber-500 animate-pulse">검사중..</span>
              ) : (
                Object.values(verifiedPlayable).filter(Boolean).length
              )})
            </button>
          </div>

          {/* Sub Categories for Country & Topic */}
          <div className="grid grid-cols-2 gap-2">
            {/* Country Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wide">나라별 분류</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-neutral-950 border border-neutral-850 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-neutral-300 outline-none cursor-pointer hover:border-neutral-700 hover:text-neutral-100 transition-colors"
                title="국가 필터"
                id="country-filter-select"
              >
                <option value="전체">🌍 국가: 전체</option>
                <option value="대한민국">🇰🇷 대한민국</option>
                <option value="미국">🇺🇸 미국</option>
                <option value="영국">🇬🇧 영국</option>
                <option value="스위스">🇨🇭 스위스</option>
                <option value="프랑스">🇫🇷 프랑스</option>
                <option value="일본">🇯🇵 일본</option>
                <option value="이탈리아">🇮🇹 이탈리아</option>
                <option value="독일">🇩🇪 독일</option>
                <option value="사용자">🛠️ 사용자 채널</option>
              </select>
            </div>

            {/* Topic Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wide">방송 주제</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-neutral-950 border border-neutral-850 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-neutral-300 outline-none cursor-pointer hover:border-neutral-700 hover:text-neutral-100 transition-colors"
                title="주제 필터"
                id="topic-filter-select"
              >
                <option value="전체">📻 주제: 전체</option>
                <option value="음악">🎵 음악</option>
                <option value="뉴스/시사">📰 뉴스/시사</option>
                <option value="교양/학습">🎓 교양/학습</option>
                <option value="힐링/로파이">🧘 힐링/로파이</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Wrapper */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto max-h-[360px] pr-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent"
      >
        {filteredStations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-neutral-500">
            <HelpCircle className="w-8 h-8 mb-2 text-neutral-600 animate-bounce" />
            <p className="text-xs font-mono">수신 필터에 부합하는 방송국이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8 pt-1">
            {filteredStations.map((st) => {
              const isActive = activeStationId === st.id;
              const isFav = favorites.includes(st.id);

              return (
                <div
                  key={st.id}
                  id={`station-card-${st.id}`}
                  className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-300 select-none ${
                    isActive
                      ? 'bg-neutral-950 border-amber-500/60 shadow-[0_4px_16px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
                      : 'bg-neutral-950/40 border-neutral-800 hover:bg-neutral-950/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    {/* Monospace LED Dial Badge */}
                    <div 
                      onClick={() => isPowerOn && onSelectStation(st)}
                      className={`text-xs font-mono px-2 py-0.5 rounded border uppercase font-bold tracking-tight cursor-pointer ${
                        isActive
                          ? 'bg-amber-950/50 border-amber-500/50 text-amber-400'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 group-hover:text-amber-500/90'
                      }`}
                    >
                      {st.frequency.toFixed(1)} MHz
                    </div>

                    {/* Bookmark Toggle / Delete Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleFavorite(st.id)}
                        className={`p-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer ${
                          isFav ? 'text-pink-500' : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        title="즐겨찾기 토글"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-pink-500 text-pink-500' : ''}`} />
                      </button>

                      {st.isCustom && (
                        <button
                          onClick={() => onDeleteCustomStation(st.id)}
                          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="사용자 채널 제거"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Station Information */}
                  <div 
                    onClick={() => isPowerOn && onSelectStation(st)}
                    className="flex-1 cursor-pointer"
                  >
                    <h4 className="text-sm font-semibold text-neutral-200 line-clamp-1 group-hover:text-white flex items-center gap-1.5 flex-wrap">
                      {isActive && isPowerOn && (
                        <span className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${
                          streamStatus === 'active' ? 'bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]' :
                          streamStatus === 'loading' ? 'bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]' :
                          streamStatus === 'inactive' ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]' :
                          'bg-neutral-600'
                        }`} />
                      )}
                      <span>{st.name}</span>
                      {isActive && isPowerOn && (
                        <span className={`text-[9px] px-1 py-0.5 font-mono rounded font-bold leading-none shrink-0 ${
                          streamStatus === 'active' ? 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-400' :
                          streamStatus === 'loading' ? 'bg-amber-950/40 border border-amber-900/40 text-amber-400 animate-pulse' :
                          streamStatus === 'inactive' ? 'bg-rose-950/40 border border-rose-900/40 text-rose-400 font-bold' :
                          'bg-neutral-900 border border-neutral-800 text-neutral-500'
                        }`}>
                          {streamStatus === 'active' ? 'LIVE 송출중' :
                           streamStatus === 'loading' ? '동조중..' :
                           streamStatus === 'inactive' ? 'OFFLINE' : '대기'}
                        </span>
                      )}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="inline-block px-1.5 py-0.5 bg-neutral-900 border border-neutral-850 text-[9px] font-medium rounded text-yellow-500/90 font-bold">
                        {st.genre}
                      </span>
                      {verifiedPlayable[st.id] === true ? (
                        <span className="inline-block px-1 py-0.5 bg-emerald-950/20 border border-emerald-500/20 text-[9px] rounded font-mono text-emerald-400 leading-none">
                          ● 수신가능
                        </span>
                      ) : verifiedPlayable[st.id] === false ? (
                        <span className="inline-block px-1 py-0.5 bg-rose-950/20 border border-rose-500/20 text-[9px] rounded font-mono text-rose-400/80 leading-none">
                          ✖ 수신제한
                        </span>
                      ) : (
                        <span className="inline-block px-1 py-0.5 bg-neutral-900 border border-neutral-850 text-[9px] rounded font-mono text-neutral-400 animate-pulse leading-none">
                          ● 확인중
                        </span>
                      )}
                      {st.country && (
                        <span className="inline-block px-1.2 py-0.5 bg-neutral-900/60 border border-neutral-850 text-[9px] font-sans rounded text-neutral-400 leading-none">
                          {getCountryEmoji(st.country)}
                          {st.country}
                        </span>
                      )}
                      {st.topic && (
                        <span className="inline-block px-1.2 py-0.5 bg-neutral-900/60 border border-neutral-850 text-[9px] font-sans rounded text-neutral-400 leading-none">
                          {st.topic}
                        </span>
                      )}
                    </div>
                    {st.description && (
                      <p className="text-[11px] text-neutral-500 leading-relaxed mt-2 line-clamp-2">
                        {st.description}
                      </p>
                    )}
                  </div>

                  {/* Play visual status strip */}
                  {isActive && isPowerOn && (
                    <div className={`absolute bottom-0 inset-x-8 h-0.5 rounded px-[0.5px] transition-all shadow ${
                      streamStatus === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' :
                      streamStatus === 'loading' ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]' :
                      streamStatus === 'inactive' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]' :
                      'bg-neutral-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
