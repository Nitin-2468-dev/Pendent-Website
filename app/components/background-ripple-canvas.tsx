'use client'

import { useEffect, useRef } from 'react'

type CellPulse = {
  x: number
  y: number
  startsAt: number
  duration: number
}

type Ripple = {
  cells: CellPulse[]
  nextCell: number
  activeCells: CellPulse[]
}

/**
 * Lightweight canvas ripple layer.
 *
 * The grid is a CSS background. This component only draws cells while a ripple
 * is active, avoiding one React element and event handler per grid square.
 */
export function BackgroundRippleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })

    if (!canvas || !context) return

    const cellSize = 56
    const frameInterval = 1000 / 30
    const ripples: Ripple[] = []
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)')

    let width = 0
    let height = 0
    let animationFrame = 0
    let lastDrawAt = 0
    let isDark = darkMode.matches

    const resize = () => {
      // Cap device pixel ratio to avoid oversized canvases on high-DPI phones.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (now: number) => {
      animationFrame = 0

      // 30 FPS is plenty for this decorative effect and halves paint work.
      if (now - lastDrawAt < frameInterval) {
        animationFrame = window.requestAnimationFrame(draw)
        return
      }
      lastDrawAt = now

      context.clearRect(0, 0, width, height)

      const color = isDark ? '255, 255, 255' : '0, 0, 0'

      for (let rippleIndex = ripples.length - 1; rippleIndex >= 0; rippleIndex -= 1) {
        const ripple = ripples[rippleIndex]

        // Move newly reached cells into a small active set. Cells further out
        // remain queued and are not recalculated on every animation frame.
        while (
          ripple.nextCell < ripple.cells.length &&
          ripple.cells[ripple.nextCell].startsAt <= now
        ) {
          ripple.activeCells.push(ripple.cells[ripple.nextCell])
          ripple.nextCell += 1
        }

        for (let index = ripple.activeCells.length - 1; index >= 0; index -= 1) {
          const cell = ripple.activeCells[index]
          const progress = (now - cell.startsAt) / cell.duration

          if (progress >= 1) {
            ripple.activeCells.splice(index, 1)
            continue
          }

          if (progress < 0) continue

          const pulse = Math.sin(progress * Math.PI)
          if (pulse <= 0) continue

          const scale = 1 - pulse * 0.10
          const size = cellSize * scale
          const inset = (cellSize - size) / 2
          const alpha = pulse * (isDark ? 0.18 : 0.11)

          context.fillStyle = `rgba(${color}, ${alpha})`
          context.fillRect(
            cell.x + inset,
            cell.y + inset,
            size,
            size,
          )
        }

        const hasPendingCells = ripple.nextCell < ripple.cells.length
        if (!hasPendingCells && ripple.activeCells.length === 0) {
          ripples.splice(rippleIndex, 1)
        }
      }

      if (ripples.length > 0) {
        animationFrame = window.requestAnimationFrame(draw)
      }
    }

    const startRipple = (event: PointerEvent) => {
      // Content remains fully interactive; only exposed page background clicks
      // start a ripple, as with the original behind-the-content grid.
      const target = event.target
      if (target instanceof Element && target.closest('main')) return
      if (reducedMotion.matches) return

      const columns = Math.ceil(width / cellSize)
      const rows = Math.ceil(height / cellSize)
      const originColumn = Math.floor(event.clientX / cellSize)
      const originRow = Math.floor(event.clientY / cellSize)
      const startedAt = performance.now()
      const cells: CellPulse[] = []

      // Calculate distances once per click, then process cells in wave order.
      for (let row = 0; row <= rows; row += 1) {
        for (let column = 0; column <= columns; column += 1) {
          const distance = Math.hypot(
            originColumn - column,
            originRow - row,
          )

          cells.push({
            x: column * cellSize,
            y: row * cellSize,
            startsAt: startedAt + distance * 48,
            duration: 220 + distance * 55,
          })
        }
      }

      cells.sort((a, b) => a.startsAt - b.startsAt)
      ripples.push({ cells, nextCell: 0, activeCells: [] })

      // Bound memory and drawing work during repeated background clicks.
      if (ripples.length > 2) ripples.shift()

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
