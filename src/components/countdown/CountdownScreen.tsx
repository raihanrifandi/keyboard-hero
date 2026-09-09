'use client';

import React, { useEffect, useState } from 'react';
import { SongChart } from '@/game/types';
import { audioEngine } from '@/game/AudioEngine';

interface CountdownScreenProps {
  chart: SongChart;
  onCountdownComplete: () => void;
}

export const CountdownScreen: React.FC<CountdownScreenProps> = ({
  chart,
  onCountdownComplete,
}) => {
  const [count, setCount] = useState<number | string>(3);

  useEffect(() => {
    // Initial sound
    audioEngine?.playCountdownTick(false);

    const timer1 = setTimeout(() => {
      setCount(2);
      audioEngine?.playCountdownTick(false);
    }, 800);

    const timer2 = setTimeout(() => {
      setCount(1);
      audioEngine?.playCountdownTick(false);
    }, 1600);

    const timer3 = setTimeout(() => {
      setCount('GO!');
      audioEngine?.playCountdownTick(true);
    }, 2400);

    const timer4 = setTimeout(() => {
      onCountdownComplete();
    }, 3100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onCountdownComplete]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#171717] text-[#F5F5F5] select-none">
      <div className="text-center mb-8">
        <p className="text-xs font-mono-stat tracking-widest text-[#6B6861] uppercase">
          READY YOUR KEYBOARD
        </p>
        <h2 className="text-2xl font-bold text-[#F5F5F5] mt-1">
          {chart.song.title}
        </h2>
        <p className="text-xs text-[#909090] font-mono-stat mt-0.5">
          {chart.song.bpm} BPM • {chart.song.difficulty.toUpperCase()}
        </p>
      </div>

      <div className="h-32 flex items-center justify-center">
        <div
          key={String(count)}
          className="text-8xl sm:text-9xl font-black font-mono-stat tracking-tight text-[#FF5A36] animate-beat"
        >
          {count}
        </div>
      </div>

      <p className="text-xs font-mono-stat text-[#6B6861] mt-12">
        ESC to pause anytime
      </p>
    </div>
  );
};
