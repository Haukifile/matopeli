import type { GameState, Direction, Vec2 } from './types.ts'
import { nextHeadPosition, hitWall, isOpposite } from './snake.ts'
import { GRID_W, GRID_H } from './config.ts'

const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right']

function cellKey(p: Vec2): string {
  return `${p.x},${p.y}`
}

function blockedSet(snake: Vec2[]): Set<string> {
  const set = new Set<string>()
  for (const seg of snake) set.add(cellKey(seg))
  return set
}

function directionFromTo(from: Vec2, to: Vec2): Direction | null {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (dx === 0 && dy === -1) return 'up'
  if (dx === 0 && dy === 1) return 'down'
  if (dx === -1 && dy === 0) return 'left'
  if (dx === 1 && dy === 0) return 'right'
  return null
}

/**
 * BFS from head to food on the grid, avoiding snake cells and walls.
 * Returns the first direction (head -> next cell) on a shortest path, or null if no path.
 */
function bfsPathToFood(
  head: Vec2,
  food: Vec2,
  blocked: Set<string>,
  gridW: number,
  gridH: number
): Direction | null {
  if (cellKey(head) === cellKey(food)) return null
  const visited = new Set<string>()
  visited.add(cellKey(head))
  const queue: Vec2[] = [head]
  const parent = new Map<string, Vec2>()

  while (queue.length > 0) {
    const cur = queue.shift()!

    for (const dir of DIRECTIONS) {
      const next = nextHeadPosition(cur, dir)
      const nextKey = cellKey(next)
      if (next.x < 0 || next.x >= gridW || next.y < 0 || next.y >= gridH) continue
      if (blocked.has(nextKey) || visited.has(nextKey)) continue
      visited.add(nextKey)
      parent.set(nextKey, cur)
      queue.push(next)
      if (next.x === food.x && next.y === food.y) {
        const path: Vec2[] = []
        let p: Vec2 | undefined = next
        while (p !== undefined) {
          path.push(p)
          p = parent.get(cellKey(p))
        }
        path.reverse()
        if (path.length >= 2) {
          return directionFromTo(path[0], path[1]) ?? null
        }
        return null
      }
    }
  }
  return null
}

/**
 * Returns a safe direction (no wall, no body hit), excluding the opposite of current.
 * If none safe, returns current direction.
 */
function getSafeDirection(
  head: Vec2,
  currentDir: Direction,
  snake: Vec2[],
  gridW: number,
  gridH: number
): Direction {
  const bodySet = new Set<string>()
  for (let i = 0; i < snake.length - 1; i++) {
    bodySet.add(cellKey(snake[i]))
  }
  for (const dir of DIRECTIONS) {
    if (isOpposite(currentDir, dir)) continue
    const next = nextHeadPosition(head, dir)
    if (hitWall(next, gridW, gridH)) continue
    if (bodySet.has(cellKey(next))) continue
    return dir
  }
  return currentDir
}

/**
 * Chooses the next direction for the snake: BFS shortest path to food if one exists,
 * otherwise a safe direction that avoids wall and body; last resort is current direction.
 */
export function chooseDirection(state: GameState): Direction {
  const head = state.snake[state.snake.length - 1]
  const blocked = blockedSet(state.snake)
  const dir = bfsPathToFood(
    head,
    state.food,
    blocked,
    GRID_W,
    GRID_H
  )
  if (dir !== null) return dir
  return getSafeDirection(
    head,
    state.direction,
    state.snake,
    GRID_W,
    GRID_H
  )
}
