export type Difficulty = 'easy' | 'medium' | 'hard';

export type TimingRating = 'perfect' | 'great' | 'good' | 'miss';

export type Rank = 'S' | 'A' | 'B' | 'C' | 'D';

export interface Note {
  id: string;
  time: number; // Target hit time in seconds
  word: string; // The word to type
  duration?: number;
}

export interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: number; // in seconds
  difficulty: Difficulty;
  audioUrl?: string; // Optional external audio file URL
  genre?: string;
  isCustom?: boolean;
}

export interface SongChart {
  song: SongMetadata;
  notes: Note[];
}

export interface ScoreState {
  score: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  greatCount: number;
  goodCount: number;
  missCount: number;
  totalKeystrokes: number;
  errorKeystrokes: number;
  accuracy: number;
  wpm: number;
}

export interface HighScore {
  songId: string;
  bestScore: number;
  bestAccuracy: number;
  bestWpm: number;
  bestCombo: number;
  rank: Rank;
  date: string;
}

export type GameScreenState =
  | 'home'
  | 'song_select'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'result'
  | 'settings';

export interface GameSettings {
  musicVolume: number; // 0 to 1
  sfxVolume: number;   // 0 to 1
  noteSpeed: 'slow' | 'normal' | 'fast'; // visual approach speed
  highwayPerspective: '3d' | '2d'; // Guitar Hero 3D slanted highway vs 2D top-down
  showWpm: boolean;
  showAccuracy: boolean;
  reducedMotion: boolean;
}

export interface HitFeedback {
  id: string;
  rating: TimingRating;
  scoreBonus: number;
  deltaMs: number;
  timestamp: number;
}

export interface ActiveWordState {
  noteIndex: number;
  note: Note;
  typed: string;
  isError: boolean;
  completed: boolean;
}
