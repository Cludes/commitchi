const WEEKS = 12
const DAYS = 7
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function levelColor(count) {
  if (!count) return '#8bac0f'
  if (count === 1) return '#306230'
  if (count === 2) return '#0f380f'
  return '#ff6eb4'
}

export function Heatmap({ dailyCommits }) {
  // Build last WEEKS*DAYS days, oldest first (top-left), filling columns left to right.
  const today = new Date()

  const columns = []
  for (let col = 0; col < WEEKS; col++) {
    const cells = []
    for (let row = 0; row < DAYS; row++) {
      const index = col * DAYS + row
      const daysAgo = WEEKS * DAYS - 1 - index
      const d = new Date(today)
      d.setDate(d.getDate() - daysAgo)
      const count = dailyCommits[d.toDateString()] || 0
      cells.push({ count, key: d.toDateString() })
    }
    columns.push(cells)
  }

  return (
    <div className="heatmap">
      <div className="heatmap-title">LAST 12 WEEKS</div>
      <div className="heatmap-body">
        <div className="heatmap-days">
          {DAY_LABELS.map((l, i) => (
            <span key={i} className="heatmap-day-label">{l}</span>
          ))}
        </div>
        <div className="heatmap-grid">
          {columns.map((cells, col) => (
            <div key={col} className="heatmap-col">
              {cells.map((cell, row) => (
                <span
                  key={row}
                  className="heatmap-cell"
                  style={{ background: levelColor(cell.count) }}
                  title={`${cell.key}: ${cell.count} commits`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
