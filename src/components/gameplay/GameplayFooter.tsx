'use client';

import React from 'react';

interface GameplayFooterProps {
  wpm: number;
  showWpm: boolean;
  currentTime: number;
  totalDuration: number;
  songTitle: string;
}

export const GameplayFooter: React.FC<GameplayFooterProps> = ({
  wpm,
  showWpm,
  currentTime,
  totalDuration,
  songTitle,
}) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTime / Math.max(1, totalDuration)) * 100));

  return (
    <footer className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center px-6 py-4 text-xs font-mono-stat text-[#909090] gap-4 select-none">
      {/* WPM Display */}
      <div>
        {showWpm && (
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#F5F5F5]">{wpm}</span>
            <span className="text-[11px] text-[#909090] tracking-wider uppercase">WPM</span>
          </div>
        )}
      </div>

      {/* Center / Timeline Progress */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <span>{formatTime(currentTime)}</span>
        <div className="relative flex-1 h-1 bg-[#343434] rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-[#FF5A36] transition-all duration-100"
          />
        </div>
        <span>{formatTime(totalDuration)}</span>
      </div>

      {/* Song Track Info */}
      <div className="text-right truncate max-w-[160px] text-[#6B6861]">
        {songTitle}
      </div>
    </footer>
  );
};
