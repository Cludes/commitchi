export function Achievements({ achievements }) {
  if (!achievements || achievements.length === 0) return null
  const earned = achievements.filter((a) => a.earned).length

  return (
    <div className="achievements">
      <div className="ach-title">ACHIEVEMENTS {earned}/{achievements.length}</div>
      <div className="ach-row">
        {achievements.map((a) => (
          <span
            key={a.id}
            className={`ach-badge ${a.earned ? 'earned' : ''}`}
            title={a.earned ? a.label : `${a.label} (locked)`}
          >
            {a.earned ? a.short : '?'}
          </span>
        ))}
      </div>
    </div>
  )
}
