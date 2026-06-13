// Zero-setup hosted card endpoint. Deploy this repo to Vercel and anyone can embed
// their pet with: ![](https://<your-project>.vercel.app/api/card?u=USERNAME)
//
// Query params: u (required), theme=dark, species=mooncat
// Optional env: GITHUB_TOKEN (raises the GitHub API rate limit)
import process from 'node:process'
import { fetchCardState } from '../src/utils/cardData.js'
import { buildCardSvg, buildErrorCard, LIGHT_THEME, DARK_THEME } from '../src/utils/cardSvg.js'

const VALID_USER = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/

export default async function handler(req, res) {
  const q = req.query || {}
  const username = String(q.u || '').trim()
  const theme = String(q.theme || '') === 'dark' ? DARK_THEME : LIGHT_THEME
  const species = q.species ? String(q.species) : undefined

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=600')

  if (!VALID_USER.test(username)) {
    res.status(200).send(buildErrorCard('add ?u=USERNAME', theme))
    return
  }

  try {
    const state = await fetchCardState(username, { token: process.env.GITHUB_TOKEN, species })
    res.status(200).send(buildCardSvg(state, theme))
  } catch (e) {
    const msg = e.status === 404
      ? `user "${username}" not found`
      : e.status === 403
        ? 'rate limited - try again later'
        : 'could not load pet'
    res.status(200).send(buildErrorCard(msg, theme))
  }
}
