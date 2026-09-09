'use client';

import React from 'react';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  onResume,
  onRestart,
  onExit,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-[#202020] border border-[#343434] rounded-xl p-8 text-center shadow-2xl">
        <h2 className="text-3xl font-black font-mono-stat tracking-widest text-[#F5F5F5] mb-2">
          PAUSED
        </h2>
        <p className="text-xs font-mono-stat text-[#909090] mb-8">
          Game halted. Press ESC or Resume to continue.
        </p>

        <div className="space-y-3">
          <button
            onClick={onResume}
            className="btn-tactile w-full py-3 px-6 bg-[#FF5A36] hover:bg-[#E84E2B] text-white font-bold text-sm rounded-lg border-b-2 border-[#C93B1B] cursor-pointer"
          >
            RESUME
          </button>
          <button
            onClick={onRestart}
            className="btn-tactile w-full py-3 px-6 bg-[#282828] hover:bg-[#343434] text-[#F5F5F5] font-semibold text-sm rounded-lg border border-[#444444] cursor-pointer"
          >
            RESTART
          </button>
          <button
            onClick={onExit}
            className="btn-tactile w-full py-3 px-6 bg-transparent hover:bg-[#282828] text-[#909090] hover:text-[#F5F5F5] font-semibold text-sm rounded-lg border border-[#343434] cursor-pointer"
          >
            SONG SELECT
          </button>
        </div>
      </div>
    </div>
  );
};
