import { useEffect, useRef } from 'react'
import { getSpriteForState, recolorSprite } from '../utils/sprites'

const PIXEL_SIZE = 12

export function PetCanvas({ species, mood, stage }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = 16 * PIXEL_SIZE

    canvas.width = size
    canvas.height = size
    ctx.clearRect(0, 0, size, size)
    ctx.imageSmoothingEnabled = false

    const rawSprite = getSpriteForState(species, mood, stage)
    const sprite = recolorSprite(rawSprite, species)

    sprite.forEach((row, y) => {
      row.forEach((color, x) => {
        if (!color) return
        ctx.fillStyle = color
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
      })
    })
  }, [species, mood, stage])

  const isFloating = mood !== 'dead' && mood !== 'critical' && mood !== 'sad'
  const isDead = mood === 'dead'

  return (
    <div className={`pet-canvas-wrapper ${isFloating ? 'floating' : ''} ${isDead ? 'ghost-float' : ''}`}>
      <canvas ref={canvasRef} className="pet-canvas" />
      {mood === 'ecstatic' && <div className="sparkles">✦ ✦ ✦</div>}
      {isDead && <div className="rip-text">R.I.P.</div>}
    </div>
  )
}
