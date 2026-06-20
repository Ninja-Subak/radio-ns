/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RadioStation } from '../types';
import { Plus, HelpCircle, CheckCircle } from 'lucide-react';

interface AddStationFormProps {
  onAddStation: (st: Omit<RadioStation, 'id'>) => void;
  existingStations: RadioStation[];
  isPowerOn: boolean;
}

export const AddStationForm: React.FC<AddStationFormProps> = ({
  onAddStation,
  existingStations,
  isPowerOn,
}) => {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('');
  const [url, setUrl] = useState('');
  const [genre, setGenre] = useState('My Custom');
  const [description, setDescription] = useState('');
  const [errorMess, setErrorMess] = useState('');
  const [successMess, setSuccessMess] = useState(false);

  // Suggested popular public stream links for easy copy-pasting
  const templates = [
    { name: 'K-Rock Mix', url: 'https://stream.zeno.fm/f3bby88b9g8uv', freq: '90.3', genre: 'K-Rock' },
    { name: 'Anime Lo-Fi', url: 'https://stream.zeno.fm/0ka26ndvbe8uv', freq: '96.2', genre: 'Anime' },
    { name: 'City Jazz', url: 'https://live.jazz24.org/jazz24-mp3', freq: '103.5', genre: 'Jazz' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMess('');
    setSuccessMess(false);

    if (!isPowerOn) {
      setErrorMess('라디오 전원을 먼저 켜주십시오.');
      return;
    }

    if (!name.trim()) {
      setErrorMess('방송국의 이름을 기재해 주십시오.');
      return;
    }

    const freqNum = parseFloat(frequency);
    if (isNaN(freqNum) || freqNum < 87.5 || freqNum > 108.0) {
      setErrorMess('주파수 번호는 87.5MHz ~ 108.0MHz 범위 안으로 한정됩니다.');
      return;
    }

    // Check duplicate frequency
    const isDuplicate = existingStations.some((st) => Math.abs(st.frequency - freqNum) < 0.05);
    if (isDuplicate) {
      setErrorMess(`FM ${freqNum} MHz 주파수에는 이미 방송국 채널이 수신 설정되어 있습니다.`);
      return;
    }

    if (!url.trim() || !url.startsWith('http')) {
      setErrorMess('올바른 오디오 스트리밍 주소(URL http... )를 대입해 주십시오.');
      return;
    }

    onAddStation({
      name: name.trim(),
      frequency: freqNum,
      url: url.trim(),
      genre: genre.trim() || 'Custom',
      description: description.trim() || '사용자 커스텀 개인 채널 방송망.',
    });

    // Reset Form
    setName('');
    setFrequency('');
    setUrl('');
    setGenre('My Custom');
    setDescription('');
    setSuccessMess(true);
    setTimeout(() => setSuccessMess(false), 3000);
  };

  const applyTemplate = (tpl: typeof templates[0]) => {
    setName(tpl.name);
    setFrequency(tpl.freq);
    setUrl(tpl.url);
    setGenre(tpl.genre);
    setDescription('공개 스트림 소스를 이용한 간편 채널 구성.');
  };

  return (
    <div className="bg-white border border-neutral-300 rounded-2xl p-6 flex flex-col h-full shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 mb-3.5 border-b border-neutral-100 pb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" />
        <h3 className="text-sm font-sans text-neutral-800 uppercase tracking-wider font-extrabold">
          나만의 웹 스트리밍 라디오 주파수 개설
        </h3>
      </div>

      {/* Templates helper */}
      <div className="mb-4.5 bg-neutral-50 border border-neutral-200 rounded-xl p-3">
        <span className="text-[10px] font-sans text-neutral-600 mb-2 block font-extrabold">
          ※ 템플릿 클릭 시 입력값이 자동 대입됩니다:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {templates.map((tpl, i) => (
            <button
              id={`station-tpl-${i}`}
              type="button"
              key={i}
              onClick={() => applyTemplate(tpl)}
              className="px-2.5 py-1.5 text-[10px] font-mono border border-neutral-250 hover:border-amber-500 bg-white text-neutral-700 hover:text-amber-700 hover:bg-amber-50/30 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
            >
              {tpl.name} ({tpl.freq}M)
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="text-[10px] font-sans text-neutral-600 block mb-1.5 font-extrabold">채널 수신 이름</label>
            <input
              id="custom-station-name"
              type="text"
              placeholder="예: 우리집 로파이"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-50/50 border border-neutral-250 focus:border-amber-500 focus:bg-white rounded-xl p-2.5 text-xs text-neutral-800 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-sans text-neutral-600 block mb-1.5 font-extrabold">주파수 대역 (87.5-108.0)</label>
            <input
              id="custom-station-frequency"
              type="number"
              step="0.1"
              placeholder="예: 95.5"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full bg-neutral-50/50 border border-neutral-250 focus:border-amber-500 focus:bg-white rounded-xl p-2.5 text-xs text-neutral-800 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="text-[10px] font-sans text-neutral-600 block mb-1.5 font-extrabold">장르 태그</label>
            <input
              id="custom-station-genre"
              type="text"
              placeholder="예: Lofi, Jazz"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-neutral-50/50 border border-neutral-250 focus:border-amber-500 focus:bg-white rounded-xl p-2.5 text-xs text-neutral-800 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-sans text-neutral-600 block mb-1.5 font-extrabold">한줄 요약 설명</label>
            <input
              id="custom-station-desc"
              type="text"
              placeholder="간단한 메모..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-50/50 border border-neutral-250 focus:border-amber-500 focus:bg-white rounded-xl p-2.5 text-xs text-neutral-800 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-sans text-neutral-600 block mb-1.5 font-extrabold">스트리밍 스트림 소스 주소 (Audio stream URL)</label>
          <input
            id="custom-station-url"
            type="url"
            placeholder="http:// 또는 https:// 로 시작하는 오디오 오리진 주소"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-neutral-50/50 border border-neutral-250 focus:border-amber-500 focus:bg-white rounded-xl p-2.5 text-xs text-neutral-800 focus:outline-none transition-all font-mono"
          />
        </div>

        {/* Message statuses */}
        {errorMess && (
          <p id="custom-station-error" className="text-[11px] font-sans text-red-750 bg-red-50 border border-red-200 p-3 rounded-xl shadow-sm leading-relaxed">
            ⚠️ {errorMess}
          </p>
        )}

        {successMess && (
          <p id="custom-station-success" className="text-[11px] font-sans text-emerald-750 bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            성공적으로 지정 주파수에 채널이 개설되었습니다!
          </p>
        )}

        {/* Action button */}
        <button
          id="custom-station-submit"
          type="submit"
          className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500 text-neutral-950 font-extrabold rounded-xl text-xs font-sans cursor-pointer transition-all hover:scale-[1.01] shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          주파수 개설 등록 (Tune In)
        </button>
      </form>
    </div>
  );
};
