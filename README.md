# ⌨️ Keyboard Hero

> Music sets the pace. You type the notes.

Keyboard Hero is a web-based rhythm game built around typing.

The idea is simple: instead of pressing buttons or following guitar notes, you type words that move toward a hit line. Your timing affects the score, combo, and final grade.

## Features

### Rhythm Typing

* Words move toward the hit line in sync with the music.
* Type the current word before it passes the hit window.
* 3D highway view for the main gameplay experience.
* Optional 2D view for a simpler layout.
* Real-time score, combo, and timing feedback.

### Combo System

Keeping your combo increases the score multiplier.

| Combo    | Multiplier |
| -------- | ---------: |
| 0 to 9   |         1x |
| 10 to 24 |         2x |
| 25 to 49 |         3x |
| 50+      |         4x |

The highway also changes its visual state as the combo gets higher.

### Timing & Scoring

Each note has a target time. Your input is compared against that time.

| Result  |            Timing | Score |
| ------- | ----------------: | ----: |
| PERFECT |            ±50 ms |  +200 |
| GREAT   |           ±100 ms |  +100 |
| GOOD    |           ±200 ms |   +50 |
| MISS    | More than ±200 ms |     0 |

A miss resets the current combo.

Your final performance is graded from **S** to **D**.

### Songs

Keyboard Hero comes with several built-in tracks:

| Song         | BPM | Difficulty | Style                 |
| ------------ | --: | ---------- | --------------------- |
| Neon Dreams  | 128 | Medium     | Synthwave             |
| Digital Rush | 160 | Hard       | Drum & Bass / Electro |
| Sunday Drive | 104 | Easy       | Lo-Fi Chill           |

The game also supports custom songs through audio files and chart JSON files.

### Custom Songs

There are two ways to add custom songs:

1. Load them directly from the game.
2. Add them to the project source code.

For songs loaded through the interface, the chart and song information are stored locally in the browser using `localStorage`.

### Audio

Keyboard Hero uses the **Web Audio API** to handle song timing and gameplay audio.

The game does not depend on `setInterval()` as its main gameplay clock. This helps keep note timing closer to the audio timeline.

Built-in tracks can also use procedural audio, so they do not necessarily need external audio files.

## Quick Start

### Requirements

* Node.js 18 or newer
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/raihanrifandi/keyboard-hero.git
cd keyboard-hero
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal. By default, this is usually:

```text
http://localhost:3000
```

### Production Build

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Adding Custom Songs

### From the Game

Open **SONG SELECT** and select:

```text
+ LOAD CUSTOM SONG
```

You can choose between two options:

#### Auto-Generate from Words

Provide:

* Song title
* Artist
* BPM
* Difficulty
* List of words or lyrics

The game will create a basic chart based on the provided BPM and words.

#### Upload Chart & Audio

Upload:

* `.mp3` or `.wav` audio
* `.json` chart

The chart controls when each word appears during the song.

### From the Source Code

Song charts can be added to:

```text
src/data/songs/
```

Example:

```json
{
  "song": {
    "id": "my-track",
    "title": "My Track Title",
    "artist": "Artist Name",
    "bpm": 128,
    "duration": 120,
    "difficulty": "medium",
    "audioUrl": "/songs/my-track/audio.mp3"
  },
  "notes": [
    {
      "id": "001",
      "time": 1.5,
      "word": "tempo"
    },
    {
      "id": "002",
      "time": 3.0,
      "word": "rhythm"
    },
    {
      "id": "003",
      "time": 4.5,
      "word": "groove"
    }
  ]
}
```

The `time` value represents when the note should be hit, measured in seconds from the beginning of the song.

## Controls

| Key         | Action                      |
| ----------- | --------------------------- |
| `A-Z`       | Type the current word       |
| `Backspace` | Delete the last character   |
| `Escape`    | Pause or resume the game    |
| `Mouse`     | Navigate menus and settings |

## Tech Stack

* **Next.js 16** with App Router
* **React 19**
* **TypeScript**
* **Tailwind CSS v4**
* **CSS 3D Transforms**
* **Web Audio API**
* **localStorage**

## Design

Keyboard Hero has two main interface modes.

### Menu

The menu uses a warm off-white background with a simple editorial-inspired layout.

### Gameplay

The gameplay screen switches to a dark interface so the highway, notes, timing feedback, and score remain the main focus.

The UI intentionally keeps things simple. It avoids excessive cards, unnecessary gradients, and decorative elements that do not contribute to the game.

## Project Status

Keyboard Hero is currently a portfolio and side project.

The project focuses on the core rhythm typing experience, including:

* Rhythm-based typing
* Note timing
* Combo and scoring
* 3D and 2D gameplay views
* Built-in songs
* Custom song charts
* Browser-based song storage

More features may be added as development continues.

## License

Keyboard Hero is an open portfolio and side project.

Feel free to use the project as a reference, experiment with the code, or build your own version.
