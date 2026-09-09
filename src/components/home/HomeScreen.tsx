'use client';

import React from 'react';

interface HomeScreenProps {
  onPlay: () => void;
  onSongs: () => void;
  onSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPlay,
  onSongs,
  onSettings,
}) => {
  return (
    <main className="min-h-screen flex flex-col justify-between items-center px-6 py-12 bg-[#F4F1EA] text-[#171717] select-none">
      {/* Top Brand Bar */}
      <header className="w-full max-w-4xl flex justify-between items-center text-xs tracking-widest uppercase text-[#6B6861] font-mono-stat">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-[#FF5A36]"></span>
          <span>KEYBOARD HERO</span>
        </div>
        <div>VER 1.0 • PHASE 1 MVP</div>
      </header>

      {/* Hero Title & Identity */}
      <div className="flex flex-col items-center text-center my-auto max-w-2xl">
        <div className="text-4xl mb-4 text-[#FF5A36] select-none" aria-hidden="true">
          ⌨ ★
        </div>
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none text-[#171717]">
          KEYBOARD<br />
          <span className="text-[#FF5A36]">HERO</span>
        </h1>
        <p className="mt-6 text-sm sm:text-base font-mono-stat tracking-widest text-[#6B6861] uppercase">
          Music determines when you type. Typing determines your score.
        </p>

        {/* Primary CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onPlay}
            className="btn-tactile w-48 py-3.5 px-8 bg-[#FF5A36] hover:bg-[#E84E2B] text-white font-semibold text-base rounded-lg border-b-2 border-[#C93B1B] shadow-sm cursor-pointer"
          >
            PLAY NOW
          </button>
          <button
            onClick={onSongs}
            className="btn-tactile w-48 py-3.5 px-8 bg-white hover:bg-[#EAE7DF] text-[#171717] font-semibold text-base rounded-lg border border-[#D6D1C7] shadow-sm cursor-pointer"
          >
            SONGS
          </button>
        </div>

        {/* Secondary Navigation */}
        <div className="mt-8 flex items-center gap-6 text-sm text-[#6B6861]">
          <button
            onClick={onSettings}
            className="hover:text-[#171717] underline underline-offset-4 cursor-pointer"
          >
            Settings
          </button>
          <span>•</span>
          <span className="font-mono-stat text-xs">Desktop Keyboard Only</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl text-center text-xs text-[#6B6861] font-mono-stat">
        <p>Built for tactile rhythm typing. No login required.</p>
      </footer>
    </main>
  );
};
