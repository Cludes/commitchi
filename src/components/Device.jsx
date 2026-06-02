import { useRef, useState } from 'react'
import { PetCanvas } from './PetCanvas'
import { StatusBar } from './StatusBar'
import { ActivityFeed } from './ActivityFeed'
import { Heatmap } from './Heatmap'
import { PetName } from './PetName'
import { SPECIES_NAMES, STAGE_NAMES, MOOD_COLORS_LIGHT } from '../utils/constants'

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

// Remount with key={username} so msgIndex / heatmap visibility reset per user.
export function Device({ pet, crown = false, onCycleSpecies = null }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const petRef = useRef(null)

  const isDead = pet.mood === 'dead'
  const moodColor = MOOD_COLORS_LIGHT[pet.mood] || '#0f380f'
  const message = pet.moodMessages[msgIndex % pet.moodMessages.length]
  const ariaLabel = `${pet.username}'s ${SPECIES_NAMES[pet.species]}, ${pet.moodLabel.replace(/!/g, '').trim().toLowerCase()}, level ${pet.level}`

  return (
    <div className="device-wrap">
      {crown && <div className="crown" title="Higher happiness">WINNER</div>}
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
                  {onCycleSpecies && (
                    <button className="species-swap" onClick={onCycleSpecies} title="Change species">
                      swap
                    </button>
                  )}
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
    </div>
  )
}
