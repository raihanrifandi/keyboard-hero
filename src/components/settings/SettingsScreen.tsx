'use client';

import React from 'react';
import { GameSettings } from '@/game/types';
import { DEFAULT_SETTINGS } from '@/game/StorageManager';
import { audioEngine } from '@/game/AudioEngine';

interface SettingsScreenProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const handleMusicVolumeChange = (vol: number) => {
    onUpdateSettings({ ...settings, musicVolume: vol });
    audioEngine?.setMusicVolume(vol);
  };

  const handleSfxVolumeChange = (vol: number) => {
    onUpdateSettings({ ...settings, sfxVolume: vol });
    audioEngine?.setSfxVolume(vol);
    audioEngine?.playHitSfx('perfect');
  };

  const handleReset = () => {
    onUpdateSettings(DEFAULT_SETTINGS);
    audioEngine?.setMusicVolume(DEFAULT_SETTINGS.musicVolume);
    audioEngine?.setSfxVolume(DEFAULT_SETTINGS.sfxVolume);
  };

  return (
    <main className="min-h-screen flex flex-col justify-between items-center px-6 py-10 bg-[#F4F1EA] text-[#171717] select-none">
      {/* Top Header */}
      <header className="w-full max-w-xl flex justify-between items-center pb-4 border-b border-[#D6D1C7]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="btn-tactile px-3 py-1.5 text-xs font-semibold text-[#6B6861] hover:text-[#171717] bg-white border border-[#D6D1C7] rounded cursor-pointer"
          >
            ← BACK
          </button>
          <h1 className="text-xl font-bold tracking-tight text-[#171717]">
            SETTINGS
          </h1>
        </div>

        <button
          onClick={handleReset}
          className="text-xs font-mono-stat text-[#6B6861] hover:text-[#D64545] cursor-pointer"
        >
          RESET DEFAULTS
        </button>
      </header>

      {/* Main Settings Sections */}
      <div className="w-full max-w-xl my-auto py-6 space-y-8">
        {/* Audio Section */}
        <section className="bg-white p-6 rounded-xl border border-[#D6D1C7] shadow-xs space-y-4">
          <h2 className="text-xs font-mono-stat font-bold uppercase tracking-wider text-[#6B6861]">
            AUDIO
          </h2>

          <div className="space-y-3 font-mono-stat text-sm">
            <div className="flex justify-between items-center">
              <span>Music Volume</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
                  className="w-32 accent-[#FF5A36] cursor-pointer"
                />
                <span className="w-8 text-right font-bold text-xs">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span>SFX Volume</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => handleSfxVolumeChange(parseFloat(e.target.value))}
                  className="w-32 accent-[#FF5A36] cursor-pointer"
                />
                <span className="w-8 text-right font-bold text-xs">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Gameplay Section */}
        <section className="bg-white p-6 rounded-xl border border-[#D6D1C7] shadow-xs space-y-4">
          <h2 className="text-xs font-mono-stat font-bold uppercase tracking-wider text-[#6B6861]">
            GAMEPLAY & HUD
          </h2>

          <div className="space-y-4 font-mono-stat text-sm">
            <div className="flex justify-between items-center">
              <div>
                <span>Note Speed</span>
                <p className="text-[11px] text-[#6B6861]">Controls approach timeline velocity</p>
              </div>
              <div className="flex gap-1 bg-[#F4F1EA] p-1 rounded-lg border border-[#D6D1C7]">
                {(['slow', 'normal', 'fast'] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => onUpdateSettings({ ...settings, noteSpeed: speed })}
                    className={`px-3 py-1 text-xs font-bold uppercase rounded cursor-pointer ${
                      settings.noteSpeed === speed
                        ? 'bg-[#FF5A36] text-white shadow-xs'
                        : 'text-[#6B6861] hover:text-[#171717]'
                    }`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#D6D1C7]">
              <div>
                <span>Highway Perspective</span>
                <p className="text-[11px] text-[#6B6861]">Guitar Hero 3D slanted track vs 2D flat</p>
              </div>
              <div className="flex gap-1 bg-[#F4F1EA] p-1 rounded-lg border border-[#D6D1C7]">
                <button
                  onClick={() => onUpdateSettings({ ...settings, highwayPerspective: '3d' })}
                  className={`px-3 py-1 text-xs font-bold uppercase rounded cursor-pointer ${
                    settings.highwayPerspective === '3d'
                      ? 'bg-[#FF5A36] text-white shadow-xs'
                      : 'text-[#6B6861] hover:text-[#171717]'
                  }`}
                >
                  3D Guitar Hero
                </button>
                <button
                  onClick={() => onUpdateSettings({ ...settings, highwayPerspective: '2d' })}
                  className={`px-3 py-1 text-xs font-bold uppercase rounded cursor-pointer ${
                    settings.highwayPerspective === '2d'
                      ? 'bg-[#FF5A36] text-white shadow-xs'
                      : 'text-[#6B6861] hover:text-[#171717]'
                  }`}
                >
                  2D Flat
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#D6D1C7]">
              <span>Show Real-Time WPM</span>
              <button
                onClick={() => onUpdateSettings({ ...settings, showWpm: !settings.showWpm })}
                className={`px-3 py-1 text-xs font-bold rounded border cursor-pointer ${
                  settings.showWpm
                    ? 'bg-[#2E9B61]/10 text-[#2E9B61] border-[#2E9B61]'
                    : 'bg-neutral-100 text-[#6B6861] border-neutral-300'
                }`}
              >
                {settings.showWpm ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#D6D1C7]">
              <span>Show Accuracy</span>
              <button
                onClick={() =>
                  onUpdateSettings({ ...settings, showAccuracy: !settings.showAccuracy })
                }
                className={`px-3 py-1 text-xs font-bold rounded border cursor-pointer ${
                  settings.showAccuracy
                    ? 'bg-[#2E9B61]/10 text-[#2E9B61] border-[#2E9B61]'
                    : 'bg-neutral-100 text-[#6B6861] border-neutral-300'
                }`}
              >
                {settings.showAccuracy ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </section>

        {/* Display & Accessibility */}
        <section className="bg-white p-6 rounded-xl border border-[#D6D1C7] shadow-xs space-y-4">
          <h2 className="text-xs font-mono-stat font-bold uppercase tracking-wider text-[#6B6861]">
            ACCESSIBILITY
          </h2>

          <div className="flex justify-between items-center font-mono-stat text-sm">
            <div>
              <span>Reduced Motion</span>
              <p className="text-[11px] text-[#6B6861]">
                Disables beat pulses and shake animations
              </p>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion })
              }
              className={`px-3 py-1 text-xs font-bold rounded border cursor-pointer ${
                settings.reducedMotion
                  ? 'bg-[#2E9B61]/10 text-[#2E9B61] border-[#2E9B61]'
                  : 'bg-neutral-100 text-[#6B6861] border-neutral-300'
              }`}
            >
              {settings.reducedMotion ? 'ON' : 'OFF'}
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-xl text-center pt-4 border-t border-[#D6D1C7]">
        <button
          onClick={onBack}
          className="btn-tactile w-full py-3 px-6 bg-[#FF5A36] hover:bg-[#E84E2B] text-white font-bold text-sm rounded-lg border-b-2 border-[#C93B1B] cursor-pointer"
        >
          SAVE & RETURN
        </button>
      </footer>
    </main>
  );
};
