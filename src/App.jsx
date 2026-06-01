import { useEffect, useRef, useState } from 'react'
import { SearchForm } from './components/SearchForm'
import { PetCanvas } from './components/PetCanvas'
import { StatusBar } from './components/StatusBar'
import { ActivityFeed } from './components/ActivityFeed'
import { Heatmap } from './components/Heatmap'
import { useGitHubData } from './hooks/useGitHubData'
import { usePetState } from './hooks/usePetState'
import './App.css'

const SPECIES_NAMES = {
  hamster: 'Hamster',
  snake: 'Snake',
  mooncat: 'Moon Cat',
  crab: 'Crab',
  gopher: 'Gopher',
  gem: 'Gem',
  blob: 'Blob',
}

const STAGE_NAMES = {
  egg: 'Egg',
  baby: 'Baby',
  normal: 'Adult',
  adult: 'Veteran',
  elder: 'Elder',
}

const MOOD_COLORS = {
  ecstatic: '#ff6eb4',
  happy: '#306230',
  content: '#0f380f',
  hungry: '#c98a00',
  sad: '#cf6a1f',
  critical: '#ff4d4d',
  dead: '#666',
  dormant: '#3a6a8a',
}

const RECENT_KEY = 'commitchi:recent'
const MAX_RECENT = 5

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable
  }
}

function XpBar({ xp, level }) {
  return (
    <div className="xp-block">
      <div className="xp-track">
        <div className="xp-fill" style={{ width: `${xp.pct}%` }} />
      </div>
      <span className="xp-text">
        {xp.max ? 'MAX LEVEL' : `XP ${xp.current}/${xp.needed} - NEXT LVL ${level + 1}`}
      </span>
    </div>
  )
}

// Remounted (via key) whenever the viewed user changes, so it reads the right name.
function PetName({ username, species }) {
  const key = `commitchi:name:${username.toLowerCase()}`
  const [name, setName] = useState(() => readJSON(key, ''))
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  const save = () => {
    const trimmed = draft.trim().slice(0, 20)
    setName(trimmed)
    writeJSON(key, trimmed)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        className="pet-name-input"
        value={draft}
        autoFocus
        maxLength={20}
        placeholder={`Name your ${SPECIES_NAMES[species]}`}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') setEditing(false)
        }}
      />
    )
  }

  return (
    <button className="pet-name-btn" onClick={() => setEditing(true)} title="Click to rename">
      {name || '+ name your pet'}
    </button>
  )
}

