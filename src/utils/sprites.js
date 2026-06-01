// Pixel art sprites: 16x16 grids. Each value is a hex color or null (transparent).
const T = null

// --- BLOB (default) ---
const BLOB_NORMAL = [
  [T,T,T,T,T,'#7c5cfc','#7c5cfc','#7c5cfc','#7c5cfc','#7c5cfc','#7c5cfc',T,T,T,T,T],
  [T,T,T,'#7c5cfc','#7c5cfc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#7c5cfc','#7c5cfc',T,T,T],
  [T,T,'#7c5cfc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#7c5cfc',T,T],
  [T,'#7c5cfc','#9d82fc','#9d82fc','#ffffff','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#ffffff','#9d82fc','#9d82fc','#9d82fc','#7c5cfc',T],
  [T,'#7c5cfc','#9d82fc','#9d82fc','#ffffff','#000000','#9d82fc','#9d82fc','#9d82fc','#ffffff','#000000','#9d82fc','#9d82fc','#9d82fc','#7c5cfc',T],
  ['#7c5cfc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#7c5cfc'],
  ['#7c5cfc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#7c5cfc'],
  ['#7c5cfc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#ff4d4d','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#ff4d4d','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#7c5cfc'],
  ['#7c5cfc','#9d82fc','#9d82fc','#9d82fc','#ff4d4d','#ff4d4d','#ff4d4d','#9d82fc','#9d82fc','#ff4d4d','#ff4d4d','#ff4d4d','#9d82fc','#9d82fc','#9d82fc','#7c5cfc'],
  ['#7c5cfc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#7c5cfc'],
  [T,'#7c5cfc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#7c5cfc',T],
  [T,'#7c5cfc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#7c5cfc',T],
  [T,T,'#7c5cfc','#7c5cfc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#7c5cfc','#7c5cfc',T,T],
  [T,T,T,T,'#7c5cfc','#7c5cfc','#9d82fc','#9d82fc','#9d82fc','#9d82fc','#7c5cfc','#7c5cfc',T,T,T,T],
  [T,T,T,T,T,T,'#7c5cfc','#7c5cfc','#7c5cfc','#7c5cfc',T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
]

// Sad blob - droopy eyes
const BLOB_SAD = BLOB_NORMAL.map((row, y) => row.map((cell, x) => {
  // Replace red mouth pixels with downward frown
  if (y === 7 && (x === 5 || x === 10)) return '#9d82fc'
  if (y === 8 && (x === 4 || x === 5 || x === 6 || x === 9 || x === 10 || x === 11)) return '#9d82fc'
  if (y === 9 && (x === 5 || x === 10)) return '#ff4d4d'
  if (y === 10 && (x === 4 || x === 5 || x === 6 || x === 9 || x === 10 || x === 11)) return '#ff4d4d'
  return cell
}))

// Egg
const EGG = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,'#e8e8e8','#e8e8e8','#e8e8e8',T,T,T,T,T,T,T],
  [T,T,T,T,'#e8e8e8','#e8e8e8','#f5f5f5','#f5f5f5','#f5f5f5','#e8e8e8',T,T,T,T,T,T],
  [T,T,T,'#e8e8e8','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#e8e8e8',T,T,T,T,T],
  [T,T,'#e8e8e8','#f5f5f5','#f5f5f5','#ffffff','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#e8e8e8',T,T,T,T],
  [T,T,'#e8e8e8','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#e8e8e8',T,T,T,T],
  [T,'#e8e8e8','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#e8e8e8',T,T,T],
  [T,'#e8e8e8','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#e8e8e8',T,T,T],
  [T,'#e8e8e8','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#e8e8e8',T,T,T],
  [T,'#e8e8e8','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#e8e8e8',T,T,T],
  [T,T,'#e8e8e8','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#e8e8e8',T,T,T,T],
  [T,T,'#e8e8e8','#e8e8e8','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#f5f5f5','#e8e8e8','#e8e8e8',T,T,T,T],
  [T,T,T,'#e8e8e8','#e8e8e8','#e8e8e8','#e8e8e8','#e8e8e8','#e8e8e8','#e8e8e8','#e8e8e8',T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
]

