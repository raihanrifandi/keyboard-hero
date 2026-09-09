'use client';

import React, { useEffect } from 'react';
import { SongChart, GameSettings, ScoreState, Rank } from '@/game/types';
import { audioEngine } from '@/game/AudioEngine';
import { useGameEngine } from '@/hooks/useGameEngine';
import { GameplayHUD } from './GameplayHUD';
import { Playfield } from './Playfield';
import { GameplayFooter } from './GameplayFooter';
import { PauseOverlay } from './PauseOverlay';

interface GameplayScreenProps {
  chart: SongChart;
  settings: GameSettings;
  onSongComplete: (score: ScoreState, rank: Rank) => void;
  onExitToSelect: () => void;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  chart,
  settings,
  onSongComplete,
  onExitToSelect,
}) => {
  const engine = useGameEngine({
    chart,
    settings,
    audioEngine: audioEngine!,
    onSongComplete,
    onExitToSelect,
  });

  // Start game on mount
  useEffect(() => {
    engine.startGame();
    return () => {
      audioEngine?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [perspective, setPerspective] = React.useState<'3d' | '2d'>(
    settings.highwayPerspective || '3d'
  );

  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#171717] text-[#F5F5F5] select-none relative overflow-hidden">
      {/* Top HUD */}
      <GameplayHUD
        scoreState={engine.scoreState}
        showWpm={settings.showWpm}
        showAccuracy={settings.showAccuracy}
        onPause={engine.pauseGame}
      />

      {/* Main Interactive Playfield with Guitar Hero 3D / 2D toggle & Combo Effects */}
      <Playfield
        notes={chart.notes}
        activeNoteIndex={engine.activeNoteIndex}
        typedLetters={engine.typedLetters}
        isTypo={engine.isTypo}
        currentTime={engine.currentTime}
        approachDuration={engine.approachDuration}
        feedbacks={engine.feedbacks}
        beatPulse={engine.beatPulse}
        perspective={perspective}
        streakTier={engine.streakTier}
        comboMilestone={engine.comboMilestone}
        onTogglePerspective={() =>
          setPerspective((prev) => (prev === '3d' ? '2d' : '3d'))
        }
      />

      {/* Bottom Timeline & WPM Footer */}
      <GameplayFooter
        wpm={engine.scoreState.wpm}
        showWpm={settings.showWpm}
        currentTime={engine.currentTime}
        totalDuration={chart.song.duration}
        songTitle={`${chart.song.title} — ${chart.song.artist}`}
      />

      {/* Pause Menu Overlay */}
      {engine.isPaused && (
        <PauseOverlay
          onResume={engine.resumeGame}
          onRestart={engine.restartGame}
          onExit={engine.exitGame}
        />
      )}
    </main>
  );
};
