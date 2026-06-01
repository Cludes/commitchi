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

export function getEvolutionStage(level) {
  if (level <= 1) return 'egg'
  if (level <= 2) return 'baby'
  if (level <= 4) return 'normal'
  if (level <= 6) return 'adult'
  return 'elder'
}

export function getMood(daysSince, streak) {
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

export function getHappiness(streak) {
  return Math.min(100, Math.round((streak / 30) * 100))
}

export function getHealth(mood) {
  const map = { ecstatic: 100, happy: 85, content: 65, hungry: 40, sad: 20, critical: 5, dead: 0 }
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
  }
  return map[mood] || mood
}

export function getMoodMessage(mood, species) {
  const name = species.charAt(0).toUpperCase() + species.slice(1)
  const map = {
    ecstatic: `${name} is thriving! Keep the streak going!`,
    happy: `${name} is happy. Commit again soon!`,
    content: `${name} is okay. A commit would be nice...`,
    hungry: `${name} is getting hungry. Push some code!`,
    sad: `${name} is sad and hungry. Please commit something!`,
    critical: `${name} is in CRITICAL condition. PUSH CODE NOW.`,
    dead: `${name} has died. No commits in over 3 weeks. RIP.`,
  }
  return map[mood] || ''
}
