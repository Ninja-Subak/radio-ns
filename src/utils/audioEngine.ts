/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EQMode } from '../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioStream: HTMLAudioElement | null = null;
  private bypassAudioStream: HTMLAudioElement | null = null;
  private streamSourceNode: MediaElementAudioSourceNode | null = null;
  
  // Equalizer nodes
  private eqLow: BiquadFilterNode | null = null;
  private eqMid: BiquadFilterNode | null = null;
  private eqHigh: BiquadFilterNode | null = null;
  
  // Main volume controls
  private masterGain: GainNode | null = null;
  private streamGain: GainNode | null = null;
  private staticGain: GainNode | null = null;
  
  // Live Analyser for canvas visualizer
  public analyser: AnalyserNode | null = null;
  
  // Static Noise elements
  private staticBufferSource: AudioBufferSourceNode | null = null;

  // Procedural Sound gains and nodes
  private ambientGains: { [key: string]: GainNode } = {};
  private ambientSources: { [key: string]: AudioNode[] } = {};

  // Status flags
  private isInitialized = false;
  private currentEQMode: EQMode = 'Normal';
  private isBypassMode = true;
  private currentVolume = 0.8;
  private currentUrl = '';
  private onBypassChangeCallback: ((active: boolean) => void) | null = null;
  private onStreamStatusCallback: ((status: 'idle' | 'loading' | 'active' | 'inactive', errorDetail?: string) => void) | null = null;
  private connectionTimeoutRef: any = null;

  // Stored targets to avoid early initialization traps
  private targetMasterVolume = 0.8;
  private targetStaticVolume = 0.0;
  private ambientVolumes: { [key: string]: number } = {};

  private clearConnectionTimeout() {
    if (this.connectionTimeoutRef) {
      clearTimeout(this.connectionTimeoutRef);
      this.connectionTimeoutRef = null;
    }
  }

  private startConnectionTimeout() {
    this.clearConnectionTimeout();
    this.connectionTimeoutRef = setTimeout(() => {
      if (this.onStreamStatusCallback) {
        this.onStreamStatusCallback('inactive', '수신 대역 정보 없음 (오프라인)');
      }
    }, 6000); // 6s timeout for signal check
  }

  constructor() {
    // Initial audio stream element
    this.audioStream = new Audio();
    this.audioStream.crossOrigin = 'anonymous';
    // Prevent standard browser logs about user-interaction blockages
    this.audioStream.preload = 'none';

    // Backup stream completely bypassing AudioContext to avoid CORS blockade
    this.bypassAudioStream = new Audio();
    this.bypassAudioStream.preload = 'none';

    // Setup active signal listeners
    const handlePlayConfirmed = () => {
      this.clearConnectionTimeout();
      if (this.onStreamStatusCallback) {
        this.onStreamStatusCallback('active');
      }
    };

    const handleLoadError = (e: Event) => {
      if (!this.isBypassMode && this.audioStream) {
        return; 
      }
      this.clearConnectionTimeout();
      if (this.onStreamStatusCallback) {
        this.onStreamStatusCallback('inactive', '방송 송출 장애 (연결 실패)');
      }
    };

    this.audioStream.addEventListener('playing', handlePlayConfirmed);
    this.audioStream.addEventListener('timeupdate', () => {
      if (this.audioStream && this.audioStream.currentTime > 0) {
        handlePlayConfirmed();
      }
    });

    this.bypassAudioStream.addEventListener('playing', handlePlayConfirmed);
    this.bypassAudioStream.addEventListener('timeupdate', () => {
      if (this.bypassAudioStream && this.bypassAudioStream.currentTime > 0) {
        handlePlayConfirmed();
      }
    });
    this.bypassAudioStream.addEventListener('error', handleLoadError);

    // If standard audio stream fails to load on CORS-restricted radios, auto-recover using direct playback!
    this.audioStream.addEventListener('error', () => {
      if (this.currentUrl) {
        this.enableAutoBypass(this.currentUrl);
      } else {
        handleLoadError(new Event('error'));
      }
    });
  }

  public registerStreamStatusCallback(callback: (status: 'idle' | 'loading' | 'active' | 'inactive', errorDetail?: string) => void) {
    this.onStreamStatusCallback = callback;
  }

  /**
   * Initializes the AudioContext lazily after user interaction
   */
  public init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      // Setup Analyser
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;

      // Setup Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.targetMasterVolume; // Set from stored target

      // Setup EQ chain (Low, Mid, High)
      this.eqLow = this.ctx.createBiquadFilter();
      this.eqLow.type = 'lowshelf';
      this.eqLow.frequency.value = 250;

      this.eqMid = this.ctx.createBiquadFilter();
      this.eqMid.type = 'peaking';
      this.eqMid.Q.value = 1.0;
      this.eqMid.frequency.value = 1000;

      this.eqHigh = this.ctx.createBiquadFilter();
      this.eqHigh.type = 'highshelf';
      this.eqHigh.frequency.value = 4000;

      // Setup Stream Gain
      this.streamGain = this.ctx.createGain();
      this.streamGain.gain.value = 1.0;

      // Setup Static Noise Gain
      this.staticGain = this.ctx.createGain();
      this.staticGain.gain.value = this.targetStaticVolume * 0.35; // Set from stored target

      // Connect standard stream element
      // Standard audio element -> SourceNode -> StreamGain -> EQ low -> EQ mid -> EQ high -> Analyser -> Master Gain -> Destination
      if (this.audioStream) {
        this.streamSourceNode = this.ctx.createMediaElementSource(this.audioStream);
        this.streamSourceNode.connect(this.streamGain);
        
        this.streamGain.connect(this.eqLow);
        this.eqLow.connect(this.eqMid);
        this.eqMid.connect(this.eqHigh);
        this.eqHigh.connect(this.analyser);
        this.analyser.connect(this.masterGain);
      } else {
        this.eqLow.connect(this.eqMid);
        this.eqMid.connect(this.eqHigh);
        this.eqHigh.connect(this.analyser);
        this.analyser.connect(this.masterGain);
      }

      this.masterGain.connect(this.ctx.destination);

      // Start looping radio static sound
      this.startRadioStatic();

      // Start ambient procedural synthesisers
      this.setupProceduralAmbience();

      this.isInitialized = true;
      this.applyEQ(this.currentEQMode);
    } catch (e) {
      console.error('Failed to initialize AudioContext', e);
    }
  }

  /**
   * Resumes the AudioContext safely
   */
  public resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Sets the stream URL and starts playing
   */
  public playStream(url: string) {
    this.resumeContext();
    this.currentUrl = url;

    if (this.onStreamStatusCallback) {
      this.onStreamStatusCallback('loading');
    }
    this.startConnectionTimeout();

    try {
      if (this.isBypassMode) {
        // Stop standard stream to prevent double audios
        if (this.audioStream) {
          this.audioStream.pause();
          this.audioStream.src = '';
        }
        
        if (this.bypassAudioStream) {
          this.bypassAudioStream.src = url;
          this.bypassAudioStream.volume = this.currentVolume;
          this.bypassAudioStream.load();
          const p = this.bypassAudioStream.play();
          if (p !== undefined) {
            p.catch(error => {
              console.warn('Bypass audio play failed:', error);
            });
          }
        }
      } else {
        // Stop bypass stream to prevent double audios
        if (this.bypassAudioStream) {
          this.bypassAudioStream.pause();
          this.bypassAudioStream.src = '';
        }

        if (this.audioStream) {
          this.audioStream.src = url;
          this.audioStream.load();
          const p = this.audioStream.play();
          if (p !== undefined) {
            p.catch(error => {
              console.warn('Standard stream play failed, auto triggering bypass:', error);
              this.enableAutoBypass(url);
            });
          }
        }
      }
    } catch (e) {
      console.error('Audio stream playback failed', e);
      this.clearConnectionTimeout();
      if (this.onStreamStatusCallback) {
        this.onStreamStatusCallback('inactive', '수신 채널 인스턴스 실패');
      }
    }
  }

  /**
   * Pauses the stream playback
   */
  public pauseStream() {
    this.clearConnectionTimeout();
    if (this.onStreamStatusCallback) {
      this.onStreamStatusCallback('idle');
    }
    if (this.audioStream) {
      this.audioStream.pause();
    }
    if (this.bypassAudioStream) {
      this.bypassAudioStream.pause();
    }
  }

  /**
   * Sets master volume (0.0 to 1.0)
   */
  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.currentVolume = clamped;
    this.targetMasterVolume = clamped;

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
    
    // Sync to direct HTML5 audio bypass channel as well
    if (this.bypassAudioStream) {
      this.bypassAudioStream.volume = clamped;
    }
  }

  /**
   * Safe auto bypass trigger
   */
  private enableAutoBypass(url: string) {
    if (this.isBypassMode) return;
    this.isBypassMode = true;
    if (this.onBypassChangeCallback) {
      this.onBypassChangeCallback(true);
    }
    this.playStream(url);
  }

  /**
   * Manually sets bypass mode
   */
  public setBypassMode(active: boolean) {
    if (this.isBypassMode === active) return;
    this.isBypassMode = active;
    
    if (this.onBypassChangeCallback) {
      this.onBypassChangeCallback(active);
    }

    if (this.currentUrl) {
      // Re-route current stream with the new channel setup
      this.playStream(this.currentUrl);
    }
  }

  /**
   * Get current bypass status
   */
  public getBypassMode(): boolean {
    return this.isBypassMode;
  }

  /**
   * Register a callback for when bypass status toggles (e.g. to update React state)
   */
  public registerBypassCallback(callback: (active: boolean) => void) {
    this.onBypassChangeCallback = callback;
  }

  /**
   * Control the radio static visual and audio level (0.0 to 1.0)
   */
  public setStaticVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.targetStaticVolume = clamped;
    if (this.staticGain && this.ctx) {
      // Scale-down static overall so it does not hurt ears
      const scaledVol = clamped * 0.35; 
      this.staticGain.gain.setTargetAtTime(scaledVol, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Creates seamless radio tuning static (White Noise + Bandpass Filter)
   */
  private startRadioStatic() {
    if (!this.ctx || !this.staticGain) return;

    try {
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = sampleRate * 2; // 2 seconds of noise
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const staticSource = this.ctx.createBufferSource();
      staticSource.buffer = buffer;
      staticSource.loop = true;

      // Filter static to sound like an old radio
      const staticFilter = this.ctx.createBiquadFilter();
      staticFilter.type = 'bandpass';
      staticFilter.frequency.value = 1800; // Peak in speech frequency
      staticFilter.Q.value = 1.2;

      staticSource.connect(staticFilter);
      staticFilter.connect(this.staticGain);
      
      // Connect to master level analyser so the wave still wobbles on empty static!
      if (this.analyser) {
        this.staticGain.connect(this.analyser);
      } else {
        this.staticGain.connect(this.ctx.destination);
      }

      staticSource.start(0);
      this.staticBufferSource = staticSource;
    } catch (e) {
      console.error('Error starting procedural radio static', e);
    }
  }

  /**
   * Set up procedural ambient noises completely client-side.
   * Connects them straight to the master output.
   */
  private setupProceduralAmbience() {
    if (!this.ctx || !this.masterGain) return;

    const sounds = ['rain', 'ocean', 'campfire', 'wind'];
    sounds.forEach((soundId) => {
      if (!this.ctx) return;
      const gainNode = this.ctx.createGain();
      const storedVol = this.ambientVolumes[soundId] !== undefined ? this.ambientVolumes[soundId] : 0.0;
      gainNode.gain.value = storedVol; // Start with the correct stored volume
      gainNode.connect(this.masterGain!);
      this.ambientGains[soundId] = gainNode;
    });

    // Setup synthesis rules for each, started/stopped lazily
    this.synthesizeRain();
    this.synthesizeOcean();
    this.synthesizeCampfire();
    this.synthesizeWind();
  }

  /**
   * Sets dynamic volumes for ambient sounds
   */
  public setAmbientVolume(soundId: string, vol: number) {
    this.ambientVolumes[soundId] = vol;
    const gain = this.ambientGains[soundId];
    if (gain && this.ctx) {
      gain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Procedural Rain Sound Generator
   */
  private synthesizeRain() {
    if (!this.ctx) return;
    try {
      const ctx = this.ctx;
      const gainNode = this.ambientGains['rain'];

      // Generate a long noise buffer for rain base
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Filter rain sound: lowpass around 800Hz + warm high frequency roll-off
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 900;

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 120;

      noise.connect(lowpass);
      lowpass.connect(highpass);
      highpass.connect(gainNode);
      noise.start(0);

      // Save references to destroy/cleanup later if needed
      this.ambientSources['rain'] = [noise];
    } catch (e) {
      console.error('Procedural Rain failed', e);
    }
  }

  /**
   * Procedural Ocean Sound Generator (Slowly automated breaking waves)
   */
  private synthesizeOcean() {
    if (!this.ctx) return;
    try {
      const ctx = this.ctx;
      const gainNode = this.ambientGains['ocean'];

      // Ocean noise base
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Very heavy low pass for distant deep sea rumble
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 350;

      // Dynamic swell modulator (slowly brings waves up/down every 6 seconds)
      const modulatorGain = ctx.createGain();
      modulatorGain.gain.value = 0.5;

      noise.connect(lowpass);
      lowpass.connect(modulatorGain);
      modulatorGain.connect(gainNode);
      noise.start(0);

      // SWELL LFO: Sweep ocean waves volume slowly using a LFO Oscillator node!
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12; // 1 cycle every ~8 seconds

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.35; // Swell amplitude range

      lfo.connect(lfoGain);
      // Offset swell so volume never goes completely to 0
      const offsetGain = ctx.createGain();
      offsetGain.gain.value = 0.45;

      lfoGain.connect(modulatorGain.gain);
      lfo.start(0);

      this.ambientSources['ocean'] = [noise, lfo];
    } catch (e) {
      console.error('Procedural Ocean failed', e);
    }
  }

  /**
   * Procedural Campfire Sound Generator (Crackles + Charcoal Hum)
   */
  private synthesizeCampfire() {
    if (!this.ctx) return;
    try {
      const ctx = this.ctx;
      const gainNode = this.ambientGains['campfire'];

      // Hum (Pink/Brown-ish low noise)
      const numSamples = ctx.sampleRate * 2;
      const humBuffer = ctx.createBuffer(1, numSamples, ctx.sampleRate);
      const output = humBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < numSamples; i++) {
        const white = Math.random() * 2 - 1;
        // Brownian noise approximation
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 4.5; // Gain补偿
      }

      const humSource = ctx.createBufferSource();
      humSource.buffer = humBuffer;
      humSource.loop = true;

      const humFilter = ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.value = 280;

      humSource.connect(humFilter);
      humFilter.connect(gainNode);
      humSource.start(0);

      // Sparks (random high impulses with dynamic envelopes)
      const crackleGain = ctx.createGain();
      crackleGain.gain.value = 0.35;
      crackleGain.connect(gainNode);

      // Periodically trigger a quick snap/crackle
      const triggerCrackles = () => {
        if (!this.ctx || gainNode.gain.value < 0.01) {
          // If muted or suspended, schedule checks slightly later to save CPU
          setTimeout(triggerCrackles, 600);
          return;
        }

        try {
          // Play a sharp popcorn/crackle note
          const osc = ctx.createOscillator();
          const pGain = ctx.createGain();
          
          osc.type = 'triangle';
          // High popping focus freq
          osc.frequency.setValueAtTime(4500 + Math.random() * 7000, ctx.currentTime);
          
          pGain.gain.setValueAtTime(0, ctx.currentTime);
          pGain.gain.linearRampToValueAtTime(0.08 + Math.random() * 0.15, ctx.currentTime + 0.002);
          pGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015 + Math.random() * 0.04);
          
          osc.connect(pGain);
          pGain.connect(crackleGain);
          
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.1);
        } catch (_) {}

        // Schedule next fire snap (highly random, natural interval)
        const delay = 40 + Math.random() * 320;
        setTimeout(triggerCrackles, delay);
      };

      triggerCrackles();
      this.ambientSources['campfire'] = [humSource];
    } catch (e) {
      console.error('Procedural Campfire failed', e);
    }
  }

  /**
   * Procedural Pine Forest Wind Sound Generator (Dynamic sweeping bandpass filters)
   */
  private synthesizeWind() {
    if (!this.ctx) return;
    try {
      const ctx = this.ctx;
      const gainNode = this.ambientGains['wind'];

      // Wind base noise
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Sweeping Bandpass filter is what creates gorgeous air whistling sounds
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(450, ctx.currentTime);
      windFilter.Q.setValueAtTime(1.8, ctx.currentTime);

      noise.connect(windFilter);
      windFilter.connect(gainNode);
      noise.start(0);

      // Sweep wind filter frequency dynamically using separate slow LFO
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.06, ctx.currentTime); // Dynamic wind gusts

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(180, ctx.currentTime); // Sweep range

      lfo.connect(lfoGain);
      lfoGain.connect(windFilter.frequency);
      lfo.start(0);

      this.ambientSources['wind'] = [noise, lfo];
    } catch (e) {
      console.error('Procedural Wind failed', e);
    }
  }

  /**
   * Applies custom acoustic EQ Profiles
   */
  public applyEQ(mode: EQMode) {
    this.currentEQMode = mode;
    if (!this.isInitialized || !this.eqLow || !this.eqMid || !this.eqHigh || !this.ctx) return;

    const time = this.ctx.currentTime;
    switch (mode) {
      case 'Normal':
        this.eqLow.gain.setTargetAtTime(0, time, 0.1);
        this.eqMid.gain.setTargetAtTime(0, time, 0.1);
        this.eqHigh.gain.setTargetAtTime(0, time, 0.1);
        break;
      case 'Retro-Warm':
        // Bass boosted, treble rolled off for warm analogue cabinet feeling
        this.eqLow.gain.setTargetAtTime(8, time, 0.1);
        this.eqMid.gain.setTargetAtTime(2, time, 0.1);
        this.eqHigh.gain.setTargetAtTime(-9, time, 0.1);
        break;
      case 'Bass Boost':
        // Punchy low end boost
        this.eqLow.gain.setTargetAtTime(11, time, 0.1);
        this.eqMid.gain.setTargetAtTime(-3, time, 0.1);
        this.eqHigh.gain.setTargetAtTime(1, time, 0.1);
        break;
      case 'Concert Hall':
        // Elevated lows and highs for ambient space feeling
        this.eqLow.gain.setTargetAtTime(5, time, 0.1);
        this.eqMid.gain.setTargetAtTime(-4, time, 0.1);
        this.eqHigh.gain.setTargetAtTime(8, time, 0.1);
        break;
      case 'Vocal':
        // Crisp voice clarity focus, rolls off muddy bass
        this.eqLow.gain.setTargetAtTime(-7, time, 0.1);
        this.eqMid.gain.setTargetAtTime(9, time, 0.1);
        this.eqHigh.gain.setTargetAtTime(3, time, 0.1);
        break;
      case 'Clear Sky':
        // High fidelity shimmering treble
        this.eqLow.gain.setTargetAtTime(-1, time, 0.1);
        this.eqMid.gain.setTargetAtTime(1, time, 0.1);
        this.eqHigh.gain.setTargetAtTime(10, time, 0.1);
        break;
    }
  }

  /**
   * Clean up all sounds when unmounting
   */
  public destroy() {
    if (this.audioStream) {
      this.audioStream.pause();
      this.audioStream.removeAttribute('src');
      this.audioStream.load();
    }
    
    // Stop static noise
    if (this.staticBufferSource) {
      try { this.staticBufferSource.stop(); } catch (_) {}
    }

    // Stop procedural synthesizers
    Object.keys(this.ambientSources).forEach((soundId) => {
      this.ambientSources[soundId].forEach((node) => {
        try {
          if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
            node.stop();
          }
        } catch (_) {}
      });
    });

    if (this.ctx) {
      this.ctx.close();
    }
  }
}

// Global Single Instance to avoid overlapping streams across hot-reloads
export const globalAudioEngine = new AudioEngine();
