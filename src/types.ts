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
}

export interface AmbientSound {
  id: string;
  name: string;
  label: string;
  volume: number; // 0 to 1
  isPlaying: boolean;
}

export type EQMode = 'Normal' | 'Retro-Warm' | 'Bass Boost' | 'Concert Hall' | 'Vocal' | 'Clear Sky';