// Remounted (via key) per user, so msgIndex / heatmap visibility reset naturally.
function Device({ pet }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const petRef = useRef(null)

  const isDead = pet.mood === 'dead'
  const moodColor = MOOD_COLORS[pet.mood] || '#0f380f'
  const message = pet.moodMessages[msgIndex % pet.moodMessages.length]
  const ariaLabel = `${pet.username}'s ${SPECIES_NAMES[pet.species]}, ${pet.moodLabel.replace(/!/g, '').trim().toLowerCase()}, level ${pet.level}`

  return (
    <div className="device">
      <div className="device-screen">
        <div className={`screen-content ${pet.mood === 'critical' ? 'critical-flash' : ''}`}>
          <div className="pet-header">
            <div className="pet-name-block">
              <div className="pet-name-row">
                {pet.avatar && (
                  <img
                    className="pet-avatar"
                    src={pet.avatar}
                    alt=""
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                )}
                <span className="pet-username">@{pet.username}</span>
              </div>
              <PetName username={pet.username} species={pet.species} />
              <span className="pet-species">
                {STAGE_NAMES[pet.stage]} {SPECIES_NAMES[pet.species]}
              </span>
            </div>
            <div className="pet-level-block">
              <span className="pet-level-label">LVL</span>
              <span className="pet-level">{pet.level}</span>
            </div>
          </div>

          <XpBar xp={pet.xp} level={pet.level} />

          <div className="pet-stage">
            <PetCanvas
              ref={petRef}
              species={pet.species}
              mood={pet.mood}
              stage={pet.stage}
              ariaLabel={ariaLabel}
            />
            <div className="pet-mood-block">
              <span className="pet-mood-dot" style={{ background: moodColor }} />
              <span className="pet-mood-label" style={{ color: moodColor }}>
                {pet.moodLabel}
              </span>
            </div>
            <p className="pet-message">{message}</p>
          </div>

          <div className="stats-block">
            <StatusBar label="Hunger" value={100 - pet.hunger} />
            <StatusBar label="Happy" value={pet.happiness} />
            <StatusBar label="Health" value={pet.health} />
          </div>

          <div className="streak-row">
            <div className="streak-item">
              <span className="streak-value">{pet.streak}</span>
              <span className="streak-label">streak</span>
            </div>
            <div className="streak-divider" />
            <div className="streak-item">
              <span className="streak-value">
                {pet.isDormant ? '-' : pet.daysSince === 0 ? 'TODAY' : `${pet.daysSince}D`}
              </span>
              <span className="streak-label">last commit</span>
            </div>
            <div className="streak-divider" />
            <div className="streak-item">
              <span className="streak-value">{pet.totalCommits}</span>
              <span className="streak-label">commits</span>
            </div>
          </div>

          {showHeatmap && <Heatmap dailyCommits={pet.dailyCommits} />}

          {!isDead && !pet.isDormant && <ActivityFeed activity={pet.recentActivity} />}

          {pet.isDormant && (
            <div className="death-message">
              <p>This pet is dormant.</p>
              <p>No public commit activity found. Push some public code to wake it up.</p>
            </div>
          )}

          {isDead && (
            <div className="death-message">
              <p>Your pet has passed away.</p>
              <p>No commits in over 21 days. Push code to revive it.</p>
            </div>
          )}
        </div>
      </div>

      <div className="device-controls">
        <div className="device-buttons">
          <button
            className="dev-btn red"
            onClick={() => setMsgIndex((i) => i + 1)}
            aria-label="Next message"
            title="Next message"
          />
          <button
            className="dev-btn yellow"
            onClick={() => petRef.current?.feed()}
            aria-label="Pet your creature"
            title="Pet / feed"
          />
          <button
            className="dev-btn green"
            onClick={() => setShowHeatmap((v) => !v)}
            aria-label="Toggle activity heatmap"
            title="Toggle heatmap"
          />
        </div>
        <div className="device-speaker">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}

function ShareButton() {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked - ignore
    }
  }

  return (
    <button className="share-btn" onClick={handleShare}>
      {copied ? 'COPIED!' : 'SHARE YOUR PET'}
    </button>
  )
}

function Countdown({ resetAt }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const secs = Math.max(0, Math.round((resetAt - now) / 1000))
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return <span>try again in {m}m {String(s).padStart(2, '0')}s</span>
}

function getInitialTheme() {
  try {
    const stored = localStorage.getItem('commitchi:theme')
    if (stored === 'light' || stored === 'dark') return stored
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  } catch {
    // storage / matchMedia unavailable
  }
  return 'light'
}

