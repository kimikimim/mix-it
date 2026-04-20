'use client'

import { useEffect, useRef, useState } from 'react'

interface CookingResult {
  id: string
  name: string
  category: string
  area: string
  thumbnail: string
  matched_count: number
  total_selected: number
  missing_count: number
  ingredients: string[]
  ready_in_minutes?: number
  servings?: number
}

interface Props {
  result: CookingResult | null
  noMatch: boolean
  onClose: () => void
}

// Category-based animation color and type
function getCookingStyle(category: string, area: string): { color: string; emoji: string; label: string } {
  const c = (category + area).toLowerCase()
  if (c.includes('dessert') || c.includes('cake') || c.includes('sweet'))
    return { color: '#FF69B4', emoji: '🍰', label: 'Dessert' }
  if (c.includes('seafood') || c.includes('fish') || c.includes('japanese') || c.includes('korean'))
    return { color: '#4169E1', emoji: '🐟', label: 'Seafood' }
  if (c.includes('italian') || c.includes('pasta'))
    return { color: '#DAA520', emoji: '🍝', label: 'Pasta' }
  if (c.includes('soup') || c.includes('stew'))
    return { color: '#8B4513', emoji: '🍲', label: 'Soup / Stew' }
  if (c.includes('salad') || c.includes('vegetarian') || c.includes('vegan'))
    return { color: '#228B22', emoji: '🥗', label: 'Salad' }
  if (c.includes('beef') || c.includes('lamb') || c.includes('pork'))
    return { color: '#8B2500', emoji: '🥩', label: 'Meat' }
  if (c.includes('chicken') || c.includes('poultry'))
    return { color: '#DAA520', emoji: '🍗', label: 'Chicken' }
  if (c.includes('mexican') || c.includes('american'))
    return { color: '#FF4500', emoji: '🌮', label: 'Western' }
  if (c.includes('indian') || c.includes('thai') || c.includes('chinese'))
    return { color: '#FF8C00', emoji: '🍛', label: 'Asian' }
  if (c.includes('breakfast') || c.includes('brunch'))
    return { color: '#FFD700', emoji: '🍳', label: 'Brunch' }
  return { color: '#FF6B35', emoji: '🍽️', label: 'Dish' }
}

// 끓는 냄비 Canvas 애니메이션
function CookingAnimation({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const W = canvas.width, H = canvas.height

    // Bubble particles
    const bubbles: { x: number; y: number; r: number; vy: number; phase: number; alpha: number }[] = []
    for (let i = 0; i < 40; i++) {
      bubbles.push({
        x: W * 0.2 + Math.random() * W * 0.6,
        y: H * 0.5 + Math.random() * H * 0.4,
        r: Math.random() * 5 + 2,
        vy: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.6 + 0.3,
      })
    }

    // Steam particles
    const steams: { x: number; y: number; vy: number; vx: number; alpha: number; r: number }[] = []
    for (let i = 0; i < 20; i++) {
      steams.push({
        x: W * 0.3 + Math.random() * W * 0.4,
        y: H * 0.3,
        vy: Math.random() * 1.5 + 1,
        vx: (Math.random() - 0.5) * 0.8,
        alpha: Math.random() * 0.3 + 0.1,
        r: Math.random() * 8 + 4,
      })
    }

    let frame = 0
    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#0a1628')
      bg.addColorStop(1, '#0d2244')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Liquid surface (wave)
      const surfaceY = H * 0.55
      ctx.beginPath()
      ctx.moveTo(0, surfaceY)
      for (let x = 0; x <= W; x += 4) {
        const y = surfaceY + Math.sin((x * 0.05) + frame * 0.08) * 4
        ctx.lineTo(x, y)
      }
      ctx.lineTo(W, H)
      ctx.lineTo(0, H)
      ctx.closePath()
      const liquidGrad = ctx.createLinearGradient(0, surfaceY, 0, H)
      liquidGrad.addColorStop(0, color + 'CC')
      liquidGrad.addColorStop(1, color + '44')
      ctx.fillStyle = liquidGrad
      ctx.fill()

      // Bubbles
      bubbles.forEach(b => {
        b.y -= b.vy
        b.x += Math.sin(frame * 0.05 + b.phase) * 0.5
        if (b.y < surfaceY - 10) {
          b.y = H * 0.6 + Math.random() * H * 0.3
          b.x = W * 0.2 + Math.random() * W * 0.6
        }
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1
        ctx.globalAlpha = b.alpha * (b.y > surfaceY ? 1 : 0)
        ctx.stroke()
        ctx.globalAlpha = 1
      })

      // Steam
      steams.forEach(s => {
        s.y -= s.vy
        s.x += s.vx
        s.alpha -= 0.004
        s.r += 0.15
        if (s.alpha <= 0 || s.y < 0) {
          s.y = surfaceY - 5
          s.x = W * 0.3 + Math.random() * W * 0.4
          s.alpha = 0.2
          s.r = Math.random() * 6 + 3
        }
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.globalAlpha = s.alpha
        ctx.fill()
        ctx.globalAlpha = 1
      })

      frame++
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [color])

  return <canvas ref={canvasRef} className="w-full rounded-xl" style={{ height: 200 }} />
}

