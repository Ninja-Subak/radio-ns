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
  const [country, setCountry] = useState('대한민국');
  const [topic, setTopic] = useState('음악');
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
      country,
      topic,
    });

    // Reset Form
    setName('');
    setFrequency('');
    setUrl('');
    setGenre('My Custom');
    setDescription('');
    setCountry('대한민국');
    setTopic('음악');
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
    <div className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center gap-1.5 mb-3.5">
        <Plus className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-mono text-neutral-200 uppercase/bold tracking-wider font-bold">
          나만의 웹 스트리밍 라디오 주파수 개설
        </h3>
      </div>

      {/* Templates helper */}
      <div className="mb-4">
        <span className="text-[10px] font-mono text-neutral-500 mb-1.5 block">
          ※ 템플릿 클릭 시 입력값이 자동 대입됩니다:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {templates.map((tpl, i) => (
            <button
              id={`station-tpl-${i}`}
              type="button"
              key={i}
              onClick={() => applyTemplate(tpl)}
              className="px-2 py-1 text-[10px] font-mono border border-neutral-800 hover:border-amber-600/40 bg-neutral-950/40 text-neutral-400 hover:text-amber-400 rounded-lg cursor-pointer transition-colors"
            >
              {tpl.name} ({tpl.freq}M)
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-mono text-neutral-450 block mb-1">채널 수신 이름</label>
            <input
              id="custom-station-name"
              type="text"
              placeholder="예: 우리집 로파이"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-neutral-450 block mb-1">주파수 대역 (87.5-108.0)</label>
            <input
              id="custom-station-frequency"
              type="number"
              step="0.1"
              placeholder="예: 95.5"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-mono text-neutral-500 block mb-1">장르 태그</label>
            <input
              id="custom-station-genre"
              type="text"
              placeholder="예: Lofi, Jazz"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-neutral-500 block mb-1">한줄 요약 설명</label>
            <input
              id="custom-station-desc"
              type="text"
              placeholder="간단한 메모..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-mono text-neutral-500 block mb-1 font-bold">국가 분류</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-neutral-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="대한민국">🇰🇷 대한민국</option>
              <option value="미국">🇺🇸 미국</option>
              <option value="영국">🇬🇧 영국</option>
              <option value="스위스 & 유럽">🇪🇺 스위스 & 유럽</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-neutral-500 block mb-1 font-bold">주제 분류</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-neutral-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="음악">🎵 음악</option>
              <option value="뉴스/시사">📰 뉴스/시사</option>
              <option value="교양/학습">🎓 교양/학습</option>
              <option value="힐링/로파이">🧘 힐링/로파이</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono text-neutral-500 block mb-1">스트리밍 스트림 소스 주소 (Audio stream URL)</label>
          <input
            id="custom-station-url"
            type="url"
            placeholder="http:// 또는 https:// 로 시작하는 오디오 오리진 주소"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-neutral-250 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        {/* Message statuses */}
        {errorMess && (
          <p id="custom-station-error" className="text-[10px] font-mono text-red-400 bg-red-950/25 border border-red-900/40 p-2 rounded-xl">
            ⚠️ {errorMess}
          </p>
        )}

        {successMess && (
          <p id="custom-station-success" className="text-[10px] font-mono text-emerald-400 bg-emerald-950/25 border border-emerald-900/40 p-2 rounded-xl flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            성공적으로 지정 주파수에 채널이 개설되었습니다!
          </p>
        )}

        {/* Action button */}
        <button
          id="custom-station-submit"
          type="submit"
          className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs font-mono cursor-pointer transition-colors shadow flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          주파수 개설 등록 (Tune In)
        </button>
      </form>
    </div>
  );
};
