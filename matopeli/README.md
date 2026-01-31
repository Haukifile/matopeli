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

## Target controls

| Action   | Key(s)                    | Touch              |
| -------- | ------------------------- | ------------------ |
| Move     | Arrow keys or WASD        | On-screen D-pad    |
| Pause    | Space (when playing)      | —                  |
| Restart  | R (any mode)              | —                  |
| Start    | Enter (start screen or game over) | —          |

Movement does not allow instant reverse (e.g. moving right you cannot go left in one step). On mobile, use the D-pad buttons below the canvas.

## CHANGELOG

- **Input and game loop**: Input module (`src/game/input.ts`) with `attachInputHandlers(element, callbacks)` returning a cleanup function. Keyboard: Arrow/WASD for direction, Enter to start or restart from game over, Space to toggle pause (when playing/paused), R to restart from any mode. On-screen D-pad for touch. Main loop integrated: tick-based step, render, HUD update, high score persisted to localStorage on game over.
- **Initial app shell**: Centered canvas with “Press Enter to Start” placeholder, HUD for score/high score and instructions, Nokia/retro LCD styling, crisp pixel scaling. No game logic yet.
