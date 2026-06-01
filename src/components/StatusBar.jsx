export function StatusBar({ label, value, color, icon }) {
  const pct = Math.max(0, Math.min(100, value))

  return (
    <div className="status-bar-row">
      <span className="status-label">{icon} {label}</span>
      <div className="status-track">
        <div
          className="status-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="status-value">{pct}%</span>
    </div>
  )
}
