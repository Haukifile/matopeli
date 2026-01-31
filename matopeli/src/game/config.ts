import type { Vec2 } from './types.ts'

export const GRID_W = 20
export const GRID_H = 20

/** Initial snake: 3 cells, centered on grid, moving right. Head is last element. */
export const INITIAL_SNAKE: readonly Vec2[] = [
  { x: 8, y: 10 },
  { x: 9, y: 10 },
  { x: 10, y: 10 },
]

export const INITIAL_TICK_RATE = 8
export const SPEEDUP_EVERY = 5
export const MAX_TICK_RATE = 20

/** Colors for canvas fillStyle / renderer (Nokia-style retro). */
export const COLOR_BG = '#0f380f'
export const COLOR_SNAKE = '#306230'
export const COLOR_FOOD = '#9bbc0f'
export const COLOR_TEXT = '#9bbc0f'
