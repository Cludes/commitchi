// Generates self-contained light + dark SVG cards of a user's Commitchi pet for
// embedding in a GitHub profile README. Reuses the shared card builder.
import { writeFileSync } from 'node:fs'
import process from 'node:process'
import {
  getSpecies, getDaysSinceLastCommit, getCurrentStreak, getLevel,
  getEvolutionStage, getMood, getHunger, getHappiness, getHealth,
  getTotalCommits, getMoodLabel, getXPProgress,
} from '../src/utils/petCalculations.js'
import { SPECIES_LIST } from '../src/utils/constants.js'
import { buildCardSvg, LIGHT_THEME, DARK_THEME } from '../src/utils/cardSvg.js'

const USERNAME = process.env.COMMITCHI_USER || process.argv[2]
const OUT = process.env.OUT || 'commitchi.svg'
const API = 'https://api.github.com'

if (!USERNAME) {
  console.error('Usage: COMMITCHI_USER=<login> node scripts/generate-pet-svg.mjs')
  process.exit(1)
}

async function gh(path) {
  const headers = { 'User-Agent': 'commitchi' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const res = await fetch(`${API}${path}`, { headers })
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${path}`)
  return res.json()
}

async function main() {
  const u = encodeURIComponent(USERNAME)
  const [user, events, repos] = await Promise.all([
    gh(`/users/${u}`),
    gh(`/users/${u}/events/public?per_page=100`),
    gh(`/users/${u}/repos?per_page=100&sort=pushed`),
  ])

  const langCounts = {}
  for (const r of repos) if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1
  const topLanguage = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  const evList = Array.isArray(events) ? events : []
  const hasActivity = evList.some((e) => e.type === 'PushEvent')
  const override = process.env.COMMITCHI_SPECIES
  const species = override && SPECIES_LIST.includes(override) ? override : getSpecies(topLanguage)
  const daysSince = getDaysSinceLastCommit(evList)
  const streak = getCurrentStreak(evList)
  const effective = getTotalCommits(evList) + user.public_repos * 3
  const level = getLevel(effective)
  const stage = getEvolutionStage(level)
  const mood = getMood(daysSince, streak, hasActivity)

  const state = {
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

  const darkOut = OUT.replace(/\.svg$/, '-dark.svg')
  writeFileSync(OUT, buildCardSvg(state, LIGHT_THEME))
  writeFileSync(darkOut, buildCardSvg(state, DARK_THEME))
  console.log(`Wrote ${OUT} + ${darkOut} - ${species} (${state.moodLabel}) lvl ${level} for @${user.login}`)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
