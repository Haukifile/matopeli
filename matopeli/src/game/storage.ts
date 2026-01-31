export const HIGH_SCORE_KEY = 'matopeli-highscore'

export function getHighScore(): number {
  const s = localStorage.getItem(HIGH_SCORE_KEY)
  if (s === null) return 0
  const n = parseInt(s, 10)
  return Number.isNaN(n) ? 0 : n
}

export function setHighScore(score: number): void {
  localStorage.setItem(HIGH_SCORE_KEY, String(score))
}
