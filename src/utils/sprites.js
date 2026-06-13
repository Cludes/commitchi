// Pixel art sprites: 16x16 grids. Built from compact strings for readability.
// Palette letters get recolored per species (O/P/S) or stay fixed (W/K/R/Y/G).
const PAL = {
  '.': null,
  O: '#7c5cfc', // outline   -> species outline
  P: '#9d82fc', // primary   -> species primary
  S: '#b8a8fc', // secondary -> species secondary/highlight
  W: '#ffffff', // white (eyes, teeth)
  K: '#000000', // black (pupils)
  R: '#ff5d8f', // pink accent (tongue/nose)
  Y: '#ffd43b', // yellow accent
  G: '#306230', // dark green accent
}

const px = (str) => str.split('').map((c) => (c in PAL ? PAL[c] : null))
const grid = (rows) => rows.map(px)

// apply pixel overrides: pts is { "y,x": <PAL letter> }
const patch = (g, pts) =>
  g.map((row, y) =>
    row.map((c, x) => {
      const key = `${y},${x}`
      if (!(key in pts)) return c
      const v = pts[key]
      return v in PAL ? PAL[v] : v
    })
  )

// a sad-frown overlay (peak middle, corners down) centered at cx, top row cy
const frown = (cx, cy) => ({
  [`${cy},${cx}`]: 'K',
  [`${cy + 1},${cx - 1}`]: 'K',
  [`${cy + 1},${cx + 1}`]: 'K',
})

// --- HAMSTER ---
const HAMSTER = grid([
  '................',
  '...O........O...',
  '..OPO......OPO..',
  '..OPPOOOOOOPPO..',
  '.OPPPPPPPPPPPPO.',
  'OPPPPPPPPPPPPPPO',
  'OPPWKPPPPPPWKPPO',
  'OPPWKPPPPPPWKPPO',
  'OPPPPPPPPPPPPPPO',
  'OPPPPPSRRSPPPPPO',
  'OPPPPPPRRPPPPPPO',
  '.OPPPPPPPPPPPPO.',
  '..OPPPPPPPPPPO..',
  '...OOPPPPPPOO...',
  '.....OOOOOO.....',
  '................',
])
const HAMSTER_SAD = patch(HAMSTER, { '9,6': '.', '9,7': '.', '9,8': '.', '9,9': '.', '10,7': '.', '10,8': '.', ...frown(7, 10) })

// --- SNAKE ---
const SNAKE = grid([
  '................',
  '....OOOO........',
  '...OPPPPO.......',
  '...OWKPPO.......',
  '...OPPPPO..RR...',
  '...OPPPPOOOR....',
  '....OOOOPPPO....',
  '.......OPPPO....',
  '......OPPPO.....',
  '......OPPO......',
  '.....OPPPO......',
  '.....OPPO.......',
  '.....OPPPOOO....',
  '......OPPPPPO...',
  '.......OOOOO....',
  '................',
])
const SNAKE_SAD = patch(SNAKE, { '4,11': '.', '4,12': '.', '5,9': '.', '5,10': '.', '3,3': 'O', '3,4': 'P', '4,4': 'K' })

// --- MOONCAT ---
const MOONCAT = grid([
  '.O............O.',
  '.OO..........OO.',
  '.OPO........OPO.',
  '.OPPOOOOOOOOPPO.',
  'OPPPPPSSSPPPPPPO',
  'OPPPPSSPPPPPPPPO',
  'OPPPPPSSSPPPPPPO',
  'OPPWKPPPPPPWKPPO',
  'OPPWKPPPPPPWKPPO',
  'OPPPPPPRRPPPPPPO',
  'OPPPPPPPPPPPPPPO',
  '.OPPPPPPPPPPPPO.',
  '..OPPPPPPPPPPO..',
  '...OOPPPPPPOO...',
  '.....OOOOOO.....',
  '................',
])
const MOONCAT_SAD = patch(MOONCAT, { '9,6': '.', '9,7': '.', ...frown(7, 10) })

