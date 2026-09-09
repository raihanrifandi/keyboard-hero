import { Note, SongChart } from '@/game/types';

export const BUILT_IN_SONGS: SongChart[] = [
  {
    song: {
      id: 'neon-dreams',
      title: 'Neon Dreams',
      artist: 'TypeBeat',
      bpm: 128,
      duration: 62,
      difficulty: 'medium',
      genre: 'Synthwave',
    },
    notes: createChartNotes(128, [
      'neon', 'dreams', 'city', 'lights', 'running',
      'future', 'signal', 'midnight', 'echo', 'pulse',
      'cyber', 'rhythm', 'motion', 'stream', 'laser',
      'arcade', 'tempo', 'vector', 'horizon', 'shadow',
      'drive', 'circuit', 'digital', 'analog', 'electric',
      'power', 'groove', 'vibe', 'static', 'glide',
      'matrix', 'synth', 'speed', 'wave', 'focus', 'climax'
    ], 2.0, 4), // start at 2.0s, spaced every 4 beats
  },
  {
    song: {
      id: 'digital-rush',
      title: 'Digital Rush',
      artist: 'Kernel Panic',
      bpm: 160,
      duration: 58,
      difficulty: 'hard',
      genre: 'Drum & Bass',
    },
    notes: createChartNotes(160, [
      'speed', 'binary', 'terminal', 'system', 'command',
      'process', 'thread', 'memory', 'compile', 'execute',
      'network', 'packet', 'socket', 'daemon', 'server',
      'cluster', 'payload', 'kernel', 'gateway', 'cipher',
      'buffer', 'matrix', 'vector', 'syntax', 'runtime',
      'dynamic', 'compute', 'quantum', 'driver', 'routine',
      'pipeline', 'segment', 'address', 'override', 'protocol', 'finish'
    ], 1.5, 3), // rapid pace, every 3 beats at 160 BPM
  },
  {
    song: {
      id: 'sunday-drive',
      title: 'Sunday Drive',
      artist: 'Lo-Fi Chillers',
      bpm: 104,
      duration: 65,
      difficulty: 'easy',
      genre: 'Lo-Fi Chill',
    },
    notes: createChartNotes(104, [
      'sun', 'sky', 'road', 'calm', 'warm',
      'breeze', 'drive', 'miles', 'peace', 'soft',
      'music', 'radio', 'slow', 'trees', 'green',
      'cloud', 'light', 'blue', 'home', 'cozy',
      'smile', 'rest', 'sweet', 'dream', 'quiet',
      'easy', 'walk', 'pure'
    ], 2.5, 4), // relaxed pace, every 4 beats at 104 BPM
  },
];

/**
 * Generates note timing for a word list based on BPM and spacing.
 */
function createChartNotes(bpm: number, words: string[], startDelaySeconds: number, beatsPerWord: number): Note[] {
  const secondsPerBeat = 60 / bpm;
  return words.map((word, index) => {
    const time = parseFloat((startDelaySeconds + index * beatsPerWord * secondsPerBeat).toFixed(2));
    return {
      id: `note_${index + 1}`,
      time,
      word: word.toLowerCase(),
      duration: parseFloat((beatsPerWord * secondsPerBeat * 0.8).toFixed(2)),
    };
  });
}

/**
 * Creates a custom song chart from user input (audio file / text)
 */
export function createCustomChart(
  title: string,
  artist: string,
  bpm: number,
  difficulty: 'easy' | 'medium' | 'hard',
  rawWords: string,
  audioUrl?: string
): SongChart {
  const words = rawWords
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 0);

  const cleanWords = words.length > 0 ? words : ['type', 'rhythm', 'beat', 'music', 'hero'];
  const beatsPerWord = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 3 : 2;
  const startDelay = 2.0;
  const notes = createChartNotes(bpm, cleanWords, startDelay, beatsPerWord);
  const lastNote = notes[notes.length - 1];
  const duration = Math.ceil(lastNote.time + 4);

  const cleanId = `custom_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;

  return {
    song: {
      id: cleanId,
      title: title || 'Custom Track',
      artist: artist || 'Local Artist',
      bpm: bpm || 120,
      duration,
      difficulty,
      genre: 'Custom',
      audioUrl,
      isCustom: true,
    },
    notes,
  };
}
