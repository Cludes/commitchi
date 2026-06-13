// Shared display constants used by both the web app and the SVG card generator,
// so the two renderings can't drift apart.

export const SPECIES_NAMES = {
  hamster: 'Hamster',
  snake: 'Snake',
  mooncat: 'Moon Cat',
  crab: 'Crab',
  gopher: 'Gopher',
  gem: 'Gem',
  blob: 'Blob',
}

export const SPECIES_LIST = ['hamster', 'snake', 'mooncat', 'crab', 'gopher', 'gem', 'blob']

export const STAGE_LIST = ['egg', 'baby', 'normal', 'adult', 'elder']

export const STAGE_NAMES = {
  egg: 'Egg',
  baby: 'Baby',
  normal: 'Adult',
  adult: 'Veteran',
  elder: 'Elder',
}

// Mood accent colours tuned for the light (bright) Game Boy LCD screen.
export const MOOD_COLORS_LIGHT = {
  ecstatic: '#c2185b',
  happy: '#2a5a2a',
  content: '#0f380f',
  hungry: '#9c6a00',
  sad: '#b5531a',
  critical: '#c62828',
  dead: '#555',
  dormant: '#3a6a8a',
}

// Mood accent colours tuned for the dark (inverted) LCD screen.
export const MOOD_COLORS_DARK = {
  ecstatic: '#ff6eb4',
  happy: '#9bdb4d',
  content: '#c8f569',
  hungry: '#ffd43b',
  sad: '#ff9f43',
  critical: '#ff6b6b',
  dead: '#888',
  dormant: '#74c0fc',
}
