import { GameSettings, HighScore, SongChart } from './types';

const SETTINGS_KEY = 'keyboard_hero_settings_v1';
const HIGH_SCORES_KEY = 'keyboard_hero_highscores_v1';
const CUSTOM_SONGS_KEY = 'keyboard_hero_custom_songs_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.8,
  sfxVolume: 0.7,
  noteSpeed: 'normal',
  highwayPerspective: '3d',
  showWpm: true,
  showAccuracy: true,
  reducedMotion: false,
};

export class StorageManager {
  public static getSettings(): GameSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static saveSettings(settings: GameSettings): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings to localStorage', err);
    }
  }

  public static getHighScores(): Record<string, HighScore> {
    if (typeof window === 'undefined') return {};
    try {
      const data = localStorage.getItem(HIGH_SCORES_KEY);
      if (!data) return {};
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  public static getHighScoreForSong(songId: string): HighScore | null {
    const scores = this.getHighScores();
    return scores[songId] || null;
  }

  public static saveHighScore(highScore: HighScore): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const scores = this.getHighScores();
      const existing = scores[highScore.songId];

      // Update if new score is higher or no existing record
      if (!existing || highScore.bestScore > existing.bestScore) {
        scores[highScore.songId] = highScore;
        localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
        return true; // New personal record!
      }
      return false;
    } catch (err) {
      console.error('Failed to save high score to localStorage', err);
      return false;
    }
  }

  public static getCustomSongs(): SongChart[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(CUSTOM_SONGS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static saveCustomSong(chart: SongChart): void {
    if (typeof window === 'undefined') return;
    try {
      const songs = this.getCustomSongs().filter((s) => s.song.id !== chart.song.id);
      songs.push(chart);
      localStorage.setItem(CUSTOM_SONGS_KEY, JSON.stringify(songs));
    } catch (err) {
      console.error('Failed to save custom song to localStorage', err);
    }
  }

  public static deleteCustomSong(songId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const songs = this.getCustomSongs().filter((s) => s.song.id !== songId);
      localStorage.setItem(CUSTOM_SONGS_KEY, JSON.stringify(songs));
    } catch (err) {
      console.error('Failed to delete custom song', err);
    }
  }
}
