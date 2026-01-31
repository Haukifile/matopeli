import type { ThemeId } from './config.ts'

export const HIGH_SCORE_KEY = 'matopeli-highscore'
export const THEME_KEY = 'matopeli-theme'
export const LEADERBOARD_KEY = 'matopeli-leaderboard'

const MAX_LEADERBOARD_ENTRIES = 10

export interface LeaderboardEntry {
  name: string
  score: number
}

export function getLeaderboard(): LeaderboardEntry[] {
  const s = localStorage.getItem(LEADERBOARD_KEY)
  if (s === null) return []
  try {
    const parsed = JSON.parse(s) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (e): e is LeaderboardEntry =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as LeaderboardEntry).name === 'string' &&
        typeof (e as LeaderboardEntry).score === 'number'
    )
  } catch {
    return []
  }
}

export function addLeaderboardEntry(name: string, score: number): void {
  const list = getLeaderboard()
  list.push({ name: name.trim() || 'Anonyymi', score })
  list.sort((a, b) => b.score - a.score)
  const top = list.slice(0, MAX_LEADERBOARD_ENTRIES)
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top))
}

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
