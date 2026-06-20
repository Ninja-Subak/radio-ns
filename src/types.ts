/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RadioStation {
  id: string;
  name: string;
  frequency: number; // e.g. 89.1, must be between 87.5 and 108.0
  url: string;
  genre: string;
  isCustom?: boolean;
  description?: string;
  country?: string; // e.g., '대한민국', '미국', '영국', '스위스 & 유럽'
  topic?: string;   // e.g., '음악', '뉴스/시사', '교양/학습', '힐링/로파이'
}

export interface AmbientSound {
  id: string;
  name: string;
  label: string;
  volume: number; // 0 to 1
  isPlaying: boolean;
}

export type EQMode = 'Normal' | 'Retro-Warm' | 'Bass Boost' | 'Concert Hall' | 'Vocal' | 'Clear Sky';
