import { useEffect, useState } from 'react'

// Live "try again in Xm Ys" countdown toward a future epoch-ms timestamp.
export function Countdown({ resetAt }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const secs = Math.max(0, Math.round((resetAt - now) / 1000))
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return <span>try again in {m}m {String(s).padStart(2, '0')}s</span>
}
