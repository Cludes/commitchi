import { useState } from 'react'

export function SearchForm({ onSearch, loading }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed) onSearch(trimmed)
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-row">
        <span className="search-prefix">github.com/</span>
        <input
          className="search-input"
          type="text"
          placeholder="username"
          value={input}
          onChange={e => setInput(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <button className="search-btn" type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Adopt'}
        </button>
      </div>
    </form>
  )
}
