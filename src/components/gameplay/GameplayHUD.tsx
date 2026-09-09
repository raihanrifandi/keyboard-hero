'use client';

import React from 'react';
import { ScoreState } from '@/game/types';

interface GameplayHUDProps {
  scoreState: ScoreState;
  showWpm: boolean;
  showAccuracy: boolean;
  onPause: () => void;
}

export const GameplayHUD: React.FC<GameplayHUDProps> = ({
  scoreState,
  showAccuracy,
  onPause,
}) => {
  return (
    <header className="w-full max-w-4xl mx-auto flex justify-between items-start pt-6 pb-2 px-6 select-none z-50">
      {/* Top Left: Score */}
      <div>
        <span className="text-[11px] font-mono-stat uppercase tracking-wider text-[#909090]">
          SCORE
        </span>
        <div className="font-mono-stat text-3xl sm:text-4xl font-black text-[#F5F5F5] tracking-tight">
          {scoreState.score.toLocaleString()}
        </div>
      </div>

      {/* Top Center: Pause indicator */}
      <button
        onClick={onPause}
        className="btn-tactile px-3 py-1 bg-[#202020] hover:bg-[#282828] text-[#909090] hover:text-[#F5F5F5] text-xs font-mono-stat rounded border border-[#343434] cursor-pointer"
        title="Pause game (ESC)"
      >
        PAUSE [ESC]
      </button>

      {/* Top Right: Combo & Accuracy */}
      <div className="text-right">
        <div className="flex items-center justify-end gap-2">
          {scoreState.combo >= 10 && (
            <span
              className={`text-[11px] font-mono-stat font-black px-2 py-0.5 rounded-full border animate-beat ${
                scoreState.combo >= 50
                  ? 'bg-[#FF5A36] text-white border-[#FFD000] shadow-[0_0_10px_rgba(255,90,54,0.7)]'
                  : scoreState.combo >= 25
                  ? 'bg-[#3478C8] text-white border-[#3478C8] shadow-[0_0_8px_rgba(52,120,200,0.5)]'
                  : 'bg-[#2E9B61] text-white border-[#2E9B61] shadow-[0_0_6px_rgba(46,155,97,0.4)]'
              }`}
            >
              {scoreState.combo >= 50 ? '4× ON FIRE' : scoreState.combo >= 25 ? '3× MULT' : '2× MULT'}
            </span>
          )}

          <span className="text-[11px] font-mono-stat uppercase tracking-wider text-[#909090]">
            COMBO
          </span>
          <span
            className={`font-mono-stat text-2xl sm:text-3xl font-black ${
              scoreState.combo >= 50
                ? 'text-[#FF5A36] drop-shadow-[0_0_8px_rgba(255,90,54,0.6)]'
                : scoreState.combo >= 25
                ? 'text-[#3478C8]'
                : scoreState.combo >= 10
                ? 'text-[#2E9B61]'
                : 'text-[#F5F5F5]'
            }`}
          >
            {scoreState.combo}×
          </span>
        </div>

        {showAccuracy && (
          <div className="text-xs font-mono-stat text-[#909090] mt-0.5">
            ACC: <strong className="text-[#F5F5F5] font-semibold">{scoreState.accuracy.toFixed(1)}%</strong>
          </div>
        )}
      </div>
    </header>
  );
};
