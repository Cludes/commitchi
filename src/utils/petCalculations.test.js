import { describe, it, expect } from 'vitest'
import {
  getSpecies, getLevel, getXPProgress, getMood, getCurrentStreak,
  getDailyCommits, getEvolutionStage, getHealth, getMoodLabel,
} from './petCalculations'

// Build a PushEvent N days before now (optionally with a commit count).
function pushEvent(daysAgo, commits = 1) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return {
    type: 'PushEvent',
    created_at: d.toISOString(),
    payload: { commits: Array.from({ length: commits }, (_, i) => ({ message: `c${i}` })) },
  }
}

describe('getSpecies', () => {
  it('maps known languages to species', () => {
    expect(getSpecies('JavaScript')).toBe('hamster')
    expect(getSpecies('TypeScript')).toBe('hamster')
    expect(getSpecies('Python')).toBe('snake')
    expect(getSpecies('Lua')).toBe('mooncat')
    expect(getSpecies('Rust')).toBe('crab')
    expect(getSpecies('Go')).toBe('gopher')
    expect(getSpecies('Ruby')).toBe('gem')
  })

  it('falls back to blob for unknown or missing language', () => {
    expect(getSpecies('Haskell')).toBe('blob')
    expect(getSpecies(null)).toBe('blob')
    expect(getSpecies(undefined)).toBe('blob')
  })
})

describe('getLevel', () => {
  it('returns the right level at each threshold boundary', () => {
    expect(getLevel(0)).toBe(1)
    expect(getLevel(9)).toBe(1)
    expect(getLevel(10)).toBe(2)
    expect(getLevel(49)).toBe(2)
    expect(getLevel(50)).toBe(3)
    expect(getLevel(150)).toBe(4)
    expect(getLevel(400)).toBe(5)
    expect(getLevel(1000)).toBe(6)
    expect(getLevel(2500)).toBe(7)
    expect(getLevel(5000)).toBe(8)
    expect(getLevel(999999)).toBe(8)
  })
})

describe('getXPProgress', () => {
  it('computes progress within a level', () => {
    // level 2 spans [10, 50): 30 commits = 20/40 = 50%
    const xp = getXPProgress(30)
    expect(xp.max).toBe(false)
    expect(xp.current).toBe(20)
    expect(xp.needed).toBe(40)
    expect(xp.pct).toBe(50)
  })

  it('reports max at the top level', () => {
    const xp = getXPProgress(6000)
    expect(xp.max).toBe(true)
    expect(xp.pct).toBe(100)
  })

  it('is 0% at the start of a level', () => {
    expect(getXPProgress(50).pct).toBe(0) // exactly at level 3 floor
  })
})

describe('getEvolutionStage', () => {
  it('maps levels to stages', () => {
    expect(getEvolutionStage(1)).toBe('egg')
    expect(getEvolutionStage(2)).toBe('baby')
    expect(getEvolutionStage(3)).toBe('normal')
    expect(getEvolutionStage(4)).toBe('normal')
    expect(getEvolutionStage(5)).toBe('adult')
    expect(getEvolutionStage(6)).toBe('adult')
    expect(getEvolutionStage(7)).toBe('elder')
    expect(getEvolutionStage(8)).toBe('elder')
  })
})

describe('getMood', () => {
  it('is dormant when there is no activity, regardless of days/streak', () => {
    expect(getMood(0, 10, false)).toBe('dormant')
    expect(getMood(99, 0, false)).toBe('dormant')
  })

  it('covers the day-based boundaries', () => {
    expect(getMood(21, 0, true)).toBe('dead')
    expect(getMood(20, 0, true)).toBe('critical')
    expect(getMood(11, 0, true)).toBe('critical')
    expect(getMood(10, 0, true)).toBe('sad')
    expect(getMood(7, 0, true)).toBe('sad')
    expect(getMood(6, 0, true)).toBe('hungry')
    expect(getMood(4, 0, true)).toBe('hungry')
    expect(getMood(3, 0, true)).toBe('content')
    expect(getMood(2, 0, true)).toBe('content')
  })

  it('is ecstatic only with a long streak and recent activity', () => {
    expect(getMood(0, 7, true)).toBe('ecstatic')
    expect(getMood(1, 6, true)).toBe('happy')
    expect(getMood(0, 0, true)).toBe('happy')
  })

  it('defaults hasActivity to true', () => {
    expect(getMood(0, 0)).toBe('happy')
  })
})

describe('getCurrentStreak', () => {
  it('is 0 with no push events', () => {
    expect(getCurrentStreak([])).toBe(0)
    expect(getCurrentStreak([{ type: 'WatchEvent', created_at: new Date().toISOString() }])).toBe(0)
  })

  it('counts consecutive days including today', () => {
    const events = [pushEvent(0), pushEvent(1), pushEvent(2)]
    expect(getCurrentStreak(events)).toBe(3)
  })

  it('counts a streak that started yesterday (no commit today yet)', () => {
    const events = [pushEvent(1), pushEvent(2)]
    expect(getCurrentStreak(events)).toBe(2)
  })

  it('stops at the first gap', () => {
    const events = [pushEvent(0), pushEvent(1), pushEvent(5)]
    expect(getCurrentStreak(events)).toBe(2)
  })

  it('dedupes multiple commits on the same day', () => {
    const events = [pushEvent(0), pushEvent(0), pushEvent(1)]
    expect(getCurrentStreak(events)).toBe(2)
  })
})

describe('getDailyCommits', () => {
  it('sums commit counts per day from PushEvents', () => {
    const events = [pushEvent(0, 3), pushEvent(0, 2), pushEvent(1, 1)]
    const map = getDailyCommits(events)
    const today = new Date().toDateString()
    expect(map[today]).toBe(5)
    expect(Object.keys(map)).toHaveLength(2)
  })

  it('ignores non-push events', () => {
    const events = [{ type: 'IssuesEvent', created_at: new Date().toISOString() }]
    expect(getDailyCommits(events)).toEqual({})
  })
})

describe('getHealth / getMoodLabel', () => {
  it('returns a health value for every mood', () => {
    for (const mood of ['ecstatic', 'happy', 'content', 'hungry', 'sad', 'critical', 'dead', 'dormant']) {
      const h = getHealth(mood)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(100)
    }
  })

  it('labels dormant and dead distinctly', () => {
    expect(getMoodLabel('dormant')).toBe('Dormant')
    expect(getMoodLabel('dead')).toBe('Dead')
  })
})
