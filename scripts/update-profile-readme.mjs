// Inserts or updates the Commitchi embed block in a GitHub profile README.
// Idempotent: only changes the file when the block is missing or different.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import process from 'node:process'

const owner = process.env.OWNER || process.argv[2]
const file = process.env.README || 'README.md'

if (!owner) {
  console.error('Usage: OWNER=<login> [README=path] node scripts/update-profile-readme.mjs')
  process.exit(1)
}

const START = '<!-- COMMITCHI:START -->'
const END = '<!-- COMMITCHI:END -->'
const img = `![My Commitchi](https://raw.githubusercontent.com/${owner}/commitchi/master/commitchi.svg)`
const block = `${START}\n${img}\n${END}`

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
