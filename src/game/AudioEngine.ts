import { SongMetadata, TimingRating } from './types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // External audio element playback
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;

  // State
  private isPlaying = false;
  private isPaused = false;
  private songStartTime = 0;
  private pauseTimeOffset = 0;
  private currentSong: SongMetadata | null = null;

  // Procedural scheduler timer
  private synthIntervalId: number | null = null;
  private nextBeatTime = 0;
  private currentBeatIndex = 0;

  // Volumes (0 to 1)
  private musicVolume = 0.8;
  private sfxVolume = 0.7;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public async init(): Promise<void> {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.musicVolume;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.sfxVolume;
    this.sfxGain.connect(this.masterGain);

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public setMusicVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.musicVolume;
    }
  }

  public setSfxVolume(vol: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  /**
   * Returns current song playback time in seconds, with microsecond precision.
   */
  public getCurrentSongTime(): number {
    if (!this.isPlaying) {
      return this.pauseTimeOffset;
    }
    if (this.isPaused) {
      return this.pauseTimeOffset;
    }
    if (this.audioElement && !this.audioElement.paused) {
      return this.audioElement.currentTime;
    }
    if (!this.ctx) return 0;
    return Math.max(0, this.ctx.currentTime - this.songStartTime);
  }

  /**
   * Starts playing a song, either using procedural synth or audioUrl
   */
  public async playSong(song: SongMetadata, startOffset = 0): Promise<void> {
    await this.init();
    if (!this.ctx) return;

    this.stop();
    this.currentSong = song;
    this.isPlaying = true;
    this.isPaused = false;
    this.pauseTimeOffset = startOffset;
    this.songStartTime = this.ctx.currentTime - startOffset;

    if (song.audioUrl) {
      // External or custom audio file
      try {
        if (!this.audioElement) {
          this.audioElement = new Audio();
          this.audioElement.crossOrigin = 'anonymous';
          this.audioSourceNode = this.ctx.createMediaElementSource(this.audioElement);
          if (this.musicGain) {
            this.audioSourceNode.connect(this.musicGain);
          }
        }
        this.audioElement.src = song.audioUrl;
        this.audioElement.currentTime = startOffset;
        await this.audioElement.play();
      } catch (err) {
        console.warn('Could not play external audio file, falling back to procedural synth', err);
        this.startProceduralSynth(song, startOffset);
      }
    } else {
      // Procedural Web Audio rhythmic backing track
      this.startProceduralSynth(song, startOffset);
    }
  }

  public pause(): void {
    if (!this.isPlaying || this.isPaused) return;
    this.isPaused = true;
    this.pauseTimeOffset = this.getCurrentSongTime();

    if (this.audioElement) {
      this.audioElement.pause();
    }

    if (this.synthIntervalId !== null) {
      window.clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
  }

  public resume(): void {
    if (!this.isPlaying || !this.isPaused || !this.ctx) return;
    this.isPaused = false;
    this.songStartTime = this.ctx.currentTime - this.pauseTimeOffset;

    if (this.audioElement) {
      this.audioElement.play().catch(console.error);
    } else if (this.currentSong) {
      this.startProceduralSynth(this.currentSong, this.pauseTimeOffset);
    }
  }

  public stop(): void {
    this.isPlaying = false;
    this.isPaused = false;
    this.pauseTimeOffset = 0;

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }

    if (this.synthIntervalId !== null) {
      window.clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
  }

  // -------------------------------------------------------------
  // PROCEDURAL WEB AUDIO SYNTHESIZER
  // -------------------------------------------------------------
  private startProceduralSynth(song: SongMetadata, startOffset: number): void {
    if (!this.ctx || !this.musicGain) return;

    const secondsPerBeat = 60 / song.bpm;
    this.currentBeatIndex = Math.floor(startOffset / secondsPerBeat);
    this.nextBeatTime = this.ctx.currentTime + (secondsPerBeat - (startOffset % secondsPerBeat));

    // Lookahead scheduler
    const scheduleAheadTime = 0.15;
    const lookaheadIntervalMs = 40;

    this.synthIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || this.isPaused) return;

      while (this.nextBeatTime < this.ctx.currentTime + scheduleAheadTime) {
        this.scheduleBeat(song, this.nextBeatTime, this.currentBeatIndex);
        this.nextBeatTime += secondsPerBeat;
        this.currentBeatIndex++;
      }
    }, lookaheadIntervalMs);
  }

  private scheduleBeat(song: SongMetadata, time: number, beatIndex: number): void {
    if (!this.ctx || !this.musicGain) return;
    const beatInMeasure = beatIndex % 4;

    switch (song.id) {
      case 'digital-rush':
        // Fast Electronic / Drum & Bass: heavy kick, snappy snare, rolling bass
        if (beatInMeasure === 0 || (beatIndex % 8 === 6)) {
          this.playKick(time, 150, 0.25);
        }
        if (beatInMeasure === 2) {
          this.playSnare(time, 0.2);
        }
        this.playHiHat(time, 0.05);
        this.playHiHat(time + (60 / song.bpm) * 0.5, 0.03);
        // Bassline note
        const bassFreq = [55, 65.4, 73.4, 49][Math.floor(beatIndex / 4) % 4];
        this.playBass(time, bassFreq, (60 / song.bpm) * 0.9);
        break;

      case 'sunday-drive':
        // Lo-Fi Chill: mellow kick on 0, soft snare on 2, relaxed chords
        if (beatInMeasure === 0) {
          this.playKick(time, 90, 0.3);
        }
        if (beatInMeasure === 2) {
          this.playSnare(time, 0.12, true);
        }
        this.playHiHat(time, 0.03);
        const lofiBass = [65.4, 82.4, 73.4, 58.3][Math.floor(beatIndex / 4) % 4];
        this.playMellowSynth(time, lofiBass, (60 / song.bpm) * 1.5);
        break;

      case 'neon-dreams':
      default:
        // Synthwave 128 BPM: 4-on-the-floor kick, snare on 2 and 4, octave synth bass
        this.playKick(time, 120, 0.3);
        if (beatInMeasure === 1 || beatInMeasure === 3) {
          this.playSnare(time, 0.22);
        }
        this.playHiHat(time + (60 / song.bpm) * 0.5, 0.04);
        const synthwaveNote = [110, 110, 130.8, 146.8][beatInMeasure];
        this.playSynthLead(time, synthwaveNote, (60 / song.bpm) * 0.4);
        break;
    }
  }

  // Instrument primitives
  private playKick(time: number, startFreq = 130, duration = 0.25): void {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + duration);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playSnare(time: number, duration = 0.18, soft = false): void {
    if (!this.ctx || !this.musicGain) return;
    // Noise buffer
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = soft ? 'lowpass' : 'highpass';
    filter.frequency.value = soft ? 1200 : 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(soft ? 0.3 : 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
    noise.stop(time + duration);
  }

  private playHiHat(time: number, duration = 0.04): void {
    if (!this.ctx || !this.musicGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
    noise.stop(time + duration);
  }

  private playBass(time: number, freq: number, duration: number): void {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + duration);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playSynthLead(time: number, freq: number, duration: number): void {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 2, time);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playMellowSynth(time: number, freq: number, duration: number): void {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // -------------------------------------------------------------
  // SOUND EFFECTS (SFX)
  // -------------------------------------------------------------
  public playHitSfx(rating: TimingRating): void {
    if (!this.ctx || !this.sfxGain || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    switch (rating) {
      case 'perfect':
        this.playTone(now, 880, 0.12, 'sine', 0.4);
        this.playTone(now + 0.02, 1760, 0.14, 'sine', 0.3);
        break;
      case 'great':
        this.playTone(now, 784, 0.12, 'sine', 0.35);
        this.playTone(now + 0.02, 1174, 0.12, 'sine', 0.25);
        break;
      case 'good':
        this.playTone(now, 523.25, 0.14, 'sine', 0.3);
        break;
      case 'miss':
        this.playTone(now, 110, 0.15, 'triangle', 0.4);
        break;
    }
  }

  public playKeystrokeSfx(): void {
    if (!this.ctx || !this.sfxGain || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    // Crisp mechanical key click sound
    this.playTone(now, 1200, 0.02, 'triangle', 0.12);
  }

  public playErrorSfx(): void {
    if (!this.ctx || !this.sfxGain || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    this.playTone(now, 180, 0.08, 'sawtooth', 0.2);
  }

  public playCountdownTick(isGo = false): void {
    if (!this.ctx || !this.sfxGain || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    if (isGo) {
      this.playTone(now, 880, 0.25, 'sine', 0.5);
      this.playTone(now + 0.05, 1320, 0.3, 'sine', 0.4);
    } else {
      this.playTone(now, 440, 0.1, 'sine', 0.4);
    }
  }

  /**
   * Guitar Hero style multiplier / combo milestone sound effect
   */
  public playComboMilestoneSfx(combo: number): void {
    if (!this.ctx || !this.sfxGain || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    if (combo >= 50) {
      // 4X Max Multiplier / On Fire Power Chord Swell
      this.playTone(now, 293.66, 0.35, 'sawtooth', 0.25); // D4
      this.playTone(now + 0.04, 440.0, 0.38, 'sawtooth', 0.25); // A4
      this.playTone(now + 0.08, 587.33, 0.45, 'sawtooth', 0.3); // D5
      this.playTone(now + 0.12, 739.99, 0.5, 'sine', 0.35); // F#5
    } else if (combo >= 25) {
      // 3X Multiplier Power Chime
      this.playTone(now, 698.46, 0.2, 'sine', 0.35); // F5
      this.playTone(now + 0.04, 880.0, 0.25, 'sine', 0.35); // A5
      this.playTone(now + 0.08, 1046.5, 0.35, 'sine', 0.4); // C6
    } else if (combo >= 10) {
      // 2X Multiplier Ascending Chime
      this.playTone(now, 523.25, 0.16, 'sine', 0.35); // C5
      this.playTone(now + 0.04, 659.25, 0.2, 'sine', 0.35); // E5
      this.playTone(now + 0.08, 783.99, 0.28, 'sine', 0.4); // G5
    }
  }

  private playTone(time: number, freq: number, duration: number, type: OscillatorType, volume: number): void {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + duration);
  }
}

// Global audio engine singleton
export const audioEngine = typeof window !== 'undefined' ? new AudioEngine() : (null as unknown as AudioEngine);
