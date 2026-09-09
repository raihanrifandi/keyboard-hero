'use client';

import React from 'react';
import { Note, HitFeedback } from '@/game/types';
import { TimingFeedback } from './TimingFeedback';

interface PlayfieldProps {
  notes: Note[];
  activeNoteIndex: number;
  typedLetters: string;
  isTypo: boolean;
  currentTime: number;
  approachDuration: number;
  feedbacks: HitFeedback[];
  beatPulse: boolean;
  perspective?: '3d' | '2d';
  streakTier?: number;
  comboMilestone?: { text: string; mult: number; combo: number } | null;
  onTogglePerspective?: () => void;
}

export const Playfield: React.FC<PlayfieldProps> = ({
  notes,
  activeNoteIndex,
  typedLetters,
  isTypo,
  currentTime,
  approachDuration,
  feedbacks,
  beatPulse,
  perspective = '3d',
  streakTier = 0,
  comboMilestone,
  onTogglePerspective,
}) => {
  // Hit line position from top (percentage)
  const hitLinePercent = 78;
  const is3D = perspective === '3d';

  // Filter notes that are visible within the approach window
  const visibleNotes = notes.filter((note, idx) => {
    if (idx < activeNoteIndex) return false;
    const timeDelta = note.time - currentTime;
    return timeDelta <= approachDuration && timeDelta >= -0.3;
  });

  // Guitar Hero streak highway border styling based on streakTier
  const getHighwayBorderClass = () => {
    switch (streakTier) {
      case 3:
        // 50+ ON FIRE (Guitar Hero Star Power / Fiery Highway)
        return 'border-[#FF5A36] shadow-[0_0_30px_rgba(255,90,54,0.45)] ring-1 ring-[#FF5A36]/50';
      case 2:
        // 25+ (3X Multiplier Electric Blue)
        return 'border-[#3478C8] shadow-[0_0_20px_rgba(52,120,200,0.35)] ring-1 ring-[#3478C8]/40';
      case 1:
        // 10+ (2X Multiplier Green Streak)
        return 'border-[#2E9B61] shadow-[0_0_15px_rgba(46,155,97,0.25)] ring-1 ring-[#2E9B61]/30';
      default:
        return 'border-[#343434] shadow-2xl';
    }
  };

  const getSideRailColor = () => {
    switch (streakTier) {
      case 3:
        return 'border-[#FF5A36] shadow-[0_0_12px_rgba(255,90,54,0.8)]';
      case 2:
        return 'border-[#3478C8] shadow-[0_0_8px_rgba(52,120,200,0.6)]';
      case 1:
        return 'border-[#2E9B61] shadow-[0_0_6px_rgba(46,155,97,0.5)]';
      default:
        return 'border-[#606060]';
    }
  };

  return (
    <div
      className="relative w-full max-w-2xl h-[540px] mx-auto my-auto select-none flex flex-col items-center justify-end"
      style={{
        perspective: is3D ? '650px' : 'none',
      }}
    >
      {/* Quick Perspective Toggle Button */}
      {onTogglePerspective && (
        <button
          onClick={onTogglePerspective}
          className="absolute top-2 right-4 z-40 btn-tactile px-2.5 py-1 bg-[#171717]/80 hover:bg-[#171717] text-[#909090] hover:text-[#FF5A36] text-[11px] font-mono-stat rounded border border-[#343434] cursor-pointer"
          title="Toggle between Guitar Hero 3D slanted highway and 2D flat view"
        >
          {is3D ? 'VIEW: 3D HIGHWAY' : 'VIEW: 2D FLAT'}
        </button>
      )}

      {/* GUITAR HERO COMBO MILESTONE BANNER */}
      {comboMilestone && (
        <div className="absolute top-10 z-50 pointer-events-none flex flex-col items-center animate-beat">
          <div
            className={`px-5 py-2 rounded-xl bg-[#171717]/95 border-2 font-mono-stat font-black text-lg sm:text-xl tracking-wider shadow-2xl ${
              comboMilestone.mult === 4
                ? 'border-[#FF5A36] text-[#FF5A36] shadow-[0_0_25px_rgba(255,90,54,0.6)]'
                : comboMilestone.mult === 3
                ? 'border-[#3478C8] text-[#3478C8] shadow-[0_0_20px_rgba(52,120,200,0.5)]'
                : 'border-[#2E9B61] text-[#2E9B61] shadow-[0_0_15px_rgba(46,155,97,0.4)]'
            }`}
          >
            🔥 {comboMilestone.text}
          </div>
        </div>
      )}

      {/* The Highway Board */}
      <div
        style={{
          transform: is3D ? 'rotateX(46deg)' : 'none',
          transformOrigin: '50% 90%',
          transformStyle: 'preserve-3d',
        }}
        className={`relative w-full h-[520px] bg-[#1e1e1e] rounded-xl overflow-hidden transition-all duration-300 ${getHighwayBorderClass()}`}
      >
        {/* Distant Horizon Fade (Star Wars / Guitar Hero Highway top fade) */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#171717] via-[#171717]/80 to-transparent z-10 pointer-events-none" />

        {/* Fretboard Lane Side Rails & Dividers with Streak Energy */}
        <div className="absolute inset-0 flex justify-center pointer-events-none">
          <div
            className={`w-80 border-x-2 h-full flex justify-center transition-colors duration-300 ${getSideRailColor()}`}
          >
            <div className="w-40 border-x border-dashed border-[#444444]/60 h-full" />
          </div>
        </div>

        {/* Approaching Notes */}
        {visibleNotes.map((note) => {
          const timeUntilHit = note.time - currentTime;
          const progress = Math.max(0, Math.min(1.2, 1 - timeUntilHit / approachDuration));
          const topPositionPercent = progress * hitLinePercent;

          const isTarget = note.id === notes[activeNoteIndex]?.id;
          // Scale from distance to foreground in 3D mode
          const scale = is3D ? 0.65 + progress * 0.4 : 1;
          const opacity = isTarget ? 1 : Math.max(0.3, progress * 0.8);

          return (
            <div
              key={note.id}
              style={{
                top: `${topPositionPercent}%`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity,
              }}
              className={`absolute left-1/2 transition-none flex flex-col items-center justify-center ${
                isTarget ? 'z-30' : 'z-10'
              }`}
            >
              {isTarget ? (
                // ACTIVE TARGET WORD WITH TYPING PROGRESS
                <div
                  className={`flex items-center px-4 py-1.5 rounded-lg border bg-[#171717]/95 shadow-lg ${
                    isTypo
                      ? 'border-[#D64545] text-[#D64545] animate-shake'
                      : streakTier >= 3
                      ? 'border-[#FF5A36] text-[#F5F5F5] ring-2 ring-[#FF5A36] shadow-[0_0_15px_rgba(255,90,54,0.5)]'
                      : 'border-[#FF5A36] text-[#F5F5F5] ring-1 ring-[#FF5A36]/40'
                  }`}
                >
                  {/* Already typed characters */}
                  <span className="font-mono-stat text-2xl sm:text-3xl font-black text-[#2E9B61] tracking-wider">
                    {typedLetters}
                  </span>

                  {/* Blinking cursor */}
                  <span className="w-0.5 h-7 bg-[#FF5A36] mx-0.5 animate-pulse" />

                  {/* Remaining characters to type */}
                  <span className="font-mono-stat text-2xl sm:text-3xl font-bold text-[#F5F5F5] tracking-wider">
                    {note.word.slice(typedLetters.length)}
                  </span>
                </div>
              ) : (
                // UPCOMING WORD NOTE IN DISTANCE
                <div className="px-3 py-1 rounded border border-[#343434] bg-[#282828] text-[#909090] font-mono-stat text-base sm:text-lg font-bold tracking-wider shadow-sm">
                  {note.word}
                </div>
              )}
            </div>
          );
        })}

        {/* HIT LINE */}
        <div
          style={{ top: `${hitLinePercent}%` }}
          className="absolute left-0 right-0 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center"
        >
          {/* Floating Timing Feedback (+200, PERFECT, etc.) */}
          <TimingFeedback feedbacks={feedbacks} />

          {/* The Hit Line Bar with beat pulse and Star Power flame energy */}
          <div
            className={`w-full flex items-center justify-center transition-all ${
              beatPulse ? 'scale-y-125' : 'scale-y-100'
            }`}
          >
            <div
              className={`w-full transition-all duration-200 ${
                streakTier >= 3
                  ? 'h-1.5 bg-gradient-to-r from-[#FF5A36] via-[#FFD000] to-[#FF5A36] shadow-[0_0_16px_rgba(255,90,54,0.9)]'
                  : streakTier >= 2
                  ? 'h-1 bg-[#3478C8] shadow-[0_0_10px_rgba(52,120,200,0.7)]'
                  : streakTier >= 1
                  ? 'h-1 bg-[#2E9B61] shadow-[0_0_8px_rgba(46,155,97,0.6)]'
                  : 'h-1 bg-[#FF5A36] shadow-[0_0_8px_rgba(255,90,54,0.4)]'
              }`}
            />
            <div
              className={`absolute px-3 py-0.5 rounded font-mono-stat text-[10px] font-black tracking-widest uppercase shadow transition-colors ${
                streakTier >= 3
                  ? 'bg-[#FF5A36] text-white ring-2 ring-[#FFD000]'
                  : 'bg-[#FF5A36] text-white'
              }`}
            >
              {streakTier >= 3 ? '🔥 ON FIRE' : 'HIT LINE'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
