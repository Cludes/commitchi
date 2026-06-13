const LANGUAGE_TO_SPECIES = {
  JavaScript: 'hamster',
  TypeScript: 'hamster',
  Python: 'snake',
  Lua: 'mooncat',
  Rust: 'crab',
  Go: 'gopher',
  Ruby: 'gem',
  Java: 'blob',
  'C#': 'blob',
  'C++': 'blob',
  default: 'blob',
}

export function getSpecies(topLanguage) {
  return LANGUAGE_TO_SPECIES[topLanguage] || LANGUAGE_TO_SPECIES.default
}

export function getDaysSinceLastCommit(events) {
  const pushEvents = events.filter(e => e.type === 'PushEvent')
  if (pushEvents.length === 0) return 99
  const last = new Date(pushEvents[0].created_at)
  const now = new Date()
  return Math.floor((now - last) / (1000 * 60 * 60 * 24))
}

export function getCurrentStreak(events) {
  const pushDates = events
    .filter(e => e.type === 'PushEvent')
    .map(e => new Date(e.created_at).toDateString())
  const unique = [...new Set(pushDates)]
  if (unique.length === 0) return 0

  let streak = 0
  const today = new Date()
  for (let i = 0; i < 90; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (unique.includes(d.toDateString())) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

const LEVEL_THRESHOLDS = [0, 10, 50, 150, 400, 1000, 2500, 5000]
const MAX_LEVEL = LEVEL_THRESHOLDS.length

export function getLevel(totalCommits) {
  if (totalCommits < 10) return 1
  if (totalCommits < 50) return 2
  if (totalCommits < 150) return 3
  if (totalCommits < 400) return 4
  if (totalCommits < 1000) return 5
  if (totalCommits < 2500) return 6
  if (totalCommits < 5000) return 7
  return 8
}

export function getXPProgress(totalCommits) {
  const level = getLevel(totalCommits)
  if (level >= MAX_LEVEL) {
    return { pct: 100, current: totalCommits, needed: totalCommits, max: true }
  }
  const floor = LEVEL_THRESHOLDS[level - 1]
  const ceil = LEVEL_THRESHOLDS[level]
  const current = totalCommits - floor
  const needed = ceil - floor
  return { pct: Math.round((current / needed) * 100), current, needed, max: false }
}

// Map of toDateString() -> commit count, from PushEvents
export function getDailyCommits(events) {
  const counts = {}
  events
    .filter((e) => e.type === 'PushEvent')
    .forEach((e) => {
      const key = new Date(e.created_at).toDateString()
      counts[key] = (counts[key] || 0) + (e.payload?.commits?.length || 1)
    })
  return counts
}

// Representative commit totals for each stage, used only for visual previews.
const STAGE_PREVIEW_COMMITS = { egg: 5, baby: 30, normal: 120, adult: 700, elder: 3000 }

// Returns a copy of a pet showing the given stage (level + xp adjusted to match) for
// PREVIEW only. Does not touch real stats, mood, achievements, or the profile card.
export function applyStagePreview(pet, stage) {
  if (!pet || !stage || !(stage in STAGE_PREVIEW_COMMITS)) return pet
  const commits = STAGE_PREVIEW_COMMITS[stage]
  return { ...pet, stage, level: getLevel(commits), xp: getXPProgress(commits) }
}

export function getEvolutionStage(level) {
  if (level <= 1) return 'egg'
  if (level <= 2) return 'baby'
  if (level <= 4) return 'normal'
  if (level <= 6) return 'adult'
  return 'elder'
}

export function getMood(daysSince, streak, hasActivity = true) {
  if (!hasActivity) return 'dormant'
  if (daysSince >= 21) return 'dead'
  if (daysSince >= 11) return 'critical'
  if (daysSince >= 7) return 'sad'
  if (daysSince >= 4) return 'hungry'
  if (daysSince >= 2) return 'content'
  if (streak >= 7) return 'ecstatic'
  return 'happy'
}

export function getHunger(daysSince) {
  return Math.min(100, Math.round((daysSince / 21) * 100))
}

// Happiness = a base level set by how the pet currently feels (mood), plus a streak
// bonus that fills the remainder toward 100 as the streak approaches 30 days.
const MOOD_HAPPINESS_BASE = {
  ecstatic: 90, happy: 60, content: 45, hungry: 30, sad: 15, critical: 5, dead: 0, dormant: 0,
}

export function getHappiness(streak, mood = 'happy') {
  const base = MOOD_HAPPINESS_BASE[mood] ?? 50
  const streakBonus = Math.round((Math.min(streak, 30) / 30) * (100 - base))
  return Math.min(100, base + streakBonus)
}

export function getHealth(mood) {
  const map = { ecstatic: 100, happy: 85, content: 65, hungry: 40, sad: 20, critical: 5, dead: 0, dormant: 50 }
  return map[mood] ?? 50
}

export function getTotalCommits(events) {
  return events.filter(e => e.type === 'PushEvent').reduce((sum, e) => {
    return sum + (e.payload?.commits?.length || 1)
  }, 0)
}

export function getMoodLabel(mood) {
  const map = {
    ecstatic: 'Ecstatic',
    happy: 'Happy',
    content: 'Content',
    hungry: 'Hungry',
    sad: 'Sad',
    critical: '!! Critical !!',
    dead: 'Dead',
    dormant: 'Dormant',
  }
  return map[mood] || mood
}

// Milestone achievements derived from a pet's stats. `short` is the badge label.
export function getAchievements({ totalCommits = 0, streak = 0, level = 1, languageCount = 0 } = {}) {
  return [
    { id: 'first', short: 'GIT', label: 'First Commit', earned: totalCommits >= 1 },
    { id: 'streak7', short: '7D', label: '7-Day Streak', earned: streak >= 7 },
    { id: 'streak30', short: '30D', label: '30-Day Streak', earned: streak >= 30 },
    { id: 'c100', short: '100', label: '100 Commits', earned: totalCommits >= 100 },
    { id: 'c1000', short: '1K', label: '1000 Commits', earned: totalCommits >= 1000 },
    { id: 'polyglot', short: 'POLY', label: 'Polyglot (3+ langs)', earned: languageCount >= 3 },
    { id: 'maxlevel', short: 'MAX', label: 'Max Level', earned: level >= 8 },
  ]
}

// Returns an array of message variants for a mood (cycled by the device button).
export function getMoodMessages(mood, species) {
  const name = species.charAt(0).toUpperCase() + species.slice(1)
  const map = {
    ecstatic: [
      `${name} is thriving! Keep the streak going!`,
      `${name} has never been happier.`,
      `On fire! ${name} loves your commits.`,
    ],
    happy: [
      `${name} is happy. Commit again soon!`,
      `${name} is in good spirits.`,
      `${name} is content with your pace.`,
    ],
    content: [
      `${name} is okay. A commit would be nice...`,
      `${name} is getting a little restless.`,
      `${name} is waiting patiently.`,
    ],
    hungry: [
      `${name} is getting hungry. Push some code!`,
      `${name}'s tummy is rumbling.`,
      `Feed ${name} a commit!`,
    ],
    sad: [
      `${name} is sad and hungry. Please commit something!`,
      `${name} misses your commits.`,
      `${name} looks downcast.`,
    ],
    critical: [
      `${name} is in CRITICAL condition. PUSH CODE NOW.`,
      `${name} is fading. Commit immediately!`,
      `Emergency! ${name} needs commits!`,
    ],
    dead: [
      `${name} has died. No commits in over 3 weeks. RIP.`,
      `${name} is gone. Push code to revive it.`,
    ],
    dormant: [
      `${name} is dormant. No public commits yet.`,
      `Push public code to wake ${name} up!`,
    ],
  }
  return map[mood] || ['']
}
