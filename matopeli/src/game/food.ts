import type { Vec2 } from './types.ts'

/**
 * Spawn food on a random free cell. occupied uses "x,y" keys for O(1) lookup.
 * We only sample from free cells so we never spawn on the snake.
 * @throws Error if no free cell (grid full).
 */
export function spawnFood(
  occupied: Set<string>,
  gridW: number,
  gridH: number
): Vec2 {
  const freeCells: Vec2[] = []
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const key = `${x},${y}`
      if (!occupied.has(key)) freeCells.push({ x, y })
    }
  }
  if (freeCells.length === 0) throw new Error('No free cell')
  return freeCells[Math.floor(Math.random() * freeCells.length)]
}