export default function CookingResultModal({ result, noMatch, onClose }: Props) {
  const [visible, setVisible] = useState(false)
  const [showIngredients, setShowIngredients] = useState(false)

  useEffect(() => {
    if (result || noMatch) { setVisible(true); setShowIngredients(false) }
  }, [result, noMatch])

  const close = () => { setVisible(false); setTimeout(onClose, 300) }
  if (!visible) return null

  const style = result ? getCookingStyle(result.category, result.area) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={close}>
      <div
        className="relative bg-gray-900 border border-gray-700 rounded-3xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: result ? `0 0 60px ${style?.color}44` : undefined }}
      >
        <button onClick={close} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-xl z-10">✕</button>

        {noMatch && !result ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🤷</div>
            <h2 className="text-white text-xl font-bold mb-2">No Recipe Found</h2>
            <p className="text-gray-400 text-sm">No recipe found for this combination of ingredients.</p>
          </div>
        ) : result && style ? (
          <>
            {/* Animation */}
            <div className="rounded-xl overflow-hidden mb-4 bg-gray-950">
              <CookingAnimation color={style.color} />
            </div>

            {/* Recipe thumbnail + info */}
            <div className="flex items-start gap-4 mb-4">
              {result.thumbnail && (
                <img
                  src={result.thumbnail}
                  alt={result.name}
                  className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border-2 border-gray-700"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: style.color + '33', color: style.color }}
                  >
                    {style.emoji} {style.label}
                  </span>
                  {result.area && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                      {result.area}
                    </span>
                  )}
                </div>
                <h2 className="text-white text-xl font-black leading-tight">{result.name}</h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  {result.ready_in_minutes && <span>⏱ {result.ready_in_minutes} min</span>}
                  {result.servings && <span>👤 {result.servings} servings</span>}
                </div>
              </div>
            </div>

            {/* Ingredient match status */}
            <div className="bg-gray-800 rounded-xl p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-medium">Ingredient Match</span>
                <span className="text-xs font-bold" style={{ color: style.color }}>
                  {result.matched_count} / {result.total_selected} matched
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{
                    width: `${(result.matched_count / result.total_selected) * 100}%`,
                    backgroundColor: style.color,
                  }}
                />
              </div>
              {result.missing_count > 0 && (
                <p className="text-xs text-gray-500 mt-1.5">
                  {result.missing_count} more ingredient{result.missing_count > 1 ? 's' : ''} needed
                </p>
              )}
            </div>

            {/* Full ingredient toggle */}
            <button
              onClick={() => setShowIngredients(v => !v)}
              className="w-full text-left text-xs text-gray-400 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>View all ingredients ({result.ingredients.length})</span>
              <span>{showIngredients ? '▲' : '▼'}</span>
            </button>
            {showIngredients && (
              <ul className="mt-2 grid grid-cols-2 gap-1">
                {result.ingredients.map((ing, i) => (
                  <li key={i} className="text-xs text-gray-300 bg-gray-800 rounded-lg px-2 py-1 truncate">
                    {ing}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
