// Inserts or updates the Commitchi embed block in a GitHub profile README.
// Idempotent: only changes the file when the block is missing or different.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import process from 'node:process'

const owner = process.env.OWNER || process.argv[2]
const file = process.env.README || 'README.md'

if (!owner) {
  console.error('Usage: OWNER=<login> [README=path] node scripts/update-profile-readme.mjs')
  process.exit(1)
}

// Cache-busting token derived from the SVG contents, so GitHub's image proxy refetches
// the cards exactly when they change (and stays stable when they don't).
function cacheToken() {
  if (process.env.CACHE_BUST) return process.env.CACHE_BUST
  try {
    const hash = createHash('sha1')
    hash.update(readFileSync('commitchi.svg'))
    hash.update(readFileSync('commitchi-dark.svg'))
    return hash.digest('hex').slice(0, 8)
  } catch {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '')
  }
}

const START = '<!-- COMMITCHI:START -->'
const END = '<!-- COMMITCHI:END -->'
const base = `https://raw.githubusercontent.com/${owner}/commitchi/master`
const v = cacheToken()
const picture = [
  '<picture>',
  `  <source media="(prefers-color-scheme: dark)" srcset="${base}/commitchi-dark.svg?v=${v}">`,
  `  <img alt="My Commitchi" src="${base}/commitchi.svg?v=${v}">`,
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
