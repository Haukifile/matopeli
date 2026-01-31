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
const HIGH_SCORE_KEY = 'matopeli-highscore'

function getStoredHighScore(): number {
  const s = localStorage.getItem(HIGH_SCORE_KEY)
  if (s === null) return 0
  const n = parseInt(s, 10)
  return Number.isNaN(n) ? 0 : n
}

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

let state: GameState = createInitialState(getStoredHighScore())
let scheduledTickRate = state.tickRate
let intervalId: ReturnType<typeof setInterval>

function tick(): void {
  if (state.mode === 'playing') {
    state = step(state)
  }
  render(ctx, state, renderConfig, canvas.width, canvas.height)
  scoreEl.textContent = `Score: ${state.score}`
  highEl.textContent = `High: ${state.highScore}`
  if (state.mode === 'gameover') {
    localStorage.setItem(HIGH_SCORE_KEY, String(state.highScore))
  }
  if (state.tickRate !== scheduledTickRate) {
    scheduledTickRate = state.tickRate
    clearInterval(intervalId)
    intervalId = setInterval(tick, 1000 / state.tickRate)
  }
}

function rescheduleTick(): void {
  clearInterval(intervalId)
  scheduledTickRate = state.tickRate
  intervalId = setInterval(tick, 1000 / state.tickRate)
}

rescheduleTick()
tick()

attachInputHandlers(shell, {
  onDirection(dir) {
    state = setQueuedDirection(state, dir)
  },
  onStart() {
    if (state.mode === 'start' || state.mode === 'gameover') {
      state = startGame(state)
      rescheduleTick()
    }
  },
  onRestart() {
    state = startGame(state)
    rescheduleTick()
  },
  onPause() {
    if (state.mode === 'playing' || state.mode === 'paused') {
      state = togglePause(state)
    }
  },
})
