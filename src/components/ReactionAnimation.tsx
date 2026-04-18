'use client'

import { useEffect, useRef } from 'react'
import { Reaction } from '@/types'

interface Props {
  reaction: Reaction
  onDone?: () => void
}

export default function ReactionAnimation({ reaction, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    let done = false

    switch (reaction.animation) {
      case 'sink':
        animSink(ctx, canvas, reaction.color, () => { done = true; onDone?.() })
        break
      case 'bubble':
        animBubble(ctx, canvas, reaction.color, () => { done = true; onDone?.() })
        break
      case 'explode':
        animExplode(ctx, canvas, reaction.color, () => { done = true; onDone?.() })
        break
      case 'burn':
        animBurn(ctx, canvas, reaction.color, () => { done = true; onDone?.() })
        break
      case 'dissolve':
      case 'colorchange':
        animColorChange(ctx, canvas, reaction.color, () => { done = true; onDone?.() })
        break
      default:
        animColorChange(ctx, canvas, '#888888', () => { done = true; onDone?.() })
    }

    return () => {
      // cleanup handled by individual animation loops via doneFired flag
    }
  }, [reaction])

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-xl"
      style={{ height: 220 }}
    />
  )
}

// ──────────────────────────────────────────────
// 침전 애니메이션: 입자가 아래로 가라앉음
// ──────────────────────────────────────────────
function animSink(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  color: string,
  onDone: () => void
) {
  const W = canvas.width, H = canvas.height
  const particles: { x: number; y: number; r: number; speed: number; alpha: number; settled: boolean }[] = []
  const count = 120
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H * 0.4,
      r: Math.random() * 4 + 1.5,
      speed: Math.random() * 1.2 + 0.4,
      alpha: Math.random() * 0.5 + 0.5,
      settled: false,
    })
  }

  const sediment: { x: number; y: number; r: number }[] = []
  let frame = 0
  let doneFired = false

  const draw = () => {
    ctx.clearRect(0, 0, W, H)

    // Water bg gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#0a1628')
    grad.addColorStop(1, '#0d2244')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Settled sediment layer at bottom
    sediment.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.globalAlpha = 0.9
      ctx.fill()
      ctx.globalAlpha = 1
    })

    let allSettled = true
    particles.forEach(p => {
      if (!p.settled) {
        allSettled = false
        p.y += p.speed * (1 + frame * 0.002)
        if (p.y >= H - 12) {
          p.settled = true
          sediment.push({ x: p.x, y: H - Math.random() * 8 - 4, r: p.r })
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.globalAlpha = p.alpha
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }
    })

    frame++
    if (!allSettled) {
      requestAnimationFrame(draw)
    } else if (!doneFired) {
      doneFired = true
      // Hold settled view for 1s then callback
      setTimeout(onDone, 1000)
    }
  }
  draw()
}

// ──────────────────────────────────────────────
// 기체 발생: 기포가 위로 올라감
// ──────────────────────────────────────────────
function animBubble(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  color: string,
  onDone: () => void
) {
  const W = canvas.width, H = canvas.height
  const bubbles: { x: number; y: number; r: number; speed: number; wobble: number; phase: number }[] = []

  for (let i = 0; i < 60; i++) {
    bubbles.push({
      x: Math.random() * W,
      y: H + Math.random() * H * 0.5,
      r: Math.random() * 6 + 2,
      speed: Math.random() * 1.5 + 0.8,
      wobble: Math.random() * 2 - 1,
      phase: Math.random() * Math.PI * 2,
    })
  }

  let frame = 0
  let doneFired = false

  const draw = () => {
    ctx.clearRect(0, 0, W, H)
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#0a1628')
    grad.addColorStop(1, '#0d2244')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    let anyVisible = false
    bubbles.forEach(b => {
      b.y -= b.speed
      b.x += Math.sin(frame * 0.05 + b.phase) * b.wobble

      if (b.y + b.r > 0) {
        anyVisible = true
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = Math.max(0, (b.y / H))
        ctx.stroke()

        // Sheen
        ctx.beginPath()
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.globalAlpha = 0.3
        ctx.fill()
        ctx.globalAlpha = 1
      }
    })

    frame++
    if (frame < 180 || anyVisible) {
      requestAnimationFrame(draw)
    } else if (!doneFired) {
      doneFired = true
      onDone()
    }
  }
  draw()
}

