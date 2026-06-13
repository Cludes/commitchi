// Inserts or updates the Commitchi embed block in a GitHub profile README.
// Idempotent: only changes the file when the block is missing or different.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import process from 'node:process'

const owner = process.env.OWNER || process.argv[2]
const file = process.env.README || 'README.md'
// Live hosted endpoint - serves any user's card on demand (30-min edge cache),
// so no per-day commit or cache-busting token is needed. Override for a fork.
const endpoint = process.env.COMMITCHI_ENDPOINT || 'https://commitchi.pages.dev/api/card'

if (!owner) {
  console.error('Usage: OWNER=<login> [README=path] node scripts/update-profile-readme.mjs')
  process.exit(1)
}

const START = '<!-- COMMITCHI:START -->'
const END = '<!-- COMMITCHI:END -->'
const u = encodeURIComponent(owner)
const picture = [
  '<picture>',
  `  <source media="(prefers-color-scheme: dark)" srcset="${endpoint}?u=${u}&amp;theme=dark">`,
  `  <img alt="My Commitchi" src="${endpoint}?u=${u}">`,
  '</picture>',
].join('\n')
const block = `${START}\n${picture}\n${END}`

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const content = existsSync(file) ? readFileSync(file, 'utf8') : `# ${owner}\n`

let updated
if (content.includes(START) && content.includes(END)) {
  const re = new RegExp(`${escapeRegex(START)}[\\s\\S]*?${escapeRegex(END)}`)
  updated = content.replace(re, block)
} else {
  const sep = content.endsWith('\n') ? '\n' : '\n\n'
  updated = content + sep + block + '\n'
}

if (updated === content) {
  console.log('Profile README already up to date.')
  process.exit(0)
}

writeFileSync(file, updated)
console.log('Profile README updated.')
