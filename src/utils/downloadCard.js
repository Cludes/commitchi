import { buildCardSvg, LIGHT_THEME, DARK_THEME } from './cardSvg'

const CARD_W = 528
const CARD_H = 288

function petToCardState(pet) {
  return {
    username: pet.username,
    species: pet.species,
    stage: pet.stage,
    mood: pet.mood,
    moodLabel: pet.moodLabel,
    level: pet.level,
    xp: pet.xp,
    hunger: pet.hunger,
    happiness: pet.happiness,
    health: pet.health,
    streak: pet.streak,
    daysSince: pet.daysSince,
    totalCommits: pet.totalCommits,
  }
}

// Render the pet card SVG to a PNG and trigger a download.
export async function downloadPetCard(pet, theme = 'light') {
  const svg = buildCardSvg(petToCardState(pet), theme === 'dark' ? DARK_THEME : LIGHT_THEME)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  try {
    const img = new Image()
    img.decoding = 'async'
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })

    const scale = 2
    const canvas = document.createElement('canvas')
    canvas.width = CARD_W * scale
    canvas.height = CARD_H * scale
    const ctx = canvas.getContext('2d')
    ctx.scale(scale, scale)
    ctx.drawImage(img, 0, 0, CARD_W, CARD_H)

    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `commitchi-${pet.username}.png`
    a.click()
  } finally {
    URL.revokeObjectURL(url)
  }
}
