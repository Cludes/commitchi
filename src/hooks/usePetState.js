import { useMemo } from 'react'
import {
  getSpecies, getDaysSinceLastCommit, getCurrentStreak,
  getLevel, getEvolutionStage, getMood, getHunger,
  getHappiness, getHealth, getTotalCommits,
  getMoodLabel, getMoodMessage,
} from '../utils/petCalculations'

export function usePetState(githubData) {
  return useMemo(() => {
    if (!githubData) return null

    const { events, topLanguage, user } = githubData
    const species = getSpecies(topLanguage)
    const daysSince = getDaysSinceLastCommit(events)
    const streak = getCurrentStreak(events)
    const totalCommits = getTotalCommits(events)
    const level = getLevel(totalCommits + (user.public_repos * 3))
    const stage = getEvolutionStage(level)
    const mood = getMood(daysSince, streak)
    const hunger = getHunger(daysSince)
    const happiness = getHappiness(streak)
    const health = getHealth(mood)

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
      moodLabel: getMoodLabel(mood),
      moodMessage: getMoodMessage(mood, species),
      hunger,
      happiness,
      health,
      level,
      streak,
      daysSince,
      totalCommits: totalCommits + user.public_repos,
      recentActivity,
      username: user.login,
      avatar: user.avatar_url,
      topLanguage,
    }
  }, [githubData])
}
