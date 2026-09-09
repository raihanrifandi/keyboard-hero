'use client';

import React, { useState } from 'react';
import { SongChart, HighScore } from '@/game/types';
import { CustomSongModal } from './CustomSongModal';

interface SongSelectScreenProps {
  songs: SongChart[];
  highScores: Record<string, HighScore>;
  selectedSongId: string;
  onSelectSong: (songId: string) => void;
  onStartGame: () => void;
  onBack: () => void;
  onSongCreated: (chart: SongChart) => void;
  onDeleteCustomSong: (songId: string) => void;
}

export const SongSelectScreen: React.FC<SongSelectScreenProps> = ({
  songs,
  highScores,
  selectedSongId,
  onSelectSong,
  onStartGame,
  onBack,
  onSongCreated,
  onDeleteCustomSong,
}) => {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const selectedChart = songs.find((s) => s.song.id === selectedSongId) || songs[0];

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'text-[#2E9B61] border-[#2E9B61]/30 bg-[#2E9B61]/5';
      case 'hard':
        return 'text-[#D64545] border-[#D64545]/30 bg-[#D64545]/5';
      case 'medium':
      default:
        return 'text-[#C58A24] border-[#C58A24]/30 bg-[#C58A24]/5';
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between px-6 py-10 bg-[#F4F1EA] text-[#171717] select-none">
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto flex justify-between items-center pb-6 border-b border-[#D6D1C7]">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="btn-tactile px-3 py-1.5 text-xs font-semibold text-[#6B6861] hover:text-[#171717] bg-white border border-[#D6D1C7] rounded cursor-pointer"
          >
            ← BACK
          </button>
          <h1 className="text-xl font-black tracking-tight text-[#171717]">
            SONG SELECT
          </h1>
        </div>

        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="btn-tactile px-3 py-1.5 text-xs font-semibold text-[#FF5A36] hover:bg-[#FF5A36]/10 bg-white border border-[#FF5A36]/40 rounded cursor-pointer"
        >
          + LOAD CUSTOM SONG
        </button>
      </header>

      {/* Main Arcade Song List */}
      <div className="w-full max-w-4xl mx-auto my-auto py-8">
        <div className="space-y-3">
          {songs.map((item, index) => {
            const isSelected = item.song.id === selectedSongId;
            const highScore = highScores[item.song.id];
            const songIndexStr = (index + 1).toString().padStart(2, '0');

            return (
              <div
                key={item.song.id}
                onClick={() => onSelectSong(item.song.id)}
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#FF5A36] shadow-sm ring-1 ring-[#FF5A36]'
                    : 'bg-white/70 hover:bg-white border-[#D6D1C7]'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Number indicator */}
                  <span
                    className={`font-mono-stat text-sm font-bold ${
                      isSelected ? 'text-[#FF5A36]' : 'text-[#6B6861]'
                    }`}
                  >
                    {songIndexStr}
                  </span>

                  {/* Selection indicator bar */}
                  <div
                    className={`w-1 h-8 rounded-full ${
                      isSelected ? 'bg-[#FF5A36]' : 'bg-transparent'
                    }`}
                  />

                  {/* Song Title & Artist */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold tracking-tight text-[#171717]">
                        {item.song.title}
                      </h3>
                      {item.song.isCustom && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono-stat bg-neutral-200 text-neutral-700">
                          CUSTOM
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B6861] mt-0.5 font-medium">
                      {item.song.artist}
                    </p>
                  </div>
                </div>

                {/* Metadata badges & high score */}
                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:flex items-center gap-3 font-mono-stat text-xs text-[#6B6861]">
                    <span>{item.song.bpm} BPM</span>
                    <span>•</span>
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold uppercase ${getDifficultyColor(
                        item.song.difficulty
                      )}`}
                    >
                      {item.song.difficulty}
                    </span>
                    <span>•</span>
                    <span>{formatDuration(item.song.duration)}</span>
                  </div>

                  {highScore ? (
                    <div className="min-w-28 pl-4 border-l border-[#D6D1C7] text-right">
                      <div className="text-[11px] text-[#6B6861] font-mono-stat">
                        BEST: <span className="text-sm font-bold text-[#171717]">{highScore.bestScore.toLocaleString()}</span>
                      </div>
                      <span className="text-xs font-bold text-[#FF5A36] font-mono-stat">
                        RANK {highScore.rank}
                      </span>
                    </div>
                  ) : (
                    <div className="min-w-28 pl-4 border-l border-[#D6D1C7] text-right text-xs text-[#6B6861] font-mono-stat">
                      NO SCORE
                    </div>
                  )}

                  {item.song.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete custom song "${item.song.title}"?`)) {
                          onDeleteCustomSong(item.song.id);
                        }
                      }}
                      className="text-xs text-[#6B6861] hover:text-[#D64545] p-1.5 rounded hover:bg-neutral-100"
                      title="Delete custom song"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Play Action */}
      <footer className="w-full max-w-4xl mx-auto flex justify-between items-center pt-6 border-t border-[#D6D1C7]">
        <div className="font-mono-stat text-xs text-[#6B6861]">
          Selected: <strong className="text-[#171717]">{selectedChart?.song.title}</strong> ({selectedChart?.song.bpm} BPM)
        </div>

        <button
          onClick={onStartGame}
          className="btn-tactile py-3 px-8 bg-[#FF5A36] hover:bg-[#E84E2B] text-white font-bold text-base rounded-lg border-b-2 border-[#C93B1B] shadow-sm cursor-pointer"
        >
          START GAME →
        </button>
      </footer>

      {/* Custom Song Modal */}
      <CustomSongModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSongCreated={onSongCreated}
      />
    </main>
  );
};
