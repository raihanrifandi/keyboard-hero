'use client';

import React, { useState } from 'react';
import { SongChart, Difficulty } from '@/game/types';
import { createCustomChart } from '@/data/songs';

interface CustomSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSongCreated: (chart: SongChart) => void;
}

export const CustomSongModal: React.FC<CustomSongModalProps> = ({
  isOpen,
  onClose,
  onSongCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');

  // Text generator state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [bpm, setBpm] = useState(128);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [wordsText, setWordsText] = useState(
    'rhythm tempo pulse beat drive melody speed focus groove energy power sync stage flow strike'
  );

  // File import state
  const [jsonError, setJsonError] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [audioFileName, setAudioFileName] = useState('');

  if (!isOpen) return null;

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFileName(file.name);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  const handleJsonChartUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.song || !parsed.notes || !Array.isArray(parsed.notes)) {
          throw new Error('Invalid chart schema. Must contain song metadata and notes array.');
        }

        const customChart: SongChart = {
          song: {
            ...parsed.song,
            audioUrl: audioUrl || parsed.song.audioUrl,
            isCustom: true,
          },
          notes: parsed.notes,
        };

        onSongCreated(customChart);
        onClose();
      } catch (err: unknown) {
        setJsonError(err instanceof Error ? err.message : 'Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleCreateFromText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide a song title');
      return;
    }

    const chart = createCustomChart(
      title.trim(),
      artist.trim() || 'Custom Artist',
      Number(bpm) || 120,
      difficulty,
      wordsText,
      audioUrl
    );

    onSongCreated(chart);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl bg-white border border-[#D6D1C7] rounded-xl shadow-lg p-6 text-[#171717]">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#D6D1C7]">
          <div>
            <h2 className="text-xl font-bold tracking-tight">ADD CUSTOM SONG</h2>
            <p className="text-xs text-[#6B6861] font-mono-stat mt-0.5">
              Play your own tracks & customized word charts
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xl text-[#6B6861] hover:text-[#171717] px-2 py-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#D6D1C7] my-4">
          <button
            onClick={() => setActiveTab('text')}
            className={`pb-2 px-4 text-sm font-semibold border-b-2 cursor-pointer ${
              activeTab === 'text'
                ? 'border-[#FF5A36] text-[#FF5A36]'
                : 'border-transparent text-[#6B6861] hover:text-[#171717]'
            }`}
          >
            Auto-Generate from Words
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`pb-2 px-4 text-sm font-semibold border-b-2 cursor-pointer ${
              activeTab === 'file'
                ? 'border-[#FF5A36] text-[#FF5A36]'
                : 'border-transparent text-[#6B6861] hover:text-[#171717]'
            }`}
          >
            Upload Chart JSON & Audio
          </button>
        </div>

        {/* Optional Audio File Upload */}
        <div className="mb-4 p-3 bg-[#F4F1EA] rounded-lg border border-[#D6D1C7]">
          <label className="block text-xs font-semibold text-[#171717] mb-1">
            Optional Audio Track (.mp3, .wav, .ogg)
          </label>
          <p className="text-xs text-[#6B6861] mb-2">
            Leave empty to use built-in procedural synthesizer for rhythmic playback.
          </p>
          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="text-xs text-[#171717] file:mr-3 file:py-1 file:px-3 file:rounded file:border file:border-[#D6D1C7] file:text-xs file:bg-white file:cursor-pointer"
          />
          {audioFileName && (
            <p className="text-xs font-mono-stat text-[#2E9B61] mt-1.5">
              ✓ Loaded audio: {audioFileName}
            </p>
          )}
        </div>

        {activeTab === 'text' ? (
          <form onSubmit={handleCreateFromText} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Song Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. My Favorite Song"
                  required
                  className="w-full px-3 py-2 text-sm border border-[#D6D1C7] rounded-lg focus:outline-none focus:border-[#FF5A36]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. Band or Singer"
                  className="w-full px-3 py-2 text-sm border border-[#D6D1C7] rounded-lg focus:outline-none focus:border-[#FF5A36]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Tempo (BPM)
                </label>
                <input
                  type="number"
                  min="60"
                  max="240"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-[#D6D1C7] rounded-lg font-mono-stat focus:outline-none focus:border-[#FF5A36]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full px-3 py-2 text-sm border border-[#D6D1C7] rounded-lg bg-white focus:outline-none focus:border-[#FF5A36]"
                >
                  <option value="easy">Easy (Relaxed timing)</option>
                  <option value="medium">Medium (Moderate pace)</option>
                  <option value="hard">Hard (Rapid notes)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Word List / Lyrics
              </label>
              <textarea
                value={wordsText}
                onChange={(e) => setWordsText(e.target.value)}
                rows={4}
                placeholder="Type or paste words separated by spaces..."
                className="w-full px-3 py-2 text-sm border border-[#D6D1C7] rounded-lg font-mono-stat focus:outline-none focus:border-[#FF5A36]"
              />
              <p className="text-[11px] text-[#6B6861] mt-1">
                The engine will automatically space each word according to the song BPM.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#D6D1C7]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-[#6B6861] hover:text-[#171717] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-tactile px-5 py-2 text-sm font-semibold bg-[#FF5A36] text-white rounded-lg hover:bg-[#E84E2B] cursor-pointer"
              >
                Create & Add Song
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Select Chart JSON File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleJsonChartUpload}
                className="text-xs text-[#171717] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-[#D6D1C7] file:text-xs file:bg-[#F4F1EA] file:cursor-pointer"
              />
              {jsonError && (
                <p className="text-xs font-mono-stat text-[#D64545] mt-1.5">
                  ✕ {jsonError}
                </p>
              )}
            </div>

            <div className="bg-[#F4F1EA] p-3 rounded-lg border border-[#D6D1C7] text-xs font-mono-stat">
              <p className="font-semibold text-[#171717] mb-1">JSON Format Schema:</p>
              <pre className="text-[11px] text-[#6B6861] overflow-x-auto">
{`{
  "song": {
    "id": "my-song",
    "title": "Song Title",
    "artist": "Artist",
    "bpm": 128,
    "duration": 120,
    "difficulty": "medium"
  },
  "notes": [
    { "id": "1", "time": 2.0, "word": "groove" }
  ]
}`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