// --- CRAB ---
const CRAB = grid([
  '.OO........OO...',
  'OPPO......OPPO..',
  'OPPO......OPPO..',
  '.OPPO....OPPO...',
  '..OPPOOOOPPO....',
  '...O.O..O.O.....',
  '..OWKO..OWKO....',
  '.OPPPPPPPPPPO...',
  'OPPPPPPPPPPPPO..',
  'OPPPPRRRRPPPPO..',
  'OPPPPPPPPPPPPO..',
  '.OPPPPPPPPPPO...',
  '.O.OO.OO.OO.O...',
  '.O..O..O..O.O...',
  '................',
  '................',
])
const CRAB_SAD = patch(CRAB, { '9,5': '.', '9,6': '.', '9,7': '.', '9,8': '.', '9,9': '.', '9,10': '.', ...frown(7, 9) })

// --- GOPHER ---
const GOPHER = grid([
  '................',
  '...O........O...',
  '..OPO......OPO..',
  '..OPPOOOOOOPPO..',
  '.OPPPPPPPPPPPPO.',
  'OPPPPPPPPPPPPPPO',
  'OPPWKPPPPPPWKPPO',
  'OPPWKPPPPPPWKPPO',
  'OPPPPPPRRPPPPPPO',
  'OPPPPPWWWWPPPPPO',
  '.OPPPPWWWWPPPPO.',
  '..OPPPWWWWPPPO..',
  '...OOPWWWWPOO...',
  '....OPWWWWPO....',
  '.....OOOOOO.....',
  '................',
])
const GOPHER_SAD = patch(GOPHER, { '8,6': '.', '8,7': '.', '6,4': '.', '7,4': 'K', '6,12': '.', '7,12': 'K' })

// --- GEM ---
const GEM = grid([
  '.......OO.......',
  '......OPPO......',
  '.....OPSSPO.....',
  '....OPSPPSPO....',
  '...OPSPPPPSPO...',
  '..OPSPPPPPPSPO..',
  '.OPSPPPPPPPPSPO.',
  'OPSPPPPPPPPPPSPO',
  '.OPPSPPPPPPSPPO.',
  '..OPPSPPPPSPPO..',
  '...OPPSPPSPPO...',
  '....OPPSSPPO....',
  '.....OPPPPO.....',
  '......OPPO......',
  '.......OO.......',
  '.W...........W..',
])
const GEM_SAD = patch(GEM, { '15,1': '.', '15,13': '.', '7,0': '.', '7,15': '.' })

// --- BLOB (default) ---
const BLOB = grid([
  '.....OOOOOO.....',
  '...OOPPPPPPOO...',
  '..OPPPPPPPPPPO..',
  '.OPPWPPPPPPWPPO.',
  '.OPPWKPPPPWKPPO.',
  'OPPPPPPPPPPPPPPO',
  'OPPPPPPPPPPPPPPO',
  'OPPPPPRPPPPRPPPO',
  'OPPPPPRRRRRRPPPO',
  'OPPPPPPPPPPPPPPO',
  '.OPPPPPPPPPPPPO.',
  '.OPPPPPPPPPPPPO.',
  '..OPPPPPPPPPPO..',
  '....OOPPPPOO....',
  '......OOOO......',
  '................',
])
const BLOB_SAD = patch(BLOB, { '7,5': '.', '7,10': '.', '8,5': '.', '8,6': '.', '8,7': '.', '8,8': '.', '8,9': '.', '8,10': '.', ...frown(7, 9) })

// Egg (shared, neutral)
const EGG = grid([
  '................',
  '......WWW.......',
  '....WWSSSWW.....',
  '...WSSSSSSSW....',
  '..WSSSWSSSSW....',
  '..WSSSSSSSSW....',
  '.WSSSSSSSSSSW...',
  '.WSSSSSSSSSSW...',
  '.WSSSSSSSSSSW...',
  '.WSSSSSSSSSSW...',
  '..WSSSSSSSSW....',
  '..WWSSSSSSWW....',
  '...WWWWWWWW.....',
  '................',
  '................',
  '................',
])