// Ghost (dead)
const GHOST = [
  [T,T,T,T,T,'#aaaaaa','#aaaaaa','#aaaaaa','#aaaaaa','#aaaaaa','#aaaaaa',T,T,T,T,T],
  [T,T,T,'#aaaaaa','#aaaaaa','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#aaaaaa','#aaaaaa',T,T,T],
  [T,T,'#aaaaaa','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#aaaaaa',T,T],
  [T,'#aaaaaa','#cccccc','#cccccc','#ffffff','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#ffffff','#cccccc','#cccccc','#cccccc','#aaaaaa',T],
  [T,'#aaaaaa','#cccccc','#cccccc','#ffffff','#000000','#cccccc','#cccccc','#cccccc','#ffffff','#000000','#cccccc','#cccccc','#cccccc','#aaaaaa',T],
  ['#aaaaaa','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#aaaaaa'],
  ['#aaaaaa','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#aaaaaa'],
  ['#aaaaaa','#cccccc','#cccccc','#cccccc','#aaaaaa','#cccccc','#aaaaaa','#cccccc','#cccccc','#aaaaaa','#cccccc','#aaaaaa','#cccccc','#cccccc','#cccccc','#aaaaaa'],
  ['#aaaaaa','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#aaaaaa'],
  ['#aaaaaa','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#aaaaaa'],
  ['#aaaaaa','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#cccccc','#aaaaaa'],
  ['#aaaaaa','#cccccc','#aaaaaa','#cccccc','#aaaaaa','#cccccc','#aaaaaa','#cccccc','#aaaaaa','#cccccc','#aaaaaa','#cccccc','#aaaaaa','#cccccc','#aaaaaa','#aaaaaa'],
  [T,'#aaaaaa',T,'#aaaaaa',T,'#aaaaaa',T,'#aaaaaa',T,'#aaaaaa',T,'#aaaaaa',T,'#aaaaaa',T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
]

export const SPRITES = {
  egg: { normal: EGG, happy: EGG, sad: EGG, dead: EGG },
  blob: { normal: BLOB_NORMAL, happy: BLOB_NORMAL, sad: BLOB_SAD, dead: GHOST },
  hamster: { normal: BLOB_NORMAL, happy: BLOB_NORMAL, sad: BLOB_SAD, dead: GHOST },
  snake: { normal: BLOB_NORMAL, happy: BLOB_NORMAL, sad: BLOB_SAD, dead: GHOST },
  mooncat: { normal: BLOB_NORMAL, happy: BLOB_NORMAL, sad: BLOB_SAD, dead: GHOST },
  crab: { normal: BLOB_NORMAL, happy: BLOB_NORMAL, sad: BLOB_SAD, dead: GHOST },
  gopher: { normal: BLOB_NORMAL, happy: BLOB_NORMAL, sad: BLOB_SAD, dead: GHOST },
  gem: { normal: BLOB_NORMAL, happy: BLOB_NORMAL, sad: BLOB_SAD, dead: GHOST },
}

export function getSpriteForState(species, mood, stage) {
  if (stage === 'egg') return SPRITES.egg.normal
  if (mood === 'dead') return SPRITES[species]?.dead || GHOST
  if (mood === 'ecstatic' || mood === 'happy' || mood === 'content') return SPRITES[species]?.happy || BLOB_NORMAL
  return SPRITES[species]?.sad || BLOB_SAD
}

export function getSpriteColors(species) {
  const map = {
    hamster: { primary: '#f4a460', secondary: '#deb887', outline: '#8b5e3c' },
    snake: { primary: '#4caf50', secondary: '#81c784', outline: '#2e7d32' },
    mooncat: { primary: '#5c7cfa', secondary: '#74c0fc', outline: '#364fc7' },
    crab: { primary: '#e03131', secondary: '#ff6b6b', outline: '#a61e1e' },
    gopher: { primary: '#00bcd4', secondary: '#80deea', outline: '#00838f' },
    gem: { primary: '#e040fb', secondary: '#ea80fc', outline: '#aa00ff' },
    blob: { primary: '#7c5cfc', secondary: '#9d82fc', outline: '#4c3d9e' },
  }
  return map[species] || map.blob
}

export function recolorSprite(sprite, species) {
  if (species === 'blob') return sprite
  const colors = getSpriteColors(species)
  return sprite.map(row => row.map(cell => {
    if (cell === '#7c5cfc') return colors.outline
    if (cell === '#9d82fc') return colors.primary
    if (cell === '#b8a8fc') return colors.secondary
    return cell
  }))
}
