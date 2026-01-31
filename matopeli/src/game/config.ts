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

/** Theme identifier for color palette. */
export type ThemeId = 'nokia' | 'op'

/** Canvas colors for a theme (Nokia-style retro or OP Pohjola). */
export interface ThemeColors {
  COLOR_BG: string
  COLOR_SNAKE: string
  COLOR_FOOD: string
  COLOR_TEXT: string
}

/** Nokia-style retro LCD palette (default). */
const NOKIA: ThemeColors = {
  COLOR_BG: '#0f380f',
  COLOR_SNAKE: '#306230',
  COLOR_FOOD: '#9bbc0f',
  COLOR_TEXT: '#9bbc0f',
}

/** OP Pohjola oranssi-valkoinen palette (oranssi #f25c19). */
const OP: ThemeColors = {
  COLOR_BG: '#ffffff',
  COLOR_SNAKE: '#f25c19',
  COLOR_FOOD: '#f25c19',
  COLOR_TEXT: '#f25c19',
}

/** Colors for canvas fillStyle / renderer (Nokia-style retro). Kept for backward compatibility. */
export const COLOR_BG = NOKIA.COLOR_BG
export const COLOR_SNAKE = NOKIA.COLOR_SNAKE
export const COLOR_FOOD = NOKIA.COLOR_FOOD
export const COLOR_TEXT = NOKIA.COLOR_TEXT

export function getThemeColors(theme: ThemeId): ThemeColors {
  return theme === 'op' ? OP : NOKIA
}
