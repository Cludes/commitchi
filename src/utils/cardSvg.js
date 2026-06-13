// Shared builder for the Commitchi pet "card" SVG. Used by the Node profile-card
// generator (scripts/generate-pet-svg.mjs) and by the in-app PNG download, so the
// two renderings can't drift.
import {
  getSpriteForState, recolorSprite, getStageOverlay, getStageScale, stageHasAura,
} from './sprites.js'
import { SPECIES_NAMES, STAGE_NAMES, MOOD_COLORS_LIGHT, MOOD_COLORS_DARK } from './constants.js'

// Per-theme palettes. ink = primary text/fill, inkDim = secondary, track = empty bar.
export const LIGHT_THEME = {
  page: '#f1e8fb', shell1: '#ff6eb4', shell2: '#ff9f43', screen: '#c8f569',
  ink: '#0f380f', inkDim: '#2a5a2a', track: '#8bac0f', mood: MOOD_COLORS_LIGHT,
}
export const DARK_THEME = {
  page: '#0d0d0f', shell1: '#4a4a52', shell2: '#2a2a30', screen: '#0c2b0c',
  ink: '#c8f569', inkDim: '#7fae3f', track: '#1c3a1c', mood: MOOD_COLORS_DARK,
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function segments(t, x, y, value, segs = 10, segW = 13, segH = 9, gap = 2) {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * segs)
  let out = ''
  for (let i = 0; i < segs; i++) {
    const fill = i < filled ? t.ink : t.track
    out += `<rect x="${x + i * (segW + gap)}" y="${y}" width="${segW}" height="${segH}" fill="${fill}" stroke="${t.inkDim}" stroke-width="1"/>`
  }
  return out
}

function bar(t, label, x, y, value) {
  return (
    `<text x="${x}" y="${y + 8}" font-family="'Courier New',monospace" font-size="11" font-weight="bold" fill="${t.ink}">${label}</text>` +
    segments(t, x + 56, y, value)
  )
}

// Pet pixels with evolution scaling + stage overlay (shades / crown).
function petPixels(species, mood, stage, petX, petY) {
  const PS = 9
  const scale = getStageScale(stage)
  const sps = Math.max(1, Math.round(PS * scale))
  const off = Math.round((16 * PS - 16 * sps) / 2)
  const draw = (grid) => {
    let out = ''
    grid.forEach((row, y) => {
      row.forEach((color, x) => {
        if (!color) return
        out += `<rect x="${petX + off + x * sps}" y="${petY + off + y * sps}" width="${sps}" height="${sps}" fill="${color}"/>`
      })
    })
    return out
  }
  let out = draw(recolorSprite(getSpriteForState(species, mood, stage), species))
  const overlay = getStageOverlay(stage)
  if (overlay) out += draw(overlay)
  return out
}

// state: { username, species, stage, mood, moodLabel, level, xp, hunger, happiness,
//          health, streak, daysSince, totalCommits }
export function buildCardSvg(state, theme) {
  const {
    username, species, stage, mood, moodLabel, level, xp,
    hunger, happiness, health, streak, daysSince, totalCommits,
  } = state
  const t = theme
  const W = 500
  const H = 260
  const PAD = 14
  const CW = W + PAD * 2
  const CH = H + PAD * 2
  const rx = 240
  const petX = 34
  const petY = 70
  const lastCommit = daysSince === 0 ? 'TODAY' : `${daysSince}D AGO`
  const moodColor = t.mood[mood] || t.ink
  const pixels = petPixels(species, mood, stage, petX, petY)
  const aura = stageHasAura(stage)
    ? `<circle cx="${petX + 72}" cy="${petY + 72}" r="62" fill="#ffd43b" opacity="0.16"/>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}" role="img" aria-label="Commitchi pet for ${esc(username)}">
  <defs>
    <linearGradient id="shell" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.shell1}"/>
      <stop offset="1" stop-color="${t.shell2}"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${CW}" height="${CH}" rx="22" fill="${t.page}"/>
  <g transform="translate(${PAD}, ${PAD})">
    <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="26" fill="url(#shell)" stroke="#222" stroke-width="4"/>
    <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="12" fill="${t.screen}" stroke="#333" stroke-width="3"/>

    <text x="${W / 2}" y="40" text-anchor="middle" font-family="'Courier New',monospace" font-size="15" font-weight="bold" letter-spacing="2" fill="${t.ink}">COMMITCHI</text>

    ${aura}
    <g>
      ${pixels}
      <animateTransform attributeName="transform" type="translate" values="0 0; 0 -5; 0 0" dur="3s" repeatCount="indefinite"/>
    </g>
    <text x="${petX + 72}" y="${petY + 168}" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" font-weight="bold" fill="${moodColor}">${esc(moodLabel.toUpperCase())}</text>

    <text x="${rx}" y="74" font-family="'Courier New',monospace" font-size="16" font-weight="bold" fill="${t.ink}">@${esc(username)}</text>
    <text x="${rx}" y="92" font-family="'Courier New',monospace" font-size="11" font-weight="bold" fill="${t.inkDim}">${esc((STAGE_NAMES[stage] + ' ' + SPECIES_NAMES[species]).toUpperCase())}</text>

    <rect x="${W - 74}" y="56" width="44" height="34" rx="4" fill="none" stroke="${t.ink}" stroke-width="2"/>
    <text x="${W - 52}" y="71" text-anchor="middle" font-family="'Courier New',monospace" font-size="8" fill="${t.inkDim}">LVL</text>
    <text x="${W - 52}" y="85" text-anchor="middle" font-family="'Courier New',monospace" font-size="14" font-weight="bold" fill="${t.ink}">${level}</text>

    <rect x="${rx}" y="104" width="${W - rx - 30}" height="8" fill="${t.track}" stroke="${t.ink}" stroke-width="2"/>
    <rect x="${rx}" y="104" width="${Math.round((W - rx - 30) * xp.pct / 100)}" height="8" fill="${t.ink}"/>
    <text x="${rx}" y="126" font-family="'Courier New',monospace" font-size="9" fill="${t.inkDim}">${xp.max ? 'MAX LEVEL' : `XP ${xp.current}/${xp.needed}`}</text>

    ${bar(t, 'HUNGER', rx, 138, 100 - hunger)}
    ${bar(t, 'HAPPY', rx, 156, happiness)}
    ${bar(t, 'HEALTH', rx, 174, health)}

    <line x1="${rx}" y1="196" x2="${W - 30}" y2="196" stroke="${t.inkDim}" stroke-width="1"/>
    <text x="${rx}" y="216" font-family="'Courier New',monospace" font-size="11" font-weight="bold" fill="${t.ink}">STREAK ${streak}</text>
    <text x="${rx + 110}" y="216" font-family="'Courier New',monospace" font-size="11" font-weight="bold" fill="${t.ink}">LAST ${lastCommit}</text>
    <text x="${rx}" y="234" font-family="'Courier New',monospace" font-size="10" fill="${t.inkDim}">${totalCommits} TOTAL COMMITS</text>
  </g>
</svg>
`
}
