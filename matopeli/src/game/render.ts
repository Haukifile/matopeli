import type { GameState } from './types.ts'

export interface RenderConfig {
  GRID_W: number
  GRID_H: number
  COLOR_BG: string
  COLOR_SNAKE: string
  COLOR_FOOD: string
  COLOR_TEXT: string
}

/**
 * Renders the game to the canvas. Uses crisp layout: cellSize = floor(min(canvasW/GRID_W, canvasH/GRID_H))
 * and centers the grid. Score and high score are not drawn here; the caller updates the DOM HUD.
 */
export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  config: RenderConfig,
  canvasPixelW: number,
  canvasPixelH: number
): void {
  const cellSize = Math.floor(
    Math.min(
      canvasPixelW / config.GRID_W,
      canvasPixelH / config.GRID_H
    )
  )
  const gridPixelW = cellSize * config.GRID_W
  const gridPixelH = cellSize * config.GRID_H
  const offsetX = (canvasPixelW - gridPixelW) / 2
  const offsetY = (canvasPixelH - gridPixelH) / 2

  // 1. Background
  ctx.fillStyle = config.COLOR_BG
  ctx.fillRect(0, 0, canvasPixelW, canvasPixelH)

  // 2. Playfield border
  ctx.strokeStyle = config.COLOR_TEXT
  ctx.strokeRect(offsetX, offsetY, gridPixelW, gridPixelH)

  // 3. Snake
  ctx.fillStyle = config.COLOR_SNAKE
  for (const seg of state.snake) {
    ctx.fillRect(
      offsetX + seg.x * cellSize,
      offsetY + seg.y * cellSize,
      cellSize,
      cellSize
    )
  }

  // 4. Food
  ctx.fillStyle = config.COLOR_FOOD
  ctx.fillRect(
    offsetX + state.food.x * cellSize,
    offsetY + state.food.y * cellSize,
    cellSize,
    cellSize
  )

  // 5. Overlay text by mode
  const overlayText =
    state.mode === 'start'
      ? 'Press Enter'
      : state.mode === 'paused'
        ? 'Paused'
        : state.mode === 'gameover'
          ? 'Game Over - Press R'
          : null
  if (overlayText !== null) {
    const fontSize = Math.max(12, Math.floor(cellSize * 0.8))
    ctx.fillStyle = config.COLOR_TEXT
    ctx.font = `${fontSize}px "Courier New", monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(overlayText, canvasPixelW / 2, canvasPixelH / 2)
  }
}
