/**
 * [INPUT]: 依赖 react 的 useRef/useEffect/useCallback/useMemo
 * [OUTPUT]: 对外提供 DotGrid 组件
 * [POS]: effects/ 的点阵特效组件，被 Hero 作为背景使用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useRef, useEffect, useMemo } from 'react'

/* ========================================================================
   工具函数
   ======================================================================== */

function hexToRgb(hex) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return { r: 0, g: 0, b: 0 }
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16)
  }
}

/* ========================================================================
   DotGrid - Canvas 点阵特效
   ======================================================================== */

function DotGrid({
  dotSize = 6,
  gap = 28,
  baseColor = '#a3a3a3',
  activeColor = '#000000',
  proximity = 150,
  className = '',
  style
}) {
  const canvasRef = useRef(null)
  const dotsRef = useRef([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const rafRef = useRef(null)

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor])
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    /* ----------------------------------------------------------------
       初始化画布尺寸与点阵
       ---------------------------------------------------------------- */
    const initCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return

      const { width, height } = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // 构建点阵
      const cell = dotSize + gap
      const cols = Math.ceil(width / cell) + 1
      const rows = Math.ceil(height / cell) + 1

      const dots = []
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          dots.push({
            x: x * cell + dotSize / 2,
            y: y * cell + dotSize / 2
          })
        }
      }
      dotsRef.current = dots
    }

    initCanvas()

    /* ----------------------------------------------------------------
       渲染循环
       ---------------------------------------------------------------- */
    const render = () => {
      const { width, height } = canvas
      const dpr = window.devicePixelRatio || 1
      ctx.clearRect(0, 0, width / dpr, height / dpr)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const proxSq = proximity * proximity

      for (const dot of dotsRef.current) {
        const dx = dot.x - mx
        const dy = dot.y - my
        const distSq = dx * dx + dy * dy

        let r = baseRgb.r
        let g = baseRgb.g
        let b = baseRgb.b

        if (distSq < proxSq) {
          const dist = Math.sqrt(distSq)
          const t = 1 - dist / proximity
          r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t)
          g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t)
          b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t)
        }

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dotSize / 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(render)
    }

    render()

    /* ----------------------------------------------------------------
       事件监听
       ---------------------------------------------------------------- */
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    const handleResize = () => {
      initCanvas()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('resize', handleResize)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', handleResize)
    }
  }, [dotSize, gap, proximity, baseRgb, activeRgb])

  return (
    <div className={`w-full h-full ${className}`} style={style}>
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
    </div>
  )
}

export default DotGrid
