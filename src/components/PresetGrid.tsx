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
  onSelectStation: (st: RadioStation) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteCustomStation: (id: string) => void;
  isPowerOn: boolean;
}

export const PresetGrid: React.FC<PresetGridProps> = ({
  stations,
  favorites,
  activeStationId,
  onSelectStation,
  onToggleFavorite,
  onDeleteCustomStation,
  isPowerOn,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'custom'>('all');

  // Search/Filter logical sequence
  const filteredStations = stations.filter((st) => {
    const matchesSearch = 
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.frequency.toString().includes(searchQuery);

    const matchesTab = 
      filterType === 'all' ||
      (filterType === 'favorites' && favorites.includes(st.id)) ||
      (filterType === 'custom' && st.isCustom === true);

    return matchesSearch && matchesTab;
  });

  return (
    <div className="bg-white border border-neutral-300 rounded-2xl p-6 flex flex-col h-full shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      {/* Category Tabs & Search Bar */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <h3 className="text-sm font-sans text-neutral-800 uppercase tracking-wide font-extrabold">
              라디오 채널 수신국 ({stations.length})
            </h3>
          </div>

          <div className="flex items-center bg-neutral-50 border border-neutral-200 hover:border-neutral-300 transition-colors rounded-xl px-3 py-2 text-xs text-neutral-600 w-full md:max-w-[220px]">
            <Search className="w-3.5 h-3.5 mr-2 text-neutral-400" />
            <input
              type="text"
              placeholder="채널 번호, 이름, 장르..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-neutral-700 placeholder-neutral-400 w-full text-xs"
            />
          </div>
        </div>

        {/* Filters Selectors */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 border border-neutral-200 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-white border border-amber-200 text-amber-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/50'
            }`}
          >
            전체 채널
          </button>
          <button
            onClick={() => setFilterType('favorites')}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              filterType === 'favorites'
                ? 'bg-white border border-pink-200 text-pink-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/50'
            }`}
          >
            <Heart className="w-3" />
            즐겨찾기 ({favorites.length})
          </button>
          <button
            onClick={() => setFilterType('custom')}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterType === 'custom'
                ? 'bg-white border border-emerald-200 text-emerald-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/50'
            }`}
          >
            사용자 채널
          </button>
        </div>
      </div>

      {/* Grid Wrapper */}
      <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
        {filteredStations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-xl">
            <HelpCircle className="w-8 h-8 mb-2.5 text-neutral-300 animate-pulse" />
            <p className="text-xs font-mono text-neutral-600">수신 필터에 부합하는 방송국이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredStations.map((st) => {
              const isActive = activeStationId === st.id;
              const isFav = favorites.includes(st.id);

              return (
                <div
                  key={st.id}
                  className={`group relative flex flex-col justify-between p-4.5 rounded-xl border transition-all duration-300 select-none ${
                    isActive
                      ? 'bg-amber-50/60 border-amber-500 shadow-[0_4px_16px_rgba(245,158,11,0.12)] ring-1 ring-amber-400'
                      : 'bg-white border-neutral-200 hover:bg-amber-50/20 hover:border-amber-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {/* Monospace LED Dial Badge */}
                    <div 
                      onClick={() => isPowerOn && onSelectStation(st)}
                      className={`text-xs font-mono px-2.5 py-1 rounded border uppercase font-extrabold tracking-tight cursor-pointer ${
                        isActive
                          ? 'bg-amber-100 border-amber-300 text-amber-700'
                          : 'bg-neutral-50 border-neutral-205 text-neutral-700 group-hover:text-amber-600'
                      }`}
                    >
                      {st.frequency.toFixed(1)} MHz
                    </div>

                    {/* Bookmark Toggle / Delete Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleFavorite(st.id)}
                        className={`p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer ${
                          isFav ? 'text-pink-500' : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                        title="즐겨찾기 토글"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-pink-500 text-pink-500' : ''}`} />
                      </button>

                      {st.isCustom && (
                        <button
                          onClick={() => onDeleteCustomStation(st.id)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="사용자 채널 제거"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Station Information */}
                  <div 
                    onClick={() => isPowerOn && onSelectStation(st)}
                    className="flex-1 cursor-pointer"
                  >
                    <h4 className="text-sm font-extrabold text-neutral-800 line-clamp-1 group-hover:text-amber-700 transition-colors">
                      {st.name}
                    </h4>
                    <span className="inline-block px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-[10px] font-mono rounded text-amber-700 mt-1.5 font-bold">
                      {st.genre}
                    </span>
                    {st.description && (
                      <p className="text-[11px] text-neutral-500 leading-relaxed mt-2.5 line-clamp-2">
                        {st.description}
                      </p>
                    )}
                  </div>

                  {/* Play visual status strip */}
                  {isActive && isPowerOn && (
                    <div className="absolute bottom-0 inset-x-8 h-0.5 bg-amber-500 rounded p-[0.5px] shadow-[0_0_10px_#f59e0b]" />
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
