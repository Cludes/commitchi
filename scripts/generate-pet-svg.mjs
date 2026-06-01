// Generates a self-contained SVG of a user's Commitchi pet for embedding in a
// GitHub profile README. Reuses the app's sprite + calculation logic.
import { writeFileSync } from 'node:fs'
import process from 'node:process'
import { getSpriteForState, recolorSprite } from '../src/utils/sprites.js'
import {
  getSpecies, getDaysSinceLastCommit, getCurrentStreak, getLevel,
  getEvolutionStage, getMood, getHunger, getHappiness, getHealth,
  getTotalCommits, getMoodLabel, getXPProgress,
} from '../src/utils/petCalculations.js'

const USERNAME = process.env.COMMITCHI_USER || process.argv[2]
const OUT = process.env.OUT || 'commitchi.svg'
const API = 'https://api.github.com'

if (!USERNAME) {
  console.error('Usage: COMMITCHI_USER=<login> node scripts/generate-pet-svg.mjs')
  process.exit(1)
}

const SPECIES_NAMES = {
  hamster: 'Hamster', snake: 'Snake', mooncat: 'Moon Cat', crab: 'Crab',
  gopher: 'Gopher', gem: 'Gem', blob: 'Blob',
}
const STAGE_NAMES = { egg: 'Egg', baby: 'Baby', normal: 'Adult', adult: 'Veteran', elder: 'Elder' }
const MOOD_COLORS = {
  ecstatic: '#c2185b', happy: '#2a5a2a', content: '#0f380f', hungry: '#9c6a00',
  sad: '#b5531a', critical: '#c62828', dead: '#555',
}

const LCD_BG = '#c8f569'
const LCD_DARK = '#0f380f'
const LCD_MID = '#2a5a2a'
const LCD_LIGHT = '#8bac0f'

async function gh(path) {
  const headers = { 'User-Agent': 'commitchi' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const res = await fetch(`${API}${path}`, { headers })
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${path}`)
  return res.json()
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function segments(x, y, value, segs = 10, segW = 13, segH = 9, gap = 2) {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * segs)
  let out = ''
  for (let i = 0; i < segs; i++) {
    const fill = i < filled ? LCD_DARK : LCD_LIGHT
    out += `<rect x="${x + i * (segW + gap)}" y="${y}" width="${segW}" height="${segH}" fill="${fill}" stroke="${LCD_MID}" stroke-width="1"/>`
  }
  return out
}

function bar(label, x, y, value) {
  return (
    `<text x="${x}" y="${y + 8}" font-family="'Courier New',monospace" font-size="11" font-weight="bold" fill="${LCD_DARK}">${label}</text>` +
    segments(x + 56, y, value)
  )
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
  const species = getSpecies(topLanguage)
  const daysSince = getDaysSinceLastCommit(evList)
  const streak = getCurrentStreak(evList)
  const effective = getTotalCommits(evList) + user.public_repos * 3
  const level = getLevel(effective)
  const stage = getEvolutionStage(level)
  const mood = getMood(daysSince, streak, hasActivity)
  const xp = getXPProgress(effective)
  const state = {
    species, stage, mood, level, xp, streak, daysSince,
    hunger: getHunger(daysSince), happiness: getHappiness(streak), health: getHealth(mood),
    moodLabel: getMoodLabel(mood),
    totalCommits: getTotalCommits(evList) + user.public_repos,
  }

  // pixel art
  const sprite = recolorSprite(getSpriteForState(species, mood, stage), species)
  const PS = 9
  const petX = 34
  const petY = 70
  let pixels = ''
  sprite.forEach((row, y) => {
    row.forEach((color, x) => {
      if (!color) return
      pixels += `<rect x="${petX + x * PS}" y="${petY + y * PS}" width="${PS}" height="${PS}" fill="${color}"/>`
    })
  })

  const W = 500
  const H = 260
  const moodColor = MOOD_COLORS[mood] || LCD_DARK
  const rx = 240 // right column x
  const lastCommit = daysSince === 0 ? 'TODAY' : `${daysSince}D AGO`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Commitchi pet for ${esc(USERNAME)}">
  <defs>
    <linearGradient id="shell" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff6eb4"/>
      <stop offset="1" stop-color="#ff9f43"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="26" fill="url(#shell)" stroke="#222" stroke-width="4"/>
  <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="12" fill="${LCD_BG}" stroke="#333" stroke-width="3"/>

  <text x="${W / 2}" y="40" text-anchor="middle" font-family="'Courier New',monospace" font-size="15" font-weight="bold" letter-spacing="2" fill="${LCD_DARK}">COMMITCHI</text>

  <g>
    ${pixels}
    <animateTransform attributeName="transform" type="translate" values="0 0; 0 -5; 0 0" dur="3s" repeatCount="indefinite"/>
  </g>
  <text x="${petX + 72}" y="${petY + 168}" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" font-weight="bold" fill="${moodColor}">${esc(state.moodLabel.toUpperCase())}</text>

  <text x="${rx}" y="74" font-family="'Courier New',monospace" font-size="16" font-weight="bold" fill="${LCD_DARK}">@${esc(user.login)}</text>
  <text x="${rx}" y="92" font-family="'Courier New',monospace" font-size="11" font-weight="bold" fill="${LCD_MID}">${esc((STAGE_NAMES[stage] + ' ' + SPECIES_NAMES[species]).toUpperCase())}</text>

  <rect x="${W - 74}" y="56" width="44" height="34" rx="4" fill="none" stroke="${LCD_DARK}" stroke-width="2"/>
  <text x="${W - 52}" y="71" text-anchor="middle" font-family="'Courier New',monospace" font-size="8" fill="${LCD_MID}">LVL</text>
  <text x="${W - 52}" y="85" text-anchor="middle" font-family="'Courier New',monospace" font-size="14" font-weight="bold" fill="${LCD_DARK}">${level}</text>

  <rect x="${rx}" y="104" width="${W - rx - 30}" height="8" fill="${LCD_LIGHT}" stroke="${LCD_DARK}" stroke-width="2"/>
  <rect x="${rx}" y="104" width="${Math.round((W - rx - 30) * xp.pct / 100)}" height="8" fill="${LCD_DARK}"/>
  <text x="${rx}" y="126" font-family="'Courier New',monospace" font-size="9" fill="${LCD_MID}">${xp.max ? 'MAX LEVEL' : `XP ${xp.current}/${xp.needed}`}</text>

  ${bar('HUNGER', rx, 138, 100 - state.hunger)}
  ${bar('HAPPY', rx, 156, state.happiness)}
  ${bar('HEALTH', rx, 174, state.health)}

  <line x1="${rx}" y1="196" x2="${W - 30}" y2="196" stroke="${LCD_MID}" stroke-width="1"/>
  <text x="${rx}" y="216" font-family="'Courier New',monospace" font-size="11" font-weight="bold" fill="${LCD_DARK}">STREAK ${state.streak}</text>
  <text x="${rx + 110}" y="216" font-family="'Courier New',monospace" font-size="11" font-weight="bold" fill="${LCD_DARK}">LAST ${lastCommit}</text>
  <text x="${rx}" y="234" font-family="'Courier New',monospace" font-size="10" fill="${LCD_MID}">${state.totalCommits} TOTAL COMMITS</text>
</svg>
`

  writeFileSync(OUT, svg)
  console.log(`Wrote ${OUT} - ${species} (${state.moodLabel}) lvl ${level} for @${user.login}`)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
