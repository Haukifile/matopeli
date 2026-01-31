import './styles.css'
import type { GameState } from './game/types.ts'
import {
  createInitialState,
  startGame,
  step,
  setQueuedDirection,
  togglePause,
  toggleAiMode,
} from './game/engine.ts'
import { chooseDirection } from './game/ai.ts'
import { render } from './game/render.ts'
import { attachInputHandlers } from './game/input.ts'
import {
  getHighScore,
  setHighScore,
  getTheme,
  setTheme,
  getLeaderboard,
  addLeaderboardEntry,
} from './game/storage.ts'
import {
  GRID_W,
  GRID_H,
  getThemeColors,
  type ThemeId,
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

const aiLabel = document.createElement('span')
aiLabel.className = 'ai-label'

const aiBtn = document.createElement('button')
aiBtn.type = 'button'
aiBtn.className = 'ai-toggle'
aiBtn.setAttribute('aria-label', 'Kytke AI-demo päälle tai pois')

const themeBtn = document.createElement('button')
themeBtn.type = 'button'
themeBtn.className = 'theme-toggle'
themeBtn.setAttribute('aria-label', 'Vaihda väriteema')

hud.append(scoreEl, highEl, aiLabel, aiBtn, themeBtn, instructionsEl)

const canvas = document.createElement('canvas')
canvas.id = 'game-canvas'
canvas.width = GAME_WIDTH
canvas.height = GAME_HEIGHT

const deviceFrame = document.createElement('div')
deviceFrame.className = 'device-frame'
deviceFrame.appendChild(canvas)

const actionButtons = document.createElement('div')
actionButtons.className = 'action-buttons'
actionButtons.setAttribute('aria-label', 'Game actions')

const startBtn = document.createElement('button')
startBtn.type = 'button'
startBtn.className = 'action-btn action-btn-start'
startBtn.textContent = 'Start'
startBtn.setAttribute('aria-label', 'Start game')

const restartBtn = document.createElement('button')
restartBtn.type = 'button'
restartBtn.className = 'action-btn action-btn-restart'
restartBtn.textContent = 'Restart'
restartBtn.setAttribute('aria-label', 'Restart game')

const leaderboardBtn = document.createElement('button')
leaderboardBtn.type = 'button'
leaderboardBtn.className = 'action-btn action-btn-leaderboard'
leaderboardBtn.textContent = 'Pistelista'
leaderboardBtn.setAttribute('aria-label', 'Näytä pistelista')

actionButtons.append(startBtn, restartBtn, leaderboardBtn)

const controlsFooter = document.createElement('div')
controlsFooter.className = 'controls-footer'
controlsFooter.textContent =
  'Arrows / WASD · I: AI demo · Space: Pause · R: Restart · Enter: Start'

const leaderboardView = document.createElement('div')
leaderboardView.className = 'leaderboard-view'
leaderboardView.setAttribute('aria-label', 'Pistelista')
const leaderboardTitle = document.createElement('h2')
leaderboardTitle.className = 'leaderboard-title'
leaderboardTitle.textContent = 'Top 10'
const leaderboardList = document.createElement('ol')
leaderboardList.className = 'leaderboard-list'
const leaderboardBackBtn = document.createElement('button')
leaderboardBackBtn.type = 'button'
leaderboardBackBtn.className = 'action-btn action-btn-back'
leaderboardBackBtn.textContent = 'Takaisin'
leaderboardBackBtn.setAttribute('aria-label', 'Takaisin peliin')
leaderboardView.append(leaderboardTitle, leaderboardList, leaderboardBackBtn)

const nameFormContainer = document.createElement('div')
nameFormContainer.className = 'name-form-container'
nameFormContainer.setAttribute('aria-label', 'Syötä nimesi pistelistaan')
const nameFormLabel = document.createElement('label')
nameFormLabel.className = 'name-form-label'
nameFormLabel.textContent = 'Syötä nimesi'
const nameFormInput = document.createElement('input')
nameFormInput.type = 'text'
nameFormInput.className = 'name-form-input'
nameFormInput.placeholder = 'Nimi'
nameFormInput.setAttribute('maxlength', '20')
nameFormInput.setAttribute('aria-label', 'Nimesi pistelistaan')
const nameFormSubmit = document.createElement('button')
nameFormSubmit.type = 'button'
nameFormSubmit.className = 'action-btn name-form-submit'
nameFormSubmit.textContent = 'Tallenna'
nameFormContainer.append(nameFormLabel, nameFormInput, nameFormSubmit)

shell.append(hud, deviceFrame, nameFormContainer)
shell.appendChild(actionButtons)
app.append(shell, leaderboardView, controlsFooter)

type AppView = 'game' | 'leaderboard'
let appView: AppView = 'game'
let nameSavedForThisGame = false
/** When true, AI was used this game — do not save high score or leaderboard. */
let aiWasUsedThisGame = false

function updateLeaderboardList(): void {
  leaderboardList.innerHTML = ''
  const list = getLeaderboard()
  if (list.length === 0) {
    const empty = document.createElement('li')
    empty.className = 'leaderboard-empty'
    empty.textContent = 'Ei vielä tuloksia.'
    leaderboardList.appendChild(empty)
    return
  }
  for (let i = 0; i < list.length; i++) {
    const li = document.createElement('li')
    li.className = 'leaderboard-item'
    li.textContent = `${i + 1}. ${list[i].name} — ${list[i].score}`
    leaderboardList.appendChild(li)
  }
}

const ctx = canvas.getContext('2d')!

let currentTheme: ThemeId = getTheme()
document.documentElement.setAttribute('data-theme', currentTheme)

const colors = getThemeColors(currentTheme)
const renderConfig = {
  GRID_W,
  GRID_H,
  COLOR_BG: colors.COLOR_BG,
  COLOR_SNAKE: colors.COLOR_SNAKE,
  COLOR_FOOD: colors.COLOR_FOOD,
  COLOR_TEXT: colors.COLOR_TEXT,
}

function applyTheme(theme: ThemeId): void {
  currentTheme = theme
  document.documentElement.setAttribute('data-theme', theme)
  setTheme(theme)
  const c = getThemeColors(theme)
  renderConfig.COLOR_BG = c.COLOR_BG
  renderConfig.COLOR_SNAKE = c.COLOR_SNAKE
  renderConfig.COLOR_FOOD = c.COLOR_FOOD
  renderConfig.COLOR_TEXT = c.COLOR_TEXT
  themeBtn.textContent = theme === 'nokia' ? 'OP-värit' : 'Nokia-värit'
}

themeBtn.textContent = currentTheme === 'nokia' ? 'OP-värit' : 'Nokia-värit'
themeBtn.addEventListener('click', () => {
  applyTheme(currentTheme === 'nokia' ? 'op' : 'nokia')
})

aiBtn.addEventListener('click', () => {
  if (state.mode === 'playing' || state.mode === 'paused') {
    state = toggleAiMode(state)
    if (state.aiMode) aiWasUsedThisGame = true
  }
})

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
      if (state.aiMode) {
        state = setQueuedDirection(state, chooseDirection(state))
      }
      state = step(state)
      accumulator -= stepDuration
      steps++
    }
  }

  render(ctx, state, renderConfig, canvas.width, canvas.height)
  scoreEl.textContent = `Score: ${state.score}`
  highEl.textContent = `High: ${state.highScore}`
  aiLabel.textContent = state.aiMode ? 'AI: on' : ''
  aiLabel.style.display = state.aiMode ? '' : 'none'

  const showAiBtn = state.mode === 'playing' || state.mode === 'paused'
  aiBtn.style.display = showAiBtn ? '' : 'none'
  aiBtn.textContent = state.aiMode ? 'AI: päällä' : 'AI: pois'
  aiBtn.classList.toggle('active', state.aiMode)

  const showStart = state.mode === 'start' || state.mode === 'gameover'
  const showRestart = state.mode === 'playing' || state.mode === 'paused' || state.mode === 'gameover'
  startBtn.textContent = state.mode === 'gameover' ? 'Play again' : 'Start'
  startBtn.style.display = showStart ? '' : 'none'
  restartBtn.style.display = showRestart ? '' : 'none'
  leaderboardBtn.style.display = '' // Always visible — view pistelista anytime

  if (appView === 'leaderboard') {
    shell.style.display = 'none'
    leaderboardView.classList.add('leaderboard-view-visible')
    updateLeaderboardList()
  } else {
    shell.style.display = ''
    leaderboardView.classList.remove('leaderboard-view-visible')
  }

  const showNameForm =
    state.mode === 'gameover' &&
    !nameSavedForThisGame &&
    !aiWasUsedThisGame &&
    appView === 'game'
  nameFormContainer.style.display = showNameForm ? '' : 'none'
  nameFormContainer.classList.toggle('name-form-visible', showNameForm)

  if (state.mode === 'gameover' && lastMode !== 'gameover') {
    if (!aiWasUsedThisGame) setHighScore(state.highScore)
  }
  lastMode = state.mode

  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)

