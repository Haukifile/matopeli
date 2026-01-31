# Matopeli

Nokia-style Snake game — browser-playable, single-page static app.

## Run dev server

```bash
npm install
npm run dev
```

Then open the URL shown (e.g. http://localhost:5173).

**Build and preview:**

```bash
npm run build
npm run preview
```

## Controls

| Action   | Key(s)                    | Touch              |
| -------- | ------------------------- | ------------------ |
| Move     | Arrow keys or WASD        | On-screen D-pad    |
| Pause    | Space (when playing)      | —                  |
| Restart  | R (any mode)              | —                  |
| Start    | Enter (start screen or game over) | —          |

Movement does not allow instant reverse (e.g. moving right you cannot go left in one step). On mobile, use the D-pad buttons below the canvas.

## Scoring and speed

- **Score**: One point per food eaten. Score and high score are shown in the HUD.
- **Speed**: Game runs at a fixed tick rate (ticks per second). Every 5 foods eaten, the tick rate increases by 1, from 8 TPS up to a maximum of 20 TPS (see `INITIAL_TICK_RATE`, `SPEEDUP_EVERY`, `MAX_TICK_RATE` in `src/game/config.ts`).
- **High score**: Stored in `localStorage` and restored when you return. Persisted when you game over.

## CHANGELOG

- **Game loop (rAF + accumulator)**: Main loop now uses `requestAnimationFrame` with a fixed-timestep accumulator; game ticks only when mode is playing, at a rate given by `state.tickRate`. High score is persisted via `src/game/storage.ts` (read on init, written once on game over).
- **Input and game loop**: Input module (`src/game/input.ts`) with `attachInputHandlers(element, callbacks)` returning a cleanup function. Keyboard: Arrow/WASD for direction, Enter to start or restart from game over, Space to toggle pause (when playing/paused), R to restart from any mode. On-screen D-pad for touch. Main loop integrated: tick-based step, render, HUD update, high score persisted to localStorage on game over.
- **Initial app shell**: Centered canvas with “Press Enter to Start” placeholder, HUD for score/high score and instructions, Nokia/retro LCD styling, crisp pixel scaling. No game logic yet.
