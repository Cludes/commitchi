import { useEffect } from 'react'
import { SearchForm } from './components/SearchForm'
import { PetCanvas } from './components/PetCanvas'
import { StatusBar } from './components/StatusBar'
import { ActivityFeed } from './components/ActivityFeed'
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

function PetView({ pet }) {
  const isAlive = pet.mood !== 'dead'
  const moodColor = {
    ecstatic: '#69db7c',
    happy: '#69db7c',
    content: '#74c0fc',
    hungry: '#ffd43b',
    sad: '#ff8787',
    critical: '#ff4d4d',
    dead: '#868e96',
  }[pet.mood] || '#74c0fc'

  return (
    <div className="pet-view">
      <div className="pet-header">
        <div className="pet-name-block">
          <span className="pet-username">@{pet.username}</span>
          <span className="pet-species">
            {STAGE_NAMES[pet.stage]} {SPECIES_NAMES[pet.species]}
          </span>
          {pet.topLanguage && (
            <span className="pet-lang">Primary: {pet.topLanguage}</span>
          )}
        </div>
        <div className="pet-level-block">
          <span className="pet-level-label">LVL</span>
          <span className="pet-level">{pet.level}</span>
        </div>
      </div>

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
        <StatusBar
          label="Hunger"
          value={100 - pet.hunger}
          color={pet.hunger > 70 ? '#ff4d4d' : pet.hunger > 40 ? '#ffd43b' : '#69db7c'}
          icon="+"
        />
        <StatusBar label="Happiness" value={pet.happiness} color="#74c0fc" icon="*" />
        <StatusBar
          label="Health"
          value={pet.health}
          color={pet.health < 20 ? '#ff4d4d' : pet.health < 50 ? '#ffd43b' : '#69db7c'}
          icon="<3"
        />
      </div>

      <div className="streak-row">
        <div className="streak-item">
          <span className="streak-value">{pet.streak}</span>
          <span className="streak-label">day streak</span>
        </div>
        <div className="streak-divider" />
        <div className="streak-item">
          <span className="streak-value">
            {pet.daysSince === 0 ? 'Today' : `${pet.daysSince}d ago`}
          </span>
          <span className="streak-label">last commit</span>
        </div>
        <div className="streak-divider" />
        <div className="streak-item">
          <span className="streak-value">{pet.totalCommits}</span>
          <span className="streak-label">total commits</span>
        </div>
      </div>

      {isAlive && <ActivityFeed activity={pet.recentActivity} />}

      {!isAlive && (
        <div className="death-message">
          <p>Your pet has passed away. No commits detected in over 21 days.</p>
          <p>Push some code to revive them.</p>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const { data, loading, error, fetchUser } = useGitHubData()
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
        <div className="logo">
          <span className="logo-icon">&#9670;</span>
          <span className="logo-text">DevPet</span>
        </div>
        <p className="logo-sub">Your GitHub activity, as a living creature.</p>
      </header>

      <main className="app-main">
        <SearchForm onSearch={handleSearch} loading={loading} />

        {loading && (
          <div className="loading-state">
            <div className="loading-dots"><span /><span /><span /></div>
            <p>Hatching your pet...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <span className="error-icon">!</span>
            <p>{error}</p>
          </div>
        )}

        {pet && !loading && <PetView pet={pet} />}

        {!pet && !loading && !error && (
          <div className="empty-state">
            <div className="empty-egg">&#9671;</div>
            <p>Enter a GitHub username to hatch your pet.</p>
            <p className="empty-hint">
              Your pet lives or dies based on your commit activity.
            </p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        Feed it. Keep it alive. Don&apos;t let it die.
      </footer>
    </div>
  )
}
