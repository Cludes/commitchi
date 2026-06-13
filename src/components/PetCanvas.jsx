import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  getSpriteForState, recolorSprite, getStageOverlay, getStageScale, stageHasAura,
} from '../utils/sprites'

const PIXEL_SIZE = 11

export const PetCanvas = forwardRef(function PetCanvas(
  { species, mood, stage, ariaLabel },
  ref
) {
  const canvasRef = useRef(null)
  const [interact, setInteract] = useState('')
  const [hearts, setHearts] = useState(0)
  const animTimer = useRef(null)
  const heartTimer = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = 16 * PIXEL_SIZE

    canvas.width = size
    canvas.height = size
    ctx.clearRect(0, 0, size, size)
    ctx.imageSmoothingEnabled = false

    // Evolution: babies render smaller (centred); others full size.
    const scale = getStageScale(stage)
    const sps = Math.max(1, Math.round(PIXEL_SIZE * scale))
    const off = Math.round((size - 16 * sps) / 2)

    const drawGrid = (grid) => {
      grid.forEach((row, y) => {
        row.forEach((color, x) => {
          if (!color) return
          ctx.fillStyle = color
          ctx.fillRect(off + x * sps, off + y * sps, sps, sps)
        })
      })
    }

    drawGrid(recolorSprite(getSpriteForState(species, mood, stage), species))
    const overlay = getStageOverlay(stage)
    if (overlay) drawGrid(overlay)
  }, [species, mood, stage])

  useEffect(() => () => {
    clearTimeout(animTimer.current)
    clearTimeout(heartTimer.current)
  }, [])

  const isDead = mood === 'dead'

  const poke = () => {
    setInteract(isDead ? 'shake' : 'bounce')
    clearTimeout(animTimer.current)
    animTimer.current = setTimeout(() => setInteract(''), 450)
  }

  const feed = () => {
    poke()
    if (!isDead) {
      setHearts((h) => h + 1)
      clearTimeout(heartTimer.current)
      heartTimer.current = setTimeout(() => setHearts(0), 650)
    }
  }

  useImperativeHandle(ref, () => ({ feed, poke }))

  const isEgg = stage === 'egg'
  const isFloating = !isDead && !isEgg && mood !== 'critical' && mood !== 'sad'
  const idleClass = interact || (isEgg ? 'egg-wobble' : isFloating ? 'floating' : '')
  const auraClass = stageHasAura(stage) ? 'aura' : ''

  return (
    <div
      className={`pet-canvas-wrapper ${idleClass} ${isDead ? 'ghost-float' : ''} ${auraClass}`}
      onClick={poke}
    >
      <canvas ref={canvasRef} className="pet-canvas" role="img" aria-label={ariaLabel} />
      {mood === 'ecstatic' && <div className="sparkles">+ + +</div>}
      {hearts > 0 && <div key={hearts} className="pet-heart">&lt;3</div>}
      {isDead && <div className="rip-text">R.I.P.</div>}
    </div>
  )
})