// ──────────────────────────────────────────────
// 폭발 애니메이션
// ──────────────────────────────────────────────
function animExplode(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  color: string,
  onDone: () => void
) {
  const W = canvas.width, H = canvas.height
  const cx = W / 2, cy = H / 2
  const sparks: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; r: number }[] = []

  for (let i = 0; i < 200; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 8 + 2
    sparks.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: Math.random() * 60 + 40,
      r: Math.random() * 3 + 1,
    })
  }

  const shockwaves: { r: number; alpha: number }[] = [
    { r: 0, alpha: 1 },
    { r: 0, alpha: 0.6 },
  ]

  let frame = 0
  let doneFired = false

  const draw = () => {
    // Dark bg
    ctx.fillStyle = 'rgba(5, 5, 10, 0.25)'
    ctx.fillRect(0, 0, W, H)

    // Shockwaves
    shockwaves.forEach((sw, i) => {
      sw.r += 4 + i * 2
      sw.alpha *= 0.94
      ctx.beginPath()
      ctx.arc(cx, cy, sw.r, 0, Math.PI * 2)
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.globalAlpha = sw.alpha
      ctx.stroke()
      ctx.globalAlpha = 1
    })

    // Sparks
    let any = false
    sparks.forEach(s => {
      s.life -= 1 / s.maxLife
      if (s.life > 0) {
        any = true
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.15 // gravity
        s.vx *= 0.98
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2)
        ctx.fillStyle = s.life > 0.5 ? '#fff' : color
        ctx.globalAlpha = s.life
        ctx.fill()
        ctx.globalAlpha = 1
      }
    })

    frame++
    if (any && frame < 120) {
      requestAnimationFrame(draw)
    } else if (!doneFired) {
      doneFired = true
      onDone()
    }
  }
  draw()
}

// ──────────────────────────────────────────────
// 연소 애니메이션
// ──────────────────────────────────────────────
function animBurn(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  _color: string,
  onDone: () => void
) {
  const W = canvas.width, H = canvas.height
  const flames: { x: number; y: number; vy: number; r: number; life: number; hue: number }[] = []

  const addFlames = () => {
    for (let i = 0; i < 5; i++) {
      flames.push({
        x: W * 0.2 + Math.random() * W * 0.6,
        y: H,
        vy: Math.random() * 3 + 1.5,
        r: Math.random() * 12 + 6,
        life: 1,
        hue: Math.random() * 40, // 0=red, 40=orange-yellow
      })
    }
  }

  let frame = 0
  let doneFired = false

  const draw = () => {
    ctx.fillStyle = 'rgba(5, 5, 10, 0.3)'
    ctx.fillRect(0, 0, W, H)

    if (frame < 80) addFlames()

    for (let i = flames.length - 1; i >= 0; i--) {
      const f = flames[i]
      f.y -= f.vy
      f.x += (Math.random() - 0.5) * 2
      f.life -= 0.015
      f.r *= 0.995

      if (f.life <= 0) { flames.splice(i, 1); continue }

      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r)
      grad.addColorStop(0, `hsla(${f.hue + 50}, 100%, 90%, ${f.life})`)
      grad.addColorStop(0.4, `hsla(${f.hue + 20}, 100%, 60%, ${f.life * 0.8})`)
      grad.addColorStop(1, `hsla(${f.hue}, 100%, 30%, 0)`)
      ctx.beginPath()
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
    }

    frame++
    if (frame < 140 || flames.length > 0) {
      requestAnimationFrame(draw)
    } else if (!doneFired) {
      doneFired = true
      onDone()
    }
  }
  draw()
}

// ──────────────────────────────────────────────
// 색변화 / 용해 애니메이션
// ──────────────────────────────────────────────
function animColorChange(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  color: string,
  onDone: () => void
) {
  const W = canvas.width, H = canvas.height
  let progress = 0
  let doneFired = false

  // Ink drops
  const drops: { x: number; y: number; r: number; maxR: number }[] = []
  for (let i = 0; i < 8; i++) {
    drops.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0,
      maxR: Math.random() * 80 + 40,
    })
  }

  const draw = () => {
    // Water bg
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, `rgba(10, 22, 40, ${1 - progress * 0.3})`)
    grad.addColorStop(1, `rgba(13, 34, 68, ${1 - progress * 0.3})`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    drops.forEach((d, i) => {
      const delay = i * 0.12
      const p = Math.max(0, (progress - delay) / (1 - delay))
      d.r = d.maxR * Math.min(p * 1.5, 1)

      if (d.r > 0) {
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r)
        g.addColorStop(0, color + 'CC')
        g.addColorStop(1, color + '00')
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      }
    })

    // Overlay blend as fully mixed
    if (progress > 0.7) {
      const overlay = ctx.createLinearGradient(0, 0, 0, H)
      overlay.addColorStop(0, color + Math.floor((progress - 0.7) / 0.3 * 0xAA).toString(16).padStart(2, '0'))
      overlay.addColorStop(1, color + Math.floor((progress - 0.7) / 0.3 * 0x66).toString(16).padStart(2, '0'))
      ctx.fillStyle = overlay
      ctx.fillRect(0, 0, W, H)
    }

    progress += 0.008
    if (progress < 1) {
      requestAnimationFrame(draw)
    } else if (!doneFired) {
      doneFired = true
      setTimeout(onDone, 800)
    }
  }
  draw()
}
