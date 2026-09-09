'use client';

import React from 'react';
import { HitFeedback } from '@/game/types';

interface TimingFeedbackProps {
  feedbacks: HitFeedback[];
}

export const TimingFeedback: React.FC<TimingFeedbackProps> = ({ feedbacks }) => {
  if (feedbacks.length === 0) return null;

  // Render the most recent feedback
  const latest = feedbacks[feedbacks.length - 1];

  const getColorClass = (rating: string) => {
    switch (rating) {
      case 'perfect':
        return 'text-[#2E9B61]';
      case 'great':
        return 'text-[#3478C8]';
      case 'good':
        return 'text-[#C58A24]';
      case 'miss':
      default:
        return 'text-[#D64545]';
    }
  };

  return (
    <div className="absolute left-1/2 -translate-x-1/2 -top-14 pointer-events-none flex flex-col items-center">
      <div
        key={latest.id}
        className={`font-mono-stat font-black text-xl sm:text-2xl tracking-wider uppercase animate-beat ${getColorClass(
          latest.rating
        )}`}
      >
        {latest.rating}
      </div>
      {latest.rating !== 'miss' && (
        <span className="text-xs font-mono-stat text-[#909090] mt-0.5">
          +{latest.scoreBonus} ({latest.deltaMs > 0 ? `+${latest.deltaMs}` : latest.deltaMs}ms)
        </span>
      )}
    </div>
  );
};
