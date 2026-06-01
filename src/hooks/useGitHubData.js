import { useState, useCallback } from 'react'

const GITHUB_API = 'https://api.github.com'

export function useGitHubData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchUser = useCallback(async (username) => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const [userRes, eventsRes, reposRes] = await Promise.all([
        fetch(`${GITHUB_API}/users/${username}`),
        fetch(`${GITHUB_API}/users/${username}/events/public?per_page=100`),
        fetch(`${GITHUB_API}/users/${username}/repos?per_page=100&sort=pushed`),
      ])

      if (!userRes.ok) {
        if (userRes.status === 404) throw new Error(`User "${username}" not found.`)
        if (userRes.status === 403) throw new Error('GitHub API rate limit hit. Try again in a minute.')
        throw new Error('Failed to fetch user data.')
      }

      const [user, events, repos] = await Promise.all([
        userRes.json(),
        eventsRes.json(),
        reposRes.json(),
      ])

      // Tally languages from repos
      const langCounts = {}
      for (const repo of repos) {
        if (repo.language) {
          langCounts[repo.language] = (langCounts[repo.language] || 0) + 1
        }
      }
      const topLanguage = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

      setData({ user, events: Array.isArray(events) ? events : [], repos, topLanguage })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetchUser }
}
