import { useEffect, useState } from 'react'
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

function PetScreen({ pet }) {
  const isAlive = pet.mood !== 'dead'
  const moodColor = MOOD_COLORS[pet.mood] || '#0f380f'

  return (
    <div className={`screen-content ${pet.mood === 'critical' ? 'critical-flash' : ''}`}>
      <div className="pet-header">
        <div className="pet-name-block">
          <div className="pet-name-row">
            {pet.avatar && <img className="pet-avatar" src={pet.avatar} alt="" />}
            <span className="pet-username">@{pet.username}</span>
          </div>
          <span className="pet-species">
            {STAGE_NAMES[pet.stage]} {SPECIES_NAMES[pet.species]}
          </span>
          {pet.topLanguage && <span className="pet-lang">{pet.topLanguage}</span>}
        </div>
        <div className="pet-level-block">
          <span className="pet-level-label">LVL</span>
          <span className="pet-level">{pet.level}</span>
        </div>
      </div>

      <XpBar xp={pet.xp} level={pet.level} />

      <div className="pet-stage">
        <PetCanvas species={pet.species} mood={pet.mood} stage={pet.stage} />
        <div className="pet-mood-block">
          <span className="pet-mood-dot" style={{ background: moodColor }} />
          <span className="pet-mood-label" style={{ color: moodColor }}>
            {pet.moodLabel}
          </span>
        </div>
        <p className="pet-message">{pet.moodMessage}</p>
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
            {pet.daysSince === 0 ? 'TODAY' : `${pet.daysSince}D`}
          </span>
          <span className="streak-label">last commit</span>
        </div>
        <div className="streak-divider" />
        <div className="streak-item">
          <span className="streak-value">{pet.totalCommits}</span>
          <span className="streak-label">commits</span>
        </div>
      </div>

      <Heatmap dailyCommits={pet.dailyCommits} />

      {isAlive && <ActivityFeed activity={pet.recentActivity} />}

      {!isAlive && (
        <div className="death-message">
          <p>Your pet has passed away.</p>
          <p>No commits in over 21 days. Push code to revive it.</p>
        </div>
      )}
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

function minutesAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m <= 0) return 'just now'
  return `${m}m ago`
}

export default function App() {
  const { data, loading, error, cachedAt, fetchUser } = useGitHubData()
  const pet = usePetState(data)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const u = params.get('u')
    if (u) fetchUser(u)
  }, [fetchUser])

  const handleSearch = (username) => {
    const url = new URL(window.location.href)
    url.searchParams.set('u', username)
    window.history.pushState({}, '', url)
    fetchUser(username)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="logo">
          COMMITCHI<span className="logo-cursor">_</span>
        </h1>
        <p className="logo-sub">YOUR COMMITS. YOUR CREATURE.</p>
      </header>

      <main className="app-main">
        <SearchForm onSearch={handleSearch} loading={loading} />

        {cachedAt && !loading && (
          <div className="cache-note">cached {minutesAgo(cachedAt)}</div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="loading-dots"><span /><span /><span /></div>
            <p>HATCHING...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <span className="error-icon">!</span>
            <p>{error}</p>
          </div>
        )}

        {pet && !loading && (
          <>
            <div className="device">
              <div className="device-screen">
                <PetScreen pet={pet} />
              </div>
              <div className="device-controls">
                <div className="device-buttons">
                  <span className="dev-btn red" />
                  <span className="dev-btn yellow" />
                  <span className="dev-btn green" />
                </div>
                <div className="device-speaker">
                  <span /><span /><span />
                </div>
              </div>
            </div>
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
