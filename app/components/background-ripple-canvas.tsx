'use client'

import { useEffect, useRef } from 'react'

type Ripple = {
  x: number
  y: number
  startedAt: number
  maxLifetime: number
}

/**
 * Canvas-based ripple layer.
 *
 * The grid itself is a CSS background. This canvas only paints transient
 * highlights after a click, so there are no per-cell React elements,
 * pointer handlers, or layout effects.
 */
export function BackgroundRippleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })

    if (!canvas || !context) return

    const cellSize = 56
    const ripples: Ripple[] = []
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)')

    let width = 0
    let height = 0
    let animationFrame = 0
    let isDark = darkMode.matches

    const resize = () => {
      // Cap DPR to keep the canvas inexpensive on high-density mobile screens.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (now: number) => {
      context.clearRect(0, 0, width, height)

      let hasActiveRipple = false
      const columns = Math.ceil(width / cellSize)
      const rows = Math.ceil(height / cellSize)
      const color = isDark ? '255, 255, 255' : '0, 0, 0'

      for (let rippleIndex = ripples.length - 1; rippleIndex >= 0; rippleIndex -= 1) {
        const ripple = ripples[rippleIndex]
        const age = now - ripple.startedAt

        if (age > ripple.maxLifetime) {
          ripples.splice(rippleIndex, 1)
          continue
        }

        hasActiveRipple = true
        const originColumn = Math.floor(ripple.x / cellSize)
        const originRow = Math.floor(ripple.y / cellSize)

        for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
            const distance = Math.hypot(column - originColumn, row - originRow)
            const delay = distance * 35
            const duration = 280 + distance * 35
            const progressTime = age - delay

            if (progressTime < 0 || progressTime > duration) continue

            const pulse = Math.sin((progressTime / duration) * Math.PI)
            if (pulse <= 0) continue

            const scale = 1 - pulse * 0.10
            const size = cellSize * scale
            const inset = (cellSize - size) / 2
            const alpha = pulse * (isDark ? 0.16 : 0.10)
            const x = column * cellSize + inset
            const y = row * cellSize + inset

            context.fillStyle = `rgba(${color}, ${alpha})`
            context.fillRect(x, y, size, size)
          }
        }
      }

      if (hasActiveRipple) {
        animationFrame = window.requestAnimationFrame(draw)
      } else {
        animationFrame = 0
      }
    }

    const startRipple = (event: PointerEvent) => {
      // The original grid sat behind the page content; only clicks on the
      // exposed background (not buttons, links, or article content) trigger it.
      const target = event.target
      if (target instanceof Element && target.closest('main')) return
      if (reducedMotion.matches) return

      const x = event.clientX
      const y = event.clientY
      const farthestColumn = Math.max(x / cellSize, (width - x) / cellSize)
      const farthestRow = Math.max(y / cellSize, (height - y) / cellSize)
      const maxDistance = Math.hypot(farthestColumn, farthestRow)

      ripples.push({
        x,
        y,
        startedAt: performance.now(),
        maxLifetime: maxDistance * 70 + 700,
      })

      // Prevent rapid repeated clicks from building an unbounded animation queue.
      if (ripples.length > 3) ripples.shift()

      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(draw)
      }
    }

    const onMotionPreferenceChange = () => {
      if (reducedMotion.matches) {
        ripples.length = 0
        if (animationFrame) window.cancelAnimationFrame(animationFrame)
        animationFrame = 0
        context.clearRect(0, 0, width, height)
      }
    }

    const onColorSchemeChange = (event: MediaQueryListEvent) => {
      isDark = event.matches
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointerdown', startRipple, { passive: true })
    reducedMotion.addEventListener('change', onMotionPreferenceChange)
    darkMode.addEventListener('change', onColorSchemeChange)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointerdown', startRipple)
      reducedMotion.removeEventListener('change', onMotionPreferenceChange)
      darkMode.removeEventListener('change', onColorSchemeChange)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="background-ripple-canvas"
    />
  )
}
