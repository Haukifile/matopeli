import type { Vec2, Direction } from './types.ts'

/** Next cell position when moving one step in dir. Up = decrease y (screen/canvas convention). */
export function nextHeadPosition(head: Vec2, dir: Direction): Vec2 {
  switch (dir) {
    case 'up':
      return { x: head.x, y: head.y - 1 }
    case 'down':
      return { x: head.x, y: head.y + 1 }
    case 'left':
      return { x: head.x - 1, y: head.y }
    case 'right':
      return { x: head.x + 1, y: head.y }
  }
}

export function isOpposite(a: Direction, b: Direction): boolean {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  )
}

/** Snake: head is last element, tail is first. Returns new array; does not mutate. */
export function moveSnake(snake: Vec2[], dir: Direction, grow: boolean): Vec2[] {
  const head = snake[snake.length - 1]
  const newHead = nextHeadPosition(head, dir)
  const bodyWithoutTail = grow ? snake : snake.slice(1)
  return [...bodyWithoutTail, newHead]
}

/** True if head (last segment) collides with any body segment. */
export function hitSelf(snake: Vec2[]): boolean {
  if (snake.length < 2) return false
  const head = snake[snake.length - 1]
  const bodyKeys = new Set<string>()
  for (let i = 0; i < snake.length - 1; i++) {
    bodyKeys.add(`${snake[i].x},${snake[i].y}`)
  }
  return bodyKeys.has(`${head.x},${head.y}`)
}

export function hitWall(head: Vec2, gridW: number, gridH: number): boolean {
  return head.x < 0 || head.x >= gridW || head.y < 0 || head.y >= gridH
}
