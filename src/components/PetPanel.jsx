import { useEffect } from 'react'
import { Device } from './Device'
import { useGitHubData } from '../hooks/useGitHubData'
import { usePetState } from '../hooks/usePetState'

// Self-contained pet card for compare mode: owns its own fetch + derived state.
// Reports its pet upward via onPet so the parent can compare happiness for the crown.
// onPet is expected to be a stable setter (useState updater).
export function PetPanel({ username, crown = false, onPet }) {
  const { data, loading, error, fetchUser } = useGitHubData()
  const pet = usePetState(data)

  useEffect(() => {
    if (username) fetchUser(username)
  }, [username, fetchUser])

  useEffect(() => {
    onPet?.(pet || null)
  }, [pet, onPet])

  if (loading) {
    return (
      <div className="compare-status">
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    )
  }

  if (error) {
    return <div className="compare-status compare-error">{error}</div>
  }

  if (!pet) return <div className="compare-status">No pet.</div>

  return <Device key={pet.username} pet={pet} crown={crown} />
}
