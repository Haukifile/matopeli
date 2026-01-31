/** 2D position or cell coordinate (grid units). */
export interface Vec2 {
  x: number
  y: number
}

export type Direction = 'up' | 'down' | 'left' | 'right'

export type GameMode = 'start' | 'playing' | 'paused' | 'gameover'

export interface GameState {
  snake: Vec2[]
  direction: Direction
  /** Next direction to apply on tick; null if none queued. */
  queuedDirection: Direction | null
  food: Vec2
  score: number
  highScore: number
  mode: GameMode
  /** Ticks per second. */
  tickRate: number
}
