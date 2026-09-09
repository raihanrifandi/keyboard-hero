import { TimingRating, Rank, ScoreState } from './types';

export class ScoringEngine {
  // Timing windows in seconds (PRD Section 11)
  public static readonly WINDOW_PERFECT = 0.050; // ±50ms
  public static readonly WINDOW_GREAT   = 0.100; // ±100ms
  public static readonly WINDOW_GOOD    = 0.200; // ±200ms

  // Base scores (PRD Section 15)
  public static readonly BASE_SCORE: Record<TimingRating, number> = {
    perfect: 200,
    great: 100,
    good: 50,
    miss: 0,
  };

  /**
   * Evaluates input timing against target note hit time.
   * delta = inputTime - targetTime (in seconds)
   */
  public static evaluateTiming(inputTime: number, targetTime: number): {
    rating: TimingRating;
    deltaMs: number;
    scoreBonus: number;
  } {
    const deltaSeconds = inputTime - targetTime;
    const absDelta = Math.abs(deltaSeconds);
    const deltaMs = Math.round(deltaSeconds * 1000);

    let rating: TimingRating;
    if (absDelta <= this.WINDOW_PERFECT) {
      rating = 'perfect';
    } else if (absDelta <= this.WINDOW_GREAT) {
      rating = 'great';
    } else if (absDelta <= this.WINDOW_GOOD) {
      rating = 'good';
    } else {
      rating = 'miss';
    }

    return {
      rating,
      deltaMs,
      scoreBonus: this.BASE_SCORE[rating],
    };
  }

  /**
   * Calculates combo multiplier (PRD Section 16)
   * 0–9   -> 1x
   * 10–24 -> 2x
   * 25–49 -> 3x
   * 50+   -> 4x
   */
  public static getComboMultiplier(combo: number): number {
    if (combo >= 50) return 4;
    if (combo >= 25) return 3;
    if (combo >= 10) return 2;
    return 1;
  }

  /**
   * Calculates real-time WPM: (characters typed / 5) / elapsed minutes (PRD Section 19)
   */
  public static calculateWpm(totalKeystrokes: number, elapsedSeconds: number): number {
    if (elapsedSeconds <= 0 || totalKeystrokes <= 0) return 0;
    const minutes = elapsedSeconds / 60;
    const words = totalKeystrokes / 5;
    return Math.max(0, Math.round(words / minutes));
  }

  /**
   * Calculates accuracy percentage based on keystroke accuracy (PRD Section 18)
   */
  public static calculateAccuracy(totalKeystrokes: number, errorKeystrokes: number): number {
    if (totalKeystrokes <= 0) return 100;
    const valid = Math.max(0, totalKeystrokes - errorKeystrokes);
    const ratio = (valid / totalKeystrokes) * 100;
    return Math.round(ratio * 10) / 10;
  }

  /**
   * Calculates performance Rank: S, A, B, C, D (PRD Section 26)
   */
  public static calculateRank(state: ScoreState): Rank {
    const totalNotes = state.perfectCount + state.greatCount + state.goodCount + state.missCount;
    if (totalNotes === 0) return 'D';

    const accuracy = state.accuracy;
    const missCount = state.missCount;

    if (accuracy >= 96 && missCount <= 1) {
      return 'S';
    }
    if (accuracy >= 90 && missCount <= 3) {
      return 'A';
    }
    if (accuracy >= 80) {
      return 'B';
    }
    if (accuracy >= 70) {
      return 'C';
    }
    return 'D';
  }

  public static createInitialScoreState(): ScoreState {
    return {
      score: 0,
      combo: 0,
      maxCombo: 0,
      perfectCount: 0,
      greatCount: 0,
      goodCount: 0,
      missCount: 0,
      totalKeystrokes: 0,
      errorKeystrokes: 0,
      accuracy: 100,
      wpm: 0,
    };
  }
}
