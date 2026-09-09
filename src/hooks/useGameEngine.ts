'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SongChart,
  Note,
  ScoreState,
  HitFeedback,
  GameSettings,
  Rank,
  TimingRating,
} from '@/game/types';
import { ScoringEngine } from '@/game/ScoringEngine';
import { AudioEngine } from '@/game/AudioEngine';
import { StorageManager } from '@/game/StorageManager';

interface UseGameEngineProps {
  chart: SongChart | null;
  settings: GameSettings;
  audioEngine: AudioEngine;
  onSongComplete: (finalScore: ScoreState, rank: Rank) => void;
  onExitToSelect: () => void;
}

export function useGameEngine({
  chart,
  settings,
  audioEngine,
  onSongComplete,
  onExitToSelect,
}: UseGameEngineProps) {
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Note progress
  const [activeNoteIndex, setActiveNoteIndex] = useState(0);
  const [typedLetters, setTypedLetters] = useState('');
  const [isTypo, setIsTypo] = useState(false);

  // Scoring
  const [scoreState, setScoreState] = useState<ScoreState>(() =>
    ScoringEngine.createInitialScoreState()
  );

  // Feedback notifications
  const [feedbacks, setFeedbacks] = useState<HitFeedback[]>([]);

  // Guitar Hero style combo milestone banner
  const [comboMilestone, setComboMilestone] = useState<{
    text: string;
    mult: number;
    combo: number;
  } | null>(null);

  // Beat pulse trigger
  const [beatPulse, setBeatPulse] = useState(false);
  const lastBeatIndexRef = useRef(-1);

  // Note status tracking (completed or missed)
  const completedNoteIdsRef = useRef<Set<string>>(new Set());

  // Refs for high-frequency RAF loop and event listeners
  const rafIdRef = useRef<number | null>(null);
  const scoreStateRef = useRef<ScoreState>(scoreState);
  const activeNoteIndexRef = useRef(0);
  const typedLettersRef = useRef('');

  useEffect(() => {
    scoreStateRef.current = scoreState;
  }, [scoreState]);

  useEffect(() => {
    activeNoteIndexRef.current = activeNoteIndex;
  }, [activeNoteIndex]);

  useEffect(() => {
    typedLettersRef.current = typedLetters;
  }, [typedLetters]);

  // Approach duration in seconds based on note speed
  const approachDuration =
    settings.noteSpeed === 'fast' ? 1.4 : settings.noteSpeed === 'slow' ? 2.6 : 2.0;

  // ------------------------------------------------------------------
  // AUDIO & PLAYBACK CONTROL
  // ------------------------------------------------------------------
  const startGame = useCallback(async () => {
    if (!chart) return;
    completedNoteIdsRef.current.clear();
    setScoreState(ScoringEngine.createInitialScoreState());
    setActiveNoteIndex(0);
    setTypedLetters('');
    setIsTypo(false);
    setFeedbacks([]);
    setCurrentTime(0);
    setIsPaused(false);
    setIsPlaying(true);

    await audioEngine.playSong(chart.song, 0);
  }, [chart, audioEngine]);

  const pauseGame = useCallback(() => {
    if (!isPlaying || isPaused) return;
    setIsPaused(true);
    audioEngine.pause();
  }, [isPlaying, isPaused, audioEngine]);

  const resumeGame = useCallback(() => {
    if (!isPlaying || !isPaused) return;
    setIsPaused(false);
    audioEngine.resume();
  }, [isPlaying, isPaused, audioEngine]);

  const restartGame = useCallback(async () => {
    audioEngine.stop();
    await startGame();
  }, [audioEngine, startGame]);

  const exitGame = useCallback(() => {
    audioEngine.stop();
    setIsPlaying(false);
    setIsPaused(false);
    onExitToSelect();
  }, [audioEngine, onExitToSelect]);

  // ------------------------------------------------------------------
  // FEEDBACK TRIGGER
  // ------------------------------------------------------------------
  const triggerFeedback = useCallback((rating: TimingRating, scoreBonus: number, deltaMs: number) => {
    const newFeedback: HitFeedback = {
      id: `fb_${Date.now()}_${Math.random()}`,
      rating,
      scoreBonus,
      deltaMs,
      timestamp: Date.now(),
    };
    setFeedbacks((prev) => [...prev.slice(-4), newFeedback]);
  }, []);

  // ------------------------------------------------------------------
  // NOTE COMPLETION / MISS HANDLER
  // ------------------------------------------------------------------
  const handleNoteResolution = useCallback(
    (rating: TimingRating, deltaMs: number, note: Note) => {
      completedNoteIdsRef.current.add(note.id);

      const isHit = rating !== 'miss';
      const baseScore = ScoringEngine.BASE_SCORE[rating];

      if (isHit) {
        audioEngine.playHitSfx(rating);
      } else {
        audioEngine.playHitSfx('miss');
      }

      triggerFeedback(rating, baseScore, deltaMs);

      // Check for Guitar Hero milestone crossing
      setScoreState((prev) => {
        const nextCombo = isHit ? prev.combo + 1 : 0;

        if (isHit && (nextCombo === 10 || nextCombo === 25 || nextCombo === 50 || nextCombo === 100)) {
          const mult = nextCombo >= 50 ? 4 : nextCombo >= 25 ? 3 : 2;
          const text =
            nextCombo >= 50
              ? `${nextCombo} COMBO — 4× ON FIRE!`
              : nextCombo >= 25
              ? `${nextCombo} COMBO — 3× MULTIPLIER!`
              : `${nextCombo} COMBO — 2× MULTIPLIER!`;

          setComboMilestone({ text, mult, combo: nextCombo });
          audioEngine.playComboMilestoneSfx(nextCombo);

          setTimeout(() => {
            setComboMilestone((current) => (current?.combo === nextCombo ? null : current));
          }, 1200);
        }

        const nextMaxCombo = Math.max(prev.maxCombo, nextCombo);
        const comboMult = ScoringEngine.getComboMultiplier(prev.combo);
        const addedScore = isHit ? baseScore * comboMult : 0;

        const nextScore = prev.score + addedScore;
        const nextPerfect = rating === 'perfect' ? prev.perfectCount + 1 : prev.perfectCount;
        const nextGreat = rating === 'great' ? prev.greatCount + 1 : prev.greatCount;
        const nextGood = rating === 'good' ? prev.goodCount + 1 : prev.goodCount;
        const nextMiss = rating === 'miss' ? prev.missCount + 1 : prev.missCount;

        const accuracy = ScoringEngine.calculateAccuracy(
          prev.totalKeystrokes,
          prev.errorKeystrokes
        );

        return {
          ...prev,
          score: nextScore,
          combo: nextCombo,
          maxCombo: nextMaxCombo,
          perfectCount: nextPerfect,
          greatCount: nextGreat,
          goodCount: nextGood,
          missCount: nextMiss,
          accuracy,
        };
      });

      // Advance to next note
      setActiveNoteIndex((prev) => prev + 1);
      setTypedLetters('');
      setIsTypo(false);
    },
    [audioEngine, triggerFeedback]
  );

  // ------------------------------------------------------------------
  // MAIN RAF ANIMATION & SYNCHRONIZATION LOOP
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isPlaying || isPaused || !chart) return;

    let isFinished = false;

    const tick = () => {
      const audioTime = audioEngine.getCurrentSongTime();
      setCurrentTime(audioTime);

      // Beat pulse check
      const secondsPerBeat = 60 / chart.song.bpm;
      const currentBeatIndex = Math.floor(audioTime / secondsPerBeat);
      if (currentBeatIndex !== lastBeatIndexRef.current) {
        lastBeatIndexRef.current = currentBeatIndex;
        if (!settings.reducedMotion) {
          setBeatPulse(true);
          setTimeout(() => setBeatPulse(false), 120);
        }
      }

      // WPM update
      if (audioTime > 1.0) {
        setScoreState((prev) => ({
          ...prev,
          wpm: ScoringEngine.calculateWpm(prev.totalKeystrokes, audioTime),
        }));
      }

      // Check for missed notes that passed beyond the Good hit window (+200ms)
      const curIndex = activeNoteIndexRef.current;
      if (curIndex < chart.notes.length) {
        const activeNote = chart.notes[curIndex];
        const delta = audioTime - activeNote.time;

        if (delta > ScoringEngine.WINDOW_GOOD && !completedNoteIdsRef.current.has(activeNote.id)) {
          handleNoteResolution('miss', Math.round(delta * 1000), activeNote);
        }
      }

      // Song completion check
      const allNotesResolved = completedNoteIdsRef.current.size >= chart.notes.length;
      const songTimeOver = audioTime >= chart.song.duration;

      if ((allNotesResolved || songTimeOver) && !isFinished) {
        isFinished = true;
        audioEngine.stop();
        setIsPlaying(false);

        const finalRank = ScoringEngine.calculateRank(scoreStateRef.current);
        // Save high score locally
        StorageManager.saveHighScore({
          songId: chart.song.id,
          bestScore: scoreStateRef.current.score,
          bestAccuracy: scoreStateRef.current.accuracy,
          bestWpm: scoreStateRef.current.wpm,
          bestCombo: scoreStateRef.current.maxCombo,
          rank: finalRank,
          date: new Date().toISOString(),
        });

        onSongComplete(scoreStateRef.current, finalRank);
        return;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [
    isPlaying,
    isPaused,
    chart,
    audioEngine,
    settings.reducedMotion,
    handleNoteResolution,
    onSongComplete,
  ]);

  // ------------------------------------------------------------------
  // KEYBOARD INPUT INTERCEPTOR
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle pause via Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isPaused) {
          resumeGame();
        } else {
          pauseGame();
        }
        return;
      }

      // When paused, ignore typing
      if (isPaused) return;

      // Prevent scrolling on Space or Tab during game
      if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
      }

      if (!chart) return;
      const curIndex = activeNoteIndexRef.current;
      if (curIndex >= chart.notes.length) return;

      const activeNote = chart.notes[curIndex];
      const targetWord = activeNote.word;
      const currentTyped = typedLettersRef.current;

      // Backspace handling
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (currentTyped.length > 0) {
          setTypedLetters(currentTyped.slice(0, -1));
          setIsTypo(false);
        }
        return;
      }

      // Ignore modifiers, arrows, functional keys
      if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      const inputChar = e.key.toLowerCase();
      const expectedChar = targetWord[currentTyped.length];

      // Typing check
      if (inputChar === expectedChar) {
        // Correct letter!
        const nextTyped = currentTyped + inputChar;
        audioEngine.playKeystrokeSfx();

        setScoreState((prev) => ({
          ...prev,
          totalKeystrokes: prev.totalKeystrokes + 1,
          accuracy: ScoringEngine.calculateAccuracy(
            prev.totalKeystrokes + 1,
            prev.errorKeystrokes
          ),
        }));

        setIsTypo(false);

        if (nextTyped === targetWord) {
          // Word completed! Evaluate timing against target hit time
          const audioTime = audioEngine.getCurrentSongTime();
          const evaluation = ScoringEngine.evaluateTiming(audioTime, activeNote.time);
          handleNoteResolution(evaluation.rating, evaluation.deltaMs, activeNote);
        } else {
          setTypedLetters(nextTyped);
        }
      } else {
        // Mistype!
        audioEngine.playErrorSfx();
        setIsTypo(true);

        setScoreState((prev) => ({
          ...prev,
          totalKeystrokes: prev.totalKeystrokes + 1,
          errorKeystrokes: prev.errorKeystrokes + 1,
          accuracy: ScoringEngine.calculateAccuracy(
            prev.totalKeystrokes + 1,
            prev.errorKeystrokes + 1
          ),
        }));

        // Shake timeout
        setTimeout(() => setIsTypo(false), 200);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlaying,
    isPaused,
    chart,
    audioEngine,
    pauseGame,
    resumeGame,
    handleNoteResolution,
  ]);

  const streakTier =
    scoreState.combo >= 50 ? 3 : scoreState.combo >= 25 ? 2 : scoreState.combo >= 10 ? 1 : 0;

  return {
    isPlaying,
    isPaused,
    currentTime,
    activeNoteIndex,
    typedLetters,
    isTypo,
    scoreState,
    feedbacks,
    comboMilestone,
    streakTier,
    beatPulse,
    approachDuration,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    exitGame,
  };
}
