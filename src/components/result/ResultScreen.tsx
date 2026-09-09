'use client';

import React from 'react';
import { SongChart, ScoreState, Rank } from '@/game/types';

interface ResultScreenProps {
  chart: SongChart;
  scoreState: ScoreState;
  rank: Rank;
  onPlayAgain: () => void;
  onSongSelect: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  chart,
  scoreState,
  rank,
  onPlayAgain,
  onSongSelect,
}) => {
  const getRankColor = (r: Rank) => {
    switch (r) {
      case 'S':
        return 'text-[#FF5A36] border-[#FF5A36]';
      case 'A':
        return 'text-[#2E9B61] border-[#2E9B61]';
      case 'B':
        return 'text-[#3478C8] border-[#3478C8]';
      case 'C':
        return 'text-[#C58A24] border-[#C58A24]';
      case 'D':
      default:
        return 'text-[#D64545] border-[#D64545]';
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between items-center px-6 py-12 bg-[#F4F1EA] text-[#171717] select-none">
      {/* Header */}
      <header className="w-full max-w-xl text-center pb-4 border-b border-[#D6D1C7]">
        <span className="text-xs font-mono-stat tracking-widest text-[#6B6861] uppercase">
          PERFORMANCE REPORT
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight mt-1">
          {chart.song.title}
        </h1>
        <p className="text-xs text-[#6B6861] font-mono-stat mt-0.5">
          {chart.song.artist} • {chart.song.bpm} BPM • {chart.song.difficulty.toUpperCase()}
        </p>
      </header>

      {/* Main Scoreboard Arcade Card */}
      <div className="w-full max-w-xl my-auto py-6 flex flex-col items-center">
        {/* Large Typographic Rank */}
        <div className="relative mb-6">
          <div
            className={`w-28 h-28 flex items-center justify-center rounded-2xl border-4 font-mono-stat text-7xl font-black shadow-sm ${getRankColor(
              rank
            )}`}
          >
            {rank}
          </div>
          <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-white px-3 py-0.5 rounded-full border border-[#D6D1C7] text-[10px] font-bold font-mono-stat tracking-widest uppercase text-[#171717]">
            RANK
          </span>
        </div>

        {/* Final Score */}
        <div className="text-center mb-8">
          <span className="text-xs font-mono-stat text-[#6B6861] tracking-widest uppercase">
            FINAL SCORE
          </span>
          <div className="font-mono-stat text-5xl sm:text-6xl font-black text-[#171717] tracking-tight mt-1">
            {scoreState.score.toLocaleString()}
          </div>
        </div>

        {/* Core Metrics: WPM, Accuracy, Max Combo */}
        <div className="grid grid-cols-3 w-full max-w-md gap-3 mb-8 text-center">
          <div className="p-3 bg-white rounded-lg border border-[#D6D1C7] shadow-xs">
            <span className="block text-[11px] font-mono-stat text-[#6B6861]">WPM</span>
            <span className="font-mono-stat text-xl font-bold text-[#171717]">
              {scoreState.wpm}
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-[#D6D1C7] shadow-xs">
            <span className="block text-[11px] font-mono-stat text-[#6B6861]">ACCURACY</span>
            <span className="font-mono-stat text-xl font-bold text-[#171717]">
              {scoreState.accuracy.toFixed(1)}%
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-[#D6D1C7] shadow-xs">
            <span className="block text-[11px] font-mono-stat text-[#6B6861]">MAX COMBO</span>
            <span className="font-mono-stat text-xl font-bold text-[#FF5A36]">
              {scoreState.maxCombo}×
            </span>
          </div>
        </div>

        {/* Timing Breakdown List */}
        <div className="w-full max-w-md bg-white rounded-xl border border-[#D6D1C7] p-4 font-mono-stat text-xs space-y-2.5 shadow-xs">
          <div className="flex justify-between items-center text-[#2E9B61]">
            <span className="font-bold tracking-wider">PERFECT (±50ms)</span>
            <span className="text-sm font-black">{scoreState.perfectCount}</span>
          </div>
          <div className="flex justify-between items-center text-[#3478C8]">
            <span className="font-bold tracking-wider">GREAT (±100ms)</span>
            <span className="text-sm font-black">{scoreState.greatCount}</span>
          </div>
          <div className="flex justify-between items-center text-[#C58A24]">
            <span className="font-bold tracking-wider">GOOD (±200ms)</span>
            <span className="text-sm font-black">{scoreState.goodCount}</span>
          </div>
          <div className="flex justify-between items-center text-[#D64545]">
            <span className="font-bold tracking-wider">MISS (&gt;200ms)</span>
            <span className="text-sm font-black">{scoreState.missCount}</span>
          </div>
        </div>
      </div>

      {/* Tactile Action Buttons */}
      <footer className="w-full max-w-md flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#D6D1C7]">
        <button
          onClick={onPlayAgain}
          className="btn-tactile flex-1 py-3 px-6 bg-[#FF5A36] hover:bg-[#E84E2B] text-white font-bold text-sm rounded-lg border-b-2 border-[#C93B1B] shadow-sm cursor-pointer text-center"
        >
          PLAY AGAIN
        </button>
        <button
          onClick={onSongSelect}
          className="btn-tactile flex-1 py-3 px-6 bg-white hover:bg-[#EAE7DF] text-[#171717] font-semibold text-sm rounded-lg border border-[#D6D1C7] shadow-sm cursor-pointer text-center"
        >
          SONG SELECT
        </button>
      </footer>
    </main>
  );
};
