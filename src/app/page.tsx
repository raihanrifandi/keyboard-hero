'use client';

import React, { useState } from 'react';
import {
  GameScreenState,
  SongChart,
  GameSettings,
  ScoreState,
  Rank,
  HighScore,
} from '@/game/types';
import { BUILT_IN_SONGS } from '@/data/songs';
import { StorageManager } from '@/game/StorageManager';
import { ScoringEngine } from '@/game/ScoringEngine';
import { HomeScreen } from '@/components/home/HomeScreen';
import { SongSelectScreen } from '@/components/song-select/SongSelectScreen';
import { CountdownScreen } from '@/components/countdown/CountdownScreen';
import { GameplayScreen } from '@/components/gameplay/GameplayScreen';
import { ResultScreen } from '@/components/result/ResultScreen';
import { SettingsScreen } from '@/components/settings/SettingsScreen';

export default function App() {
  // Screen state
  const [screen, setScreen] = useState<GameScreenState>('home');

  // Song catalog (built-in + user custom songs)
  const [allSongs, setAllSongs] = useState<SongChart[]>(() => {
    if (typeof window === 'undefined') return BUILT_IN_SONGS;
    const customSongs = StorageManager.getCustomSongs();
    return customSongs.length > 0 ? [...BUILT_IN_SONGS, ...customSongs] : BUILT_IN_SONGS;
  });
  const [selectedSongId, setSelectedSongId] = useState<string>(BUILT_IN_SONGS[0].song.id);

  // Settings & high scores
  const [settings, setSettings] = useState<GameSettings>(() => StorageManager.getSettings());
  const [highScores, setHighScores] = useState<Record<string, HighScore>>(() =>
    StorageManager.getHighScores()
  );

  // Active game session results
  const [lastScoreState, setLastScoreState] = useState<ScoreState>(() =>
    ScoringEngine.createInitialScoreState()
  );
  const [lastRank, setLastRank] = useState<Rank>('D');

  const selectedChart =
    allSongs.find((s) => s.song.id === selectedSongId) || allSongs[0];

  // Song Custom Handlers
  const handleSongCreated = (newChart: SongChart) => {
    StorageManager.saveCustomSong(newChart);
    setAllSongs((prev) => [...prev, newChart]);
    setSelectedSongId(newChart.song.id);
  };

  const handleDeleteCustomSong = (songId: string) => {
    StorageManager.deleteCustomSong(songId);
    setAllSongs((prev) => prev.filter((s) => s.song.id !== songId));
    if (selectedSongId === songId) {
      setSelectedSongId(BUILT_IN_SONGS[0].song.id);
    }
  };

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    StorageManager.saveSettings(newSettings);
  };

  // Game flow transitions
  const handleStartGame = () => {
    setScreen('countdown');
  };

  const handleCountdownComplete = () => {
    setScreen('playing');
  };

  const handleSongComplete = (finalScore: ScoreState, rank: Rank) => {
    setLastScoreState(finalScore);
    setLastRank(rank);
    // Reload high scores to reflect latest record
    setHighScores(StorageManager.getHighScores());
    setScreen('result');
  };

  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          onPlay={() => setScreen('song_select')}
          onSongs={() => setScreen('song_select')}
          onSettings={() => setScreen('settings')}
        />
      )}

      {screen === 'song_select' && (
        <SongSelectScreen
          songs={allSongs}
          highScores={highScores}
          selectedSongId={selectedSongId}
          onSelectSong={(id) => setSelectedSongId(id)}
          onStartGame={handleStartGame}
          onBack={() => setScreen('home')}
          onSongCreated={handleSongCreated}
          onDeleteCustomSong={handleDeleteCustomSong}
        />
      )}

      {screen === 'countdown' && (
        <CountdownScreen
          chart={selectedChart}
          onCountdownComplete={handleCountdownComplete}
        />
      )}

      {screen === 'playing' && (
        <GameplayScreen
          chart={selectedChart}
          settings={settings}
          onSongComplete={handleSongComplete}
          onExitToSelect={() => setScreen('song_select')}
        />
      )}

      {screen === 'result' && (
        <ResultScreen
          chart={selectedChart}
          scoreState={lastScoreState}
          rank={lastRank}
          onPlayAgain={handleStartGame}
          onSongSelect={() => setScreen('song_select')}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onBack={() => setScreen('home')}
        />
      )}
    </>
  );
}
