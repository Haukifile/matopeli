import type { ThemeId } from './config.ts'

export const HIGH_SCORE_KEY = 'matopeli-highscore'
export const THEME_KEY = 'matopeli-theme'

export function getHighScore(): number {
  const s = localStorage.getItem(HIGH_SCORE_KEY)
  if (s === null) return 0
  const n = parseInt(s, 10)
  return Number.isNaN(n) ? 0 : n
}

export function setHighScore(score: number): void {
  localStorage.setItem(HIGH_SCORE_KEY, String(score))
}

export function getTheme(): ThemeId {
  const s = localStorage.getItem(THEME_KEY)
  if (s === 'nokia' || s === 'op') return s
  return 'nokia'
}

export function setTheme(theme: ThemeId): void {
  localStorage.setItem(THEME_KEY, theme)
}
