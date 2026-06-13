import { useMemo } from 'react'
import {
  getSpecies, getDaysSinceLastCommit, getCurrentStreak,
  getLevel, getEvolutionStage, getMood, getHunger,
  getHappiness, getHealth, getTotalCommits,
  getMoodLabel, getMoodMessages, getXPProgress, getDailyCommits,
  getAchievements,
} from '../utils/petCalculations'
import { SPECIES_LIST } from '../utils/constants'

export function usePetState(githubData, overrideSpecies = null) {
  return useMemo(() => {
    if (!githubData) return null

    const { events, topLanguage, user, languageCount = 0 } = githubData
    const hasActivity = events.some(e => e.type === 'PushEvent')
    const species = overrideSpecies && SPECIES_LIST.includes(overrideSpecies)
      ? overrideSpecies
      : getSpecies(topLanguage)
    const daysSince = getDaysSinceLastCommit(events)
    const streak = getCurrentStreak(events)
    const rawCommits = getTotalCommits(events)
    const effectiveCommits = rawCommits + user.public_repos * 3
    const level = getLevel(effectiveCommits)
    const stage = getEvolutionStage(level)
    const mood = getMood(daysSince, streak, hasActivity)
    const hunger = getHunger(daysSince)
    const happiness = getHappiness(streak, mood)
    const health = getHealth(mood)
    const xp = getXPProgress(effectiveCommits)
    const dailyCommits = getDailyCommits(events)
    const totalCommits = rawCommits + user.public_repos
    const achievements = getAchievements({ totalCommits, streak, level, languageCount })

    const recentActivity = events
      .filter(e => e.type === 'PushEvent')
      .slice(0, 5)
      .map(e => ({
        repo: e.repo.name,
        commits: e.payload?.commits?.length || 1,
        date: new Date(e.created_at),
        message: e.payload?.commits?.[0]?.message?.split('\n')[0] || 'pushed code',
      }))

    return {
      species,
      stage,
      mood,
      isDormant: mood === 'dormant',
      moodLabel: getMoodLabel(mood),
      moodMessages: getMoodMessages(mood, species),
      hunger,
      happiness,
      health,
      level,
      xp,
      streak,
      daysSince,
      totalCommits,
      achievements,
      dailyCommits,
      recentActivity,
      username: user.login,
      avatar: user.avatar_url,
      topLanguage,
    }
  }, [githubData, overrideSpecies])
}
