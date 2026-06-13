// Shared GitHub fetch + pet-state computation used by both the Node card generator
// and the hosted serverless endpoint, so they can't diverge.
import {
  getSpecies, getDaysSinceLastCommit, getCurrentStreak, getLevel,
  getEvolutionStage, getMood, getHunger, getHappiness, getHealth,
  getTotalCommits, getMoodLabel, getXPProgress,
} from './petCalculations.js'
import { SPECIES_LIST } from './constants.js'

const API = 'https://api.github.com'

// Fetches a user's public activity and returns the card state object expected by
// buildCardSvg. Throws an Error with a `.status` on HTTP failures.
export async function fetchCardState(username, { token, species: speciesOverride } = {}) {
  const headers = { 'User-Agent': 'commitchi', Accept: 'application/vnd.github+json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const u = encodeURIComponent(username)
  const get = async (path) => {
    const res = await fetch(`${API}${path}`, { headers })
    if (!res.ok) {
      const err = new Error(`GitHub API ${res.status} for ${path}`)
      err.status = res.status
      throw err
    }
    return res.json()
  }

  const [user, events, repos] = await Promise.all([
    get(`/users/${u}`),
    get(`/users/${u}/events/public?per_page=100`),
    get(`/users/${u}/repos?per_page=100&sort=pushed`),
  ])

  const langCounts = {}
  for (const r of repos) if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1
  const topLanguage = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  const evList = Array.isArray(events) ? events : []
  const hasActivity = evList.some((e) => e.type === 'PushEvent')
  const species = speciesOverride && SPECIES_LIST.includes(speciesOverride)
    ? speciesOverride
    : getSpecies(topLanguage)
  const daysSince = getDaysSinceLastCommit(evList)
  const streak = getCurrentStreak(evList)
  const effective = getTotalCommits(evList) + user.public_repos * 3
  const level = getLevel(effective)
  const stage = getEvolutionStage(level)
  const mood = getMood(daysSince, streak, hasActivity)

  return {
    username: user.login,
    species,
    stage,
    mood,
    moodLabel: getMoodLabel(mood),
    level,
    xp: getXPProgress(effective),
    hunger: getHunger(daysSince),
    happiness: getHappiness(streak, mood),
    health: getHealth(mood),
    streak,
    daysSince,
    totalCommits: getTotalCommits(evList) + user.public_repos,
  }
}
