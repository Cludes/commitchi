import { useEffect, useMemo, useState } from 'react'
import { SearchForm } from './components/SearchForm'
import { Device } from './components/Device'
import { PetPanel } from './components/PetPanel'
import { ShareButton } from './components/ShareButton'
import { Countdown } from './components/Countdown'
import { useGitHubData } from './hooks/useGitHubData'
import { usePetState } from './hooks/usePetState'
import { readJSON, writeJSON } from './utils/storage'
import { getInitialTheme, THEME_KEY } from './utils/theme'
import { SPECIES_LIST, STAGE_LIST, STAGE_NAMES } from './utils/constants'
import { applyStagePreview, getEvolutionStage } from './utils/petCalculations'
import { downloadPetCard } from './utils/downloadCard'
import './App.css'

const RECENT_KEY = 'commitchi:recent'
const MAX_RECENT = 5

const speciesKey = (u) => `commitchi:species:${u.toLowerCase()}`
const validSpecies = (s) => (s && SPECIES_LIST.includes(s) ? s : null)

function initialSpecies() {
  try {
    const params = new URLSearchParams(window.location.search)
    const q = validSpecies(params.get('species'))
    if (q) return q
    const u = params.get('u')
    if (u) return validSpecies(readJSON(speciesKey(u), null))
  } catch {
    // ignore
  }
  return null
}

// Preview stage from ?stage= (named) or ?level= (1-8). Visual preview only.
function initialPreviewStage() {
  try {
    const params = new URLSearchParams(window.location.search)
    const s = params.get('stage')
    if (s && STAGE_LIST.includes(s)) return s
    const lv = parseInt(params.get('level'), 10)
    if (lv >= 1 && lv <= 8) return getEvolutionStage(lv)
  } catch {
    // ignore
  }
  return null
}

export default function App() {
  const { data, loading, error, cachedAt, rateLimitReset, fetchUser } = useGitHubData()
  const [speciesOverride, setSpeciesOverride] = useState(initialSpecies)
  const pet = usePetState(data, speciesOverride)
  const [previewStage, setPreviewStage] = useState(initialPreviewStage)
  // On-screen pet may show a preview stage; `pet` stays real for download / share.
  const displayPet = useMemo(() => applyStagePreview(pet, previewStage), [pet, previewStage])
  const [theme, setTheme] = useState(getInitialTheme)
  const [recent, setRecent] = useState(() => readJSON(RECENT_KEY, []))
  const [levelUp, setLevelUp] = useState(false)

  const [comparing, setComparing] = useState(false)
  const [compareInput, setCompareInput] = useState('')
  const [compareUser, setCompareUser] = useState(null)
  const [comparePet, setComparePet] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const u = params.get('u')
    if (u) fetchUser(u)
  }, [fetchUser])

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // storage unavailable
    }
  }, [theme])

  // Level-up detection (deferred setState so it isn't a synchronous effect cascade).
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
    url.searchParams.delete('species')
    url.searchParams.delete('stage')
    url.searchParams.delete('level')
    window.history.pushState({}, '', url)
    addRecent(username)
    setSpeciesOverride(validSpecies(readJSON(speciesKey(username), null)))
    setPreviewStage(null)
    setCompareUser(null)
    setComparePet(null)
    setComparing(false)
    fetchUser(username)
  }

  const setPreview = (stage) => {
    setPreviewStage(stage)
    const url = new URL(window.location.href)
    url.searchParams.delete('level')
    if (stage) url.searchParams.set('stage', stage)
    else url.searchParams.delete('stage')
    window.history.replaceState({}, '', url)
  }

  const handleRefresh = () => {
    if (pet) fetchUser(pet.username, { force: true })
  }

  const cycleSpecies = () => {
    if (!pet) return
    const idx = SPECIES_LIST.indexOf(pet.species)
    const next = SPECIES_LIST[(idx + 1) % SPECIES_LIST.length]
    setSpeciesOverride(next)
    writeJSON(speciesKey(pet.username), next)
    const url = new URL(window.location.href)
    url.searchParams.set('species', next)
    window.history.replaceState({}, '', url)
  }

  const startCompare = (e) => {
    e.preventDefault()
    const u = compareInput.trim()
    if (u) setCompareUser(u)
  }

  const clearCompare = () => {
    setComparing(false)
    setCompareInput('')
    setCompareUser(null)
    setComparePet(null)
  }

  const primaryWins = compareUser && comparePet ? pet.happiness >= comparePet.happiness : false
  const compareWins = compareUser && comparePet ? comparePet.happiness > pet.happiness : false

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

        {pet && !loading && !compareUser && (
          <>
            <Device key={pet.username} pet={displayPet} onCycleSpecies={cycleSpecies} />

            {previewStage && (
              <div className="preview-note">PREVIEW - your real card is unchanged</div>
            )}
            <div className="preview-bar" role="group" aria-label="Preview evolution stage">
              <span className="preview-label">PREVIEW</span>
              {STAGE_LIST.map((s) => (
                <button
                  key={s}
                  className={`preview-chip ${previewStage === s ? 'active' : ''}`}
                  onClick={() => setPreview(s)}
                >
                  {STAGE_NAMES[s]}
                </button>
              ))}
              <button
                className={`preview-chip ${!previewStage ? 'active' : ''}`}
                onClick={() => setPreview(null)}
              >
                LIVE
              </button>
            </div>

            <div className="share-row">
              <ShareButton />
              <button className="share-btn" onClick={() => downloadPetCard(pet, theme)}>
                DOWNLOAD PNG
              </button>
            </div>
            <div className="compare-bar">
              {!comparing ? (
                <button className="compare-toggle" onClick={() => setComparing(true)}>
                  COMPARE WITH...
                </button>
              ) : (
                <form className="compare-form" onSubmit={startCompare}>
                  <input
                    className="compare-input"
                    placeholder="github username"
                    value={compareInput}
                    onChange={(e) => setCompareInput(e.target.value)}
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button className="compare-go" type="submit">VS</button>
                </form>
              )}
            </div>
          </>
        )}

        {pet && !loading && compareUser && (
          <div className="compare-wrap">
            <div className="compare-grid">
              <Device key={pet.username} pet={pet} crown={primaryWins} />
              <div className="vs-divider">VS</div>
              <PetPanel username={compareUser} crown={compareWins} onPet={setComparePet} />
            </div>
            <button className="compare-exit" onClick={clearCompare}>EXIT COMPARE</button>
          </div>
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
