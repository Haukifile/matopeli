import type { GameState, Direction, Vec2 } from './types.ts'
import { nextHeadPosition, isOpposite, moveSnake, hitWall } from './snake.ts'
import { spawnFood } from './food.ts'
import {
  GRID_W,
  GRID_H,
  INITIAL_SNAKE,
  INITIAL_TICK_RATE,
  SPEEDUP_EVERY,
  MAX_TICK_RATE,
} from './config.ts'

/** Set of "x,y" keys for snake segments (for spawnFood occupied set). */
function occupiedSet(snake: Vec2[]): Set<string> {
  const set = new Set<string>()
  for (const seg of snake) set.add(`${seg.x},${seg.y}`)
  return set
}

/** True if newHead overlaps any body segment (snake excluding head). */
function headHitsBody(newHead: Vec2, snake: Vec2[]): boolean {
  if (snake.length < 2) return false
  const body = new Set<string>()
  for (let i = 0; i < snake.length - 1; i++) {
    body.add(`${snake[i].x},${snake[i].y}`)
  }
  return body.has(`${newHead.x},${newHead.y}`)
}

export function createInitialState(highScore: number): GameState {
  const snake = [...INITIAL_SNAKE]
  const food = spawnFood(occupiedSet(snake), GRID_W, GRID_H)
  return {
    snake,
    direction: 'right',
    queuedDirection: null,
    food,
    score: 0,
    highScore,
    mode: 'start',
    tickRate: INITIAL_TICK_RATE,
  }
}

export function setQueuedDirection(
  state: GameState,
  dir: Direction
): GameState {
  return { ...state, queuedDirection: dir }
}

export function startGame(state: GameState): GameState {
  const snake = [...INITIAL_SNAKE]
  const food = spawnFood(occupiedSet(snake), GRID_W, GRID_H)
  return {
    ...state,
    mode: 'playing',
    snake,
    direction: 'right',
    queuedDirection: null,
    food,
    score: 0,
    tickRate: INITIAL_TICK_RATE,
  }
}

export function togglePause(state: GameState): GameState {
  if (state.mode === 'playing') return { ...state, mode: 'paused' }
  if (state.mode === 'paused') return { ...state, mode: 'playing' }
  return state
}

export function step(state: GameState): GameState {
  if (state.mode !== 'playing') return state

  const nextDir =
    state.queuedDirection !== null &&
    !isOpposite(state.direction, state.queuedDirection)
      ? state.queuedDirection
      : state.direction

  const head = state.snake[state.snake.length - 1]
  const newHead = nextHeadPosition(head, nextDir)

  if (hitWall(newHead, GRID_W, GRID_H)) {
    return { ...state, mode: 'gameover' }
  }

  if (headHitsBody(newHead, state.snake)) {
    return { ...state, mode: 'gameover' }
  }

  if (newHead.x === state.food.x && newHead.y === state.food.y) {
    const newSnake = moveSnake(state.snake, nextDir, true)
    const newScore = state.score + 1
    const newHighScore = Math.max(state.highScore, newScore)
    const occupied = occupiedSet(newSnake)
    const newFood = spawnFood(occupied, GRID_W, GRID_H)
    const newTickRate =
      newScore % SPEEDUP_EVERY === 0
        ? Math.min(MAX_TICK_RATE, state.tickRate + 1)
        : state.tickRate
    return {
      ...state,
      snake: newSnake,
      direction: nextDir,
      queuedDirection: null,
      food: newFood,
      score: newScore,
      highScore: newHighScore,
      tickRate: newTickRate,
    }
  }

  const newSnake = moveSnake(state.snake, nextDir, false)
  return {
    ...state,
    snake: newSnake,
    direction: nextDir,
    queuedDirection: null,
  }
}
