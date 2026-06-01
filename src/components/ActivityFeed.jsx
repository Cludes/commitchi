function timeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 1000)
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function ActivityFeed({ activity }) {
  if (!activity || activity.length === 0) {
    return (
      <div className="activity-feed">
        <div className="feed-title">RECENT ACTIVITY</div>
        <div className="feed-empty">No recent push events found.</div>
      </div>
    )
  }

  return (
    <div className="activity-feed">
      <div className="feed-title">RECENT COMMITS</div>
      {activity.map((item, i) => (
        <div key={i} className="feed-item">
          <span className="feed-repo">{item.repo.split('/')[1]}</span>
          <span className="feed-msg">{item.message}</span>
          <span className="feed-time">{timeAgo(item.date)}</span>
        </div>
      ))}
    </div>
  )
}
