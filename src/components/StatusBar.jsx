const SEGMENTS = 10

export function StatusBar({ label, value }) {
  const pct = Math.max(0, Math.min(100, value))
  const filled = Math.round((pct / 100) * SEGMENTS)

  return (
    <div className="status-bar-row">
      <span className="status-label">{label}</span>
      <div className="status-segments">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span key={i} className={`status-seg ${i < filled ? 'on' : ''}`} />
        ))}
      </div>
    </div>
  )
}
