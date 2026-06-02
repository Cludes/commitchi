import { useState } from 'react'

export function ShareButton() {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked - ignore
    }
  }

  return (
    <button className="share-btn" onClick={handleShare}>
      {copied ? 'COPIED!' : 'SHARE YOUR PET'}
    </button>
  )
}
