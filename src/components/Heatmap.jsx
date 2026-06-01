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
  // Rows = weekdays (Mon..Sun), columns = weeks. The last column ends at today in
  // its real weekday row; cells after today are empty (future).
  const today = new Date()
  const todayDow = (today.getDay() + 6) % 7 // 0 = Mon ... 6 = Sun

  const columns = []
  for (let col = 0; col < WEEKS; col++) {
    const cells = []
    for (let row = 0; row < DAYS; row++) {
      const weeksAgo = WEEKS - 1 - col
      const daysAgo = weeksAgo * 7 + (todayDow - row)
      if (daysAgo < 0) {
        cells.push({ future: true, key: `f-${col}-${row}` })
        continue
      }
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
              {cells.map((cell) =>
                cell.future ? (
                  <span key={cell.key} className="heatmap-cell empty" />
                ) : (
                  <span
                    key={cell.key}
                    className="heatmap-cell"
                    style={{ background: levelColor(cell.count) }}
                    title={`${cell.key}: ${cell.count} commits`}
                  />
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
