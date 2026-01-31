import type { Direction } from './types.ts'

export interface InputCallbacks {
  onDirection(dir: Direction): void
  onStart(): void
  onRestart(): void
  onPause(): void
  /** Toggle AI demo mode (when playing). Key I is reserved for this. */
  onToggleAI?: () => void
}

const GAME_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'KeyI',
  'Enter',
  'Space',
  'KeyR',
])

function keyToDirection(e: KeyboardEvent): Direction | null {
  switch (e.code) {
    case 'ArrowUp':
    case 'KeyW':
      return 'up'
    case 'ArrowDown':
    case 'KeyS':
      return 'down'
    case 'ArrowLeft':
    case 'KeyA':
      return 'left'
    case 'ArrowRight':
    case 'KeyD':
      return 'right'
    default:
      return null
  }
}

function createDpad(element: HTMLElement, callbacks: InputCallbacks): HTMLElement {
  const container = document.createElement('div')
  container.className = 'dpad-container'
  container.setAttribute('aria-label', 'Direction pad')

  const dirs: { dir: Direction; label: string; cell: string }[] = [
    { dir: 'up', label: '↑', cell: 'dpad-up' },
    { dir: 'down', label: '↓', cell: 'dpad-down' },
    { dir: 'left', label: '←', cell: 'dpad-left' },
    { dir: 'right', label: '→', cell: 'dpad-right' },
  ]

  for (const { dir, label, cell } of dirs) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = `dpad-btn ${cell}`
    btn.dataset.direction = dir
    btn.textContent = label
    btn.setAttribute('aria-label', dir)
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      callbacks.onDirection(dir)
    })
    btn.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false })
    container.appendChild(btn)
  }

  element.appendChild(container)
  return container
}

/**
 * Attaches keyboard and on-screen D-pad input to the given element.
 * Returns a cleanup function that removes all listeners and injected DOM.
 */
export function attachInputHandlers(
  element: HTMLElement,
  callbacks: InputCallbacks
): () => void {
  const handleKeydown = (e: KeyboardEvent): void => {
    if (!GAME_KEYS.has(e.code)) return
    e.preventDefault()

    if (e.code === 'KeyI') {
      callbacks.onToggleAI?.()
      return
    }
    const dir = keyToDirection(e)
    if (dir !== null) {
      callbacks.onDirection(dir)
      return
    }
    switch (e.code) {
      case 'Enter':
        callbacks.onStart()
        break
      case 'Space':
        callbacks.onPause()
        break
      case 'KeyR':
        callbacks.onRestart()
        break
    }
  }

  document.addEventListener('keydown', handleKeydown)
  const dpadContainer = createDpad(element, callbacks)

  return function cleanup(): void {
    document.removeEventListener('keydown', handleKeydown)
    dpadContainer.remove()
  }
}
