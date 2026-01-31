import './styles.css'
import type { GameState } from './game/types.ts'
import {
  createInitialState,
  startGame,
  step,
  setQueuedDirection,
  togglePause,
} from './game/engine.ts'
import { render } from './game/render.ts'
import { attachInputHandlers } from './game/input.ts'
import { getHighScore, setHighScore } from './game/storage.ts'
import {
  GRID_W,
  GRID_H,
  COLOR_BG,
  COLOR_SNAKE,
  COLOR_FOOD,
  COLOR_TEXT,
} from './game/config.ts'

const GAME_WIDTH = 320
const GAME_HEIGHT = 320

/** Max game steps per frame to avoid spiral of death when tab was backgrounded. */
const MAX_STEPS_PER_FRAME = 5

const app = document.querySelector<HTMLDivElement>('#app')!
const shell = document.createElement('div')
shell.className = 'game-shell'

const hud = document.createElement('div')
hud.className = 'hud'

const scoreEl = document.createElement('span')
scoreEl.className = 'score'
scoreEl.textContent = 'Score: 0'

const highEl = document.createElement('span')
highEl.className = 'high'
highEl.textContent = 'High: 0'

const instructionsEl = document.createElement('div')
instructionsEl.className = 'instructions'
instructionsEl.textContent = 'Arrow keys / WASD — Space: Pause, R: Restart'

hud.append(scoreEl, highEl, instructionsEl)

const canvas = document.createElement('canvas')
canvas.id = 'game-canvas'
canvas.width = GAME_WIDTH
canvas.height = GAME_HEIGHT

shell.append(hud, canvas)
app.append(shell)

const ctx = canvas.getContext('2d')!
const renderConfig = {
  GRID_W,
  GRID_H,
  COLOR_BG,
  COLOR_SNAKE,
  COLOR_FOOD,
  COLOR_TEXT,
}

let state: GameState = createInitialState(getHighScore())
let lastTime = 0
let accumulator = 0
let lastMode: GameState['mode'] = state.mode

function loop(now: number): void {
  const dt = lastTime === 0 ? 0 : (now - lastTime) / 1000
  lastTime = now

  if (state.mode === 'playing') {
    accumulator += dt
    const stepDuration = 1 / state.tickRate
    let steps = 0
    while (accumulator >= stepDuration && steps < MAX_STEPS_PER_FRAME) {
      state = step(state)
      accumulator -= stepDuration
      steps++
    }
  }

  render(ctx, state, renderConfig, canvas.width, canvas.height)
  scoreEl.textContent = `Score: ${state.score}`
  highEl.textContent = `High: ${state.highScore}`

  if (state.mode === 'gameover' && lastMode !== 'gameover') {
    setHighScore(state.highScore)
  }
  lastMode = state.mode

  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)

attachInputHandlers(shell, {
  onDirection(dir) {
    state = setQueuedDirection(state, dir)
  },
  onStart() {
    if (state.mode === 'start' || state.mode === 'gameover') {
      state = startGame(state)
    }
  },
  onRestart() {
    state = startGame(state)
  },
  onPause() {
    if (state.mode === 'playing' || state.mode === 'paused') {
      state = togglePause(state)
    }
  },
})
