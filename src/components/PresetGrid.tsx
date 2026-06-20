/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'custom'>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('전체');
  const [selectedTopic, setSelectedTopic] = useState<string>('전체');

  // Search/Filter logical sequence
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
      (filterType === 'custom' && st.isCustom === true);

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
          <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 text-center py-2 text-xs font-medium rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-neutral-800 text-amber-400 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              전체 채널
            </button>
            <button
              onClick={() => setFilterType('favorites')}
              className={`flex-1 text-center py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
                filterType === 'favorites'
                  ? 'bg-neutral-800 text-pink-400 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Heart className="w-3 h-3 fill-pink-500/20 text-pink-400" />
              즐겨찾기 ({favorites.length})
            </button>
            <button
              onClick={() => setFilterType('custom')}
              className={`flex-1 text-center py-2 text-xs font-medium rounded-lg transition-all ${
                filterType === 'custom'
                  ? 'bg-neutral-800 text-emerald-400 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              사용자 채널
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
                <option value="스위스 & 유럽">🇪🇺 유럽</option>
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
      <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        {filteredStations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-neutral-500">
            <HelpCircle className="w-8 h-8 mb-2 text-neutral-600 animate-bounce" />
            <p className="text-xs font-mono">수신 필터에 부합하는 방송국이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredStations.map((st) => {
              const isActive = activeStationId === st.id;
              const isFav = favorites.includes(st.id);

              return (
                <div
                  key={st.id}
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
                      {st.country && (
                        <span className="inline-block px-1.2 py-0.5 bg-neutral-900/60 border border-neutral-850 text-[9px] font-sans rounded text-neutral-400 leading-none">
                          {st.country === '대한민국' ? '🇰🇷 ' : st.country === '미국' ? '🇺🇸 ' : st.country === '영국' ? '🇬🇧 ' : st.country === '스위스 & 유럽' ? '🇨🇭 ' : '🌍 '}
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
