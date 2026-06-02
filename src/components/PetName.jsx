import { useState } from 'react'
import { SPECIES_NAMES } from '../utils/constants'
import { readJSON, writeJSON } from '../utils/storage'

// Remounted (via key) whenever the viewed user changes, so it reads the right name.
export function PetName({ username, species }) {
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