// Sleeping (dormant) - closed eyes, uses O/P so it tints to species color
const SLEEPING = grid([
  '................',
  '................',
  '.....OOOOOO.....',
  '...OOPPPPPPOO...',
  '..OPPPPPPPPPPO..',
  '.OPPPPPPPPPPPPO.',
  'OPPPPPPPPPPPPPPO',
  'OPPKKPPPPPPKKPPO',
  'OPPPPPPPPPPPPPPO',
  'OPPPPPPRRPPPPPPO',
  'OPPPPPPPPPPPPPPO',
  '.OPPPPPPPPPPPPO.',
  '..OPPPPPPPPPPO..',
  '...OOPPPPPPOO...',
  '.....OOOOOO.....',
  '................',
])

// Ghost (dead) - uses O/P so it tints to species color
const GHOST = grid([
  '.....OOOOOO.....',
  '...OOPPPPPPOO...',
  '..OPPPPPPPPPPO..',
  '.OPPWKPPPPWKPPO.',
  '.OPPWKPPPPWKPPO.',
  'OPPPPPPPPPPPPPPO',
  'OPPPPPPPPPPPPPPO',
  'OPPPPPPPPPPPPPPO',
  'OPPPPPPPPPPPPPPO',
  'OPPPPPPPPPPPPPPO',
  'OPPPPPPPPPPPPPPO',
  'OPPPPPPPPPPPPPPO',
  'OPPOPPOPPOPPOPPO',
  '.O..O..O..O..O..',
  '................',
  '................',
])

export const SPRITES = {
  egg: { happy: EGG, sad: EGG, dead: EGG },
  blob: { happy: BLOB, sad: BLOB_SAD, dead: GHOST },
  hamster: { happy: HAMSTER, sad: HAMSTER_SAD, dead: GHOST },
  snake: { happy: SNAKE, sad: SNAKE_SAD, dead: GHOST },
  mooncat: { happy: MOONCAT, sad: MOONCAT_SAD, dead: GHOST },
  crab: { happy: CRAB, sad: CRAB_SAD, dead: GHOST },
  gopher: { happy: GOPHER, sad: GOPHER_SAD, dead: GHOST },
  gem: { happy: GEM, sad: GEM_SAD, dead: GHOST },
}

export function getSpriteForState(species, mood, stage) {
  if (stage === 'egg') return EGG
  if (mood === 'dormant') return SLEEPING
  const set = SPRITES[species] || SPRITES.blob
  if (mood === 'dead') return set.dead
  if (mood === 'ecstatic' || mood === 'happy' || mood === 'content') return set.happy
  return set.sad
}

// --- Evolution stage decorations (drawn over the base sprite, fixed colours) ---

// Veteran: a sleek visor over the eyes.
const SHADES = grid([
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '..KKKKK..KKKKK..',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
])

// Elder: a small gold crown above the head.
const CROWN = grid([
  '.....Y.Y.Y.Y....',
  '.....YYYYYYY....',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
])

export function getStageOverlay(stage) {
  if (stage === 'adult') return SHADES
  if (stage === 'elder') return CROWN
  return null
}

// Babies render smaller than full-grown pets.
export function getStageScale(stage) {
  return stage === 'baby' ? 0.72 : 1
}

export function stageHasAura(stage) {
  return stage === 'elder'
}

export function getSpriteColors(species) {
  const map = {
    hamster: { primary: '#f4a460', secondary: '#ffe0b2', outline: '#8b5e3c' },
    snake: { primary: '#4caf50', secondary: '#a5d6a7', outline: '#2e7d32' },
    mooncat: { primary: '#5c7cfa', secondary: '#d0bfff', outline: '#364fc7' },
    crab: { primary: '#e03131', secondary: '#ff8787', outline: '#a61e1e' },
    gopher: { primary: '#22b8cf', secondary: '#99e9f2', outline: '#0b7285' },
    gem: { primary: '#e040fb', secondary: '#f3c4ff', outline: '#9c1fb5' },
    blob: { primary: '#9d82fc', secondary: '#b8a8fc', outline: '#7c5cfc' },
  }
  return map[species] || map.blob
}

export function recolorSprite(sprite, species) {
  if (species === 'blob') return sprite
  const colors = getSpriteColors(species)
  return sprite.map((row) =>
    row.map((cell) => {
      if (cell === '#7c5cfc') return colors.outline
      if (cell === '#9d82fc') return colors.primary
      if (cell === '#b8a8fc') return colors.secondary
      return cell
    })
  )
}
