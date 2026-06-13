// Generates self-contained light + dark SVG cards of a user's Commitchi pet for
// embedding in a GitHub profile README. Reuses the shared fetch + card builder.
import { writeFileSync } from 'node:fs'
import process from 'node:process'
import { fetchCardState } from '../src/utils/cardData.js'
import { buildCardSvg, LIGHT_THEME, DARK_THEME } from '../src/utils/cardSvg.js'

const USERNAME = process.env.COMMITCHI_USER || process.argv[2]
const OUT = process.env.OUT || 'commitchi.svg'

if (!USERNAME) {
  console.error('Usage: COMMITCHI_USER=<login> node scripts/generate-pet-svg.mjs')
  process.exit(1)
}

async function main() {
  const state = await fetchCardState(USERNAME, {
    token: process.env.GITHUB_TOKEN,
    species: process.env.COMMITCHI_SPECIES,
  })

  const darkOut = OUT.replace(/\.svg$/, '-dark.svg')
  writeFileSync(OUT, buildCardSvg(state, LIGHT_THEME))
  writeFileSync(darkOut, buildCardSvg(state, DARK_THEME))
  console.log(`Wrote ${OUT} + ${darkOut} - ${state.species} (${state.moodLabel}) lvl ${state.level} for @${state.username}`)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
