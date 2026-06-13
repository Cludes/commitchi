// Cloudflare Pages Function: serves the pet card SVG at /api/card.
// Deploy this repo to Cloudflare Pages (build: `npm run build`, output dir: `dist`);
// this file is picked up automatically and routed to /api/card.
//
// Embed: ![](https://<your-project>.pages.dev/api/card?u=USERNAME)
// Query: u (required), theme=dark, species=mooncat
// Optional: set a GITHUB_TOKEN environment variable to raise the API rate limit.
import { fetchCardState } from '../../src/utils/cardData.js'
import { buildCardSvg, buildErrorCard, LIGHT_THEME, DARK_THEME } from '../../src/utils/cardSvg.js'

const VALID_USER = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/

export async function onRequestGet(context) {
  const url = new URL(context.request.url)
  const username = (url.searchParams.get('u') || '').trim()
  const theme = url.searchParams.get('theme') === 'dark' ? DARK_THEME : LIGHT_THEME
  const species = url.searchParams.get('species') || undefined

  const headers = {
    'content-type': 'image/svg+xml; charset=utf-8',
    'cache-control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=600',
  }

  if (!VALID_USER.test(username)) {
    return new Response(buildErrorCard('add ?u=USERNAME', theme), { headers })
  }

  try {
    const state = await fetchCardState(username, { token: context.env?.GITHUB_TOKEN, species })
    return new Response(buildCardSvg(state, theme), { headers })
  } catch (e) {
    const msg = e.status === 404
      ? `user "${username}" not found`
      : e.status === 403
        ? 'rate limited - try again later'
        : 'could not load pet'
    return new Response(buildErrorCard(msg, theme), { headers })
  }
}