leaderboardBtn.addEventListener('click', () => {
  appView = 'leaderboard'
})
leaderboardBackBtn.addEventListener('click', () => {
  appView = 'game'
})
function submitNameToLeaderboard(): void {
  if (aiWasUsedThisGame) return
  addLeaderboardEntry(nameFormInput.value.trim() || 'Anonyymi', state.score)
  nameSavedForThisGame = true
  nameFormInput.value = ''
}

nameFormSubmit.addEventListener('click', submitNameToLeaderboard)
nameFormInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitNameToLeaderboard()
})

attachInputHandlers(shell, {
  onDirection(dir) {
    state = setQueuedDirection(state, dir)
  },
  onStart() {
    if (state.mode === 'start' || state.mode === 'gameover') {
      nameSavedForThisGame = false
      aiWasUsedThisGame = false
      state = startGame(state)
    }
  },
  onRestart() {
    nameSavedForThisGame = false
    aiWasUsedThisGame = false
    state = startGame(state)
  },
  onPause() {
    if (state.mode === 'playing' || state.mode === 'paused') {
      state = togglePause(state)
    }
  },
  onToggleAI() {
    if (state.mode === 'playing' || state.mode === 'paused') {
      state = toggleAiMode(state)
      if (state.aiMode) aiWasUsedThisGame = true
    }
  },
})

shell.appendChild(actionButtons)

startBtn.addEventListener('click', () => {
  if (state.mode === 'start' || state.mode === 'gameover') {
    nameSavedForThisGame = false
    aiWasUsedThisGame = false
    state = startGame(state)
  }
})
restartBtn.addEventListener('click', () => {
  nameSavedForThisGame = false
  aiWasUsedThisGame = false
  state = startGame(state)
})