export default function App() {
  const { data, loading, error, cachedAt, rateLimitReset, fetchUser } = useGitHubData()
  const pet = usePetState(data)
  const [theme, setTheme] = useState(getInitialTheme)
  const [recent, setRecent] = useState(() => readJSON(RECENT_KEY, []))
  const [levelUp, setLevelUp] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const u = params.get('u')
    if (u) fetchUser(u)
  }, [fetchUser])

  useEffect(() => {
    try {
      localStorage.setItem('commitchi:theme', theme)
    } catch {
      // storage unavailable
    }
  }, [theme])

  // Level-up detection: compare to last-seen level for this user. setState is deferred
  // (timeout) so it is not a synchronous cascade inside the effect.
  useEffect(() => {
    if (!pet) return
    const lvlKey = `commitchi:lvl:${pet.username.toLowerCase()}`
    const prevLevel = readJSON(lvlKey, null)
    writeJSON(lvlKey, pet.level)
    if (prevLevel != null && pet.level > prevLevel) {
      const show = setTimeout(() => setLevelUp(true), 0)
      const hide = setTimeout(() => setLevelUp(false), 3000)
      return () => {
        clearTimeout(show)
        clearTimeout(hide)
      }
    }
  }, [pet])

  const addRecent = (username) => {
    setRecent((prev) => {
      const next = [username, ...prev.filter((u) => u.toLowerCase() !== username.toLowerCase())].slice(0, MAX_RECENT)
      writeJSON(RECENT_KEY, next)
      return next
    })
  }

  const handleSearch = (username) => {
    const url = new URL(window.location.href)
    url.searchParams.set('u', username)
    window.history.pushState({}, '', url)
    addRecent(username)
    fetchUser(username)
  }

  const handleRefresh = () => {
    if (pet) fetchUser(pet.username, { force: true })
  }

  return (
    <div className="app" data-theme={theme}>
      <div className="theme-toggle" role="group" aria-label="Theme">
        <button
          className={theme === 'light' ? 'active' : ''}
          onClick={() => setTheme('light')}
          aria-pressed={theme === 'light'}
        >
          LIGHT
        </button>
        <button
          className={theme === 'dark' ? 'active' : ''}
          onClick={() => setTheme('dark')}
          aria-pressed={theme === 'dark'}
        >
          DARK
        </button>
      </div>

      {levelUp && <div className="toast" role="status">LEVEL UP!</div>}

      <header className="app-header">
        <h1 className="logo">
          COMMITCHI<span className="logo-cursor">_</span>
        </h1>
        <p className="logo-sub">YOUR COMMITS. YOUR CREATURE.</p>
      </header>

      <main className="app-main">
        <SearchForm onSearch={handleSearch} loading={loading} />

        {recent.length > 0 && !loading && (
          <div className="recent-row" aria-label="Recent searches">
            {recent.map((u) => (
              <button key={u} className="recent-chip" onClick={() => handleSearch(u)}>
                {u}
              </button>
            ))}
          </div>
        )}

        {pet && !loading && (
          <div className="data-note">
            <span>{cachedAt ? 'cached' : 'live'}</span>
            <button className="refresh-btn" onClick={handleRefresh} title="Refresh from GitHub">
              refresh
            </button>
          </div>
        )}

        {loading && (
          <div className="skeleton-device" aria-hidden="true">
            <div className="skeleton-screen">
              <div className="skeleton-line w60" />
              <div className="skeleton-line w40" />
              <div className="skeleton-blob" />
              <div className="skeleton-line w80" />
              <div className="skeleton-line w70" />
            </div>
            <p className="skeleton-label">HATCHING...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <span className="error-icon">!</span>
            <div className="error-body">
              <p>{rateLimitReset ? 'GitHub API rate limit reached.' : error}</p>
              {rateLimitReset && (
                <p className="error-sub"><Countdown resetAt={rateLimitReset} /></p>
              )}
              {pet && (
                <button className="retry-btn" onClick={handleRefresh}>RETRY</button>
              )}
            </div>
          </div>
        )}

        {pet && !loading && (
          <>
            <Device key={pet.username} pet={pet} />
            <ShareButton />
          </>
        )}

        {!pet && !loading && !error && (
          <div className="empty-state">
            <div className="empty-egg">&#9671;</div>
            <p>ENTER A GITHUB USERNAME TO HATCH YOUR PET</p>
            <p className="empty-hint">It lives or dies based on your commit activity.</p>
          </div>
        )}
      </main>

      <footer className="app-footer">FEED IT. KEEP IT ALIVE.</footer>
    </div>
  )
}
