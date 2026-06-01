import { useState, useCallback } from 'react'

const GITHUB_API = 'https://api.github.com'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const CACHE_PREFIX = 'commitchi:'

function readCache(username) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + username.toLowerCase())
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.cachedAt > CACHE_TTL) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(username, payload) {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + username.toLowerCase(),
      JSON.stringify({ ...payload, cachedAt: Date.now() })
    )
  } catch {
    // ignore quota / disabled storage
  }
}

export function useGitHubData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cachedAt, setCachedAt] = useState(null)
  const [rateLimitReset, setRateLimitReset] = useState(null)

  const fetchUser = useCallback(async (username, { force = false } = {}) => {
    setError(null)
    setRateLimitReset(null)

    if (!force) {
      const cached = readCache(username)
      if (cached) {
        setData(cached.data)
        setCachedAt(cached.cachedAt)
        setLoading(false)
        return
      }
    }

    setLoading(true)
    setData(null)
    setCachedAt(null)

    try {
      const u = encodeURIComponent(username)
      const [userRes, eventsRes, reposRes] = await Promise.all([
        fetch(`${GITHUB_API}/users/${u}`),
        fetch(`${GITHUB_API}/users/${u}/events/public?per_page=100`),
        fetch(`${GITHUB_API}/users/${u}/repos?per_page=100&sort=pushed`),
      ])

      if (!userRes.ok) {
        if (userRes.status === 404) throw new Error(`User "${username}" not found.`)
        if (userRes.status === 403 || userRes.status === 429) {
          const remaining = userRes.headers.get('x-ratelimit-remaining')
          const reset = userRes.headers.get('x-ratelimit-reset')
          if (remaining === '0' && reset) {
            setRateLimitReset(Number(reset) * 1000)
            throw new Error('GitHub API rate limit reached.')
          }
          throw new Error('GitHub API request was forbidden. Try again shortly.')
        }
        throw new Error('Failed to fetch user data.')
      }

      const [user, events, repos] = await Promise.all([
        userRes.json(),
        eventsRes.json(),
        reposRes.json(),
      ])

      const langCounts = {}
      for (const repo of repos) {
        if (repo.language) {
          langCounts[repo.language] = (langCounts[repo.language] || 0) + 1
        }
      }
      const topLanguage = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

      const payload = { user, events: Array.isArray(events) ? events : [], repos, topLanguage }
      setData(payload)
      setCachedAt(null)
      writeCache(username, { data: payload })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, cachedAt, rateLimitReset, fetchUser }
}
