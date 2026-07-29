/**
 * [INPUT]: 依赖 react 的弹层生命周期、three 的 WebGL 纸张网格、工作区侧栏偏移、顶部问号按钮 anchor、origin-story-content 与 origin-story-canvas。
 * [OUTPUT]: 对外提供 OriginStoryPaper 组件、calculateOriginStoryStageBox 尺寸函数与 getOriginStoryClothBudget 性能预算，点击顶栏问号后渲染全屏自适应阅读舞台、暗档案遮罩、带 Verlet 粒子约束的创作初衷纸页，并支持 Esc、背景点击与键盘辅助关闭。
 * [POS]: src/components/system/origin-story 的情感入口层，承接帮助按钮，将创作初衷故事以可拖拽纸页呈现，并保留可访问原文副本。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useRef, useState, type RefObject } from 'react'

import { drawFullStoryCanvas, drawVisibleTexture } from './origin-story-canvas'
import {
  originStoryFooter,
  originStorySourceLabel,
  originStorySourceUrl,
  originStorySubtitle,
  originStoryText,
  originStoryTitle,
} from './origin-story-content'

type OriginStoryPaperProps = {
  anchorRef: RefObject<HTMLElement>
  onClose: () => void
  open: boolean
  theme: 'dark' | 'light'
}

export type StageBox = {
  height: number
  left: number
  top: number
  width: number
}

export type OriginStoryStageBoxInput = {
  anchorBottom?: number
  isDesktop: boolean
  rawShellLeft: number
  viewportHeight: number
  viewportWidth: number
}

export type OriginStoryClothBudget = {
  columns: number
  constraintIterations: number
  maxAnisotropy: number
  maxPixelRatio: number
  normalRecomputeInterval: number
  rows: number
  shadowMapSize: number
  vertexCount: number
}

type Particle = {
  fixed: boolean
  ox: number
  oy: number
  oz: number
  px: number
  py: number
  pz: number
  x: number
  y: number
  z: number
}

type Constraint = {
  a: number
  b: number
  rest: number
  stiffness: number
}

type DragInfluence = {
  index: number
  influence: number
}

const maxStageWidth = 1040
const minStageWidth = 360
const stageHorizontalGutter = 32
const stageBottomGap = 16
const maxStageHeight = 1080
const minStageHeight = 560
const defaultAnchorBottom = 68
const stageTopGap = 8
const dragPullRadius = 0.72
const originStoryClothBudget = {
  columns: 28,
  constraintIterations: 3,
  maxAnisotropy: 4,
  maxPixelRatio: 1.5,
  normalRecomputeInterval: 4,
  rows: 44,
  shadowMapSize: 512,
} satisfies Omit<OriginStoryClothBudget, 'vertexCount'>

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function getOriginStoryClothBudget(): OriginStoryClothBudget {
  return {
    ...originStoryClothBudget,
    vertexCount: originStoryClothBudget.columns * originStoryClothBudget.rows,
  }
}

export function calculateOriginStoryStageBox({
  anchorBottom,
  isDesktop,
  rawShellLeft,
  viewportHeight,
  viewportWidth,
}: OriginStoryStageBoxInput): StageBox {
  const shellLeft = isDesktop && Number.isFinite(rawShellLeft) ? rawShellLeft : 0
  const availableWidth = viewportWidth - shellLeft
  const top = Math.round((anchorBottom ?? defaultAnchorBottom) + stageTopGap)
  const targetWidth = Math.min(maxStageWidth, Math.max(minStageWidth, availableWidth - stageHorizontalGutter))
  const widthLimit = Math.max(280, viewportWidth - 16)
  const width = Math.round(Math.min(targetWidth, widthLimit))
  const availableHeight = viewportHeight - top - stageBottomGap
  const heightLimit = Math.max(360, Math.min(maxStageHeight, availableHeight))
  const minHeight = Math.min(minStageHeight, heightLimit)
  const height = Math.round(clamp(availableHeight, minHeight, heightLimit))
  const left = Math.round(shellLeft + (availableWidth - width) / 2)

  return { height, left, top, width }
}

function OriginStoryCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      aria-label="关闭创作初衷"
      className="absolute right-4 top-4 z-[4] h-px w-px overflow-hidden border-0 bg-transparent p-0 text-xs font-semibold text-[#5d4931] opacity-0 transition-opacity focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-sm focus:bg-[#fffaf0] focus:px-3 focus:py-2 focus:opacity-100 focus:shadow-[0_8px_22px_rgba(36,26,12,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ff-accent-primary)]"
      data-origin-story-close-minimal="true"
      onClick={onClose}
      onMouseDown={(event) => event.stopPropagation()}
      title="关闭创作初衷"
      type="button"
    >
      关闭创作初衷
    </button>
  )
}

function OriginStorySourceLink({ className }: { className: string }) {
  return (
    <a
      className={className}
      href={originStorySourceUrl}
      onMouseDown={(event) => event.stopPropagation()}
      rel="noreferrer"
      target="_blank"
    >
      <span>{originStorySourceLabel}</span>
      <span aria-hidden="true">↗</span>
    </a>
  )
}

function supportsWebGL() {
  if (typeof document === 'undefined') {
    return false
  }

  const canvas = document.createElement('canvas')
  return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window === 'undefined' || !window.matchMedia ? false : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return reducedMotion
}

function buildParticles(cols: number, rows: number, paperWidth: number, paperHeight: number) {
  const particles: Particle[] = []

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = (col / (cols - 1) - 0.5) * paperWidth
      const y = (0.5 - row / (rows - 1)) * paperHeight
      const z = Math.sin(col * 0.55 + row * 0.23) * 0.012
      particles.push({
        fixed: row === 0,
        ox: x,
        oy: y,
        oz: 0,
        px: x,
        py: y,
        pz: z,
        x,
        y,
        z,
      })
    }
  }

  return particles
}

function buildConstraints(cols: number, rows: number, particles: Particle[]) {
  const constraints: Constraint[] = []
  const index = (row: number, col: number) => row * cols + col
  const addConstraint = (a: number, b: number, stiffness: number) => {
    const left = particles[a]
    const right = particles[b]
    const dx = left.x - right.x
    const dy = left.y - right.y
    const dz = left.z - right.z
    constraints.push({ a, b, rest: Math.hypot(dx, dy, dz), stiffness })
  }

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (col < cols - 1) {
        addConstraint(index(row, col), index(row, col + 1), row === 0 ? 1 : 0.78)
      }
      if (row < rows - 1) {
        addConstraint(index(row, col), index(row + 1, col), 0.82)
      }
      if (row < rows - 1 && col < cols - 1) {
        addConstraint(index(row, col), index(row + 1, col + 1), 0.32)
        addConstraint(index(row + 1, col), index(row, col + 1), 0.32)
      }
    }
  }

  return constraints
}

function FallbackPaper({ onClose, theme }: { onClose: () => void; theme: 'dark' | 'light' }) {
  return (
    <div
      aria-label="为什么做一页萤屿"
      aria-modal="true"
      className={`fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto px-4 py-6 backdrop-blur-[3px] md:pl-[var(--ff-sidebar-offset)] ${
        theme === 'dark' ? 'bg-[#071012]/78' : 'bg-[#cfc7b8]/72'
      }`}
      id="origin-story-paper"
      role="dialog"
    >
      <article
        className={`relative max-h-[calc(100dvh-3rem)] w-[min(56rem,calc(100vw-2rem))] overflow-y-auto rounded-[10px] border px-8 py-9 shadow-[0_24px_74px_rgba(16,13,8,0.32)] md:px-12 md:py-11 ${
          theme === 'dark' ? 'border-[#3b3328] bg-[#eadfc9] text-[#201a14]' : 'border-[#d1c3a8] bg-[#eadfc9] text-[#201a14]'
        }`}
      >
        <OriginStoryCloseButton onClose={onClose} />
        <h2 className="text-3xl font-black tracking-tight">{originStoryTitle}</h2>
        <p className="mt-2 text-sm font-semibold text-[#756858]">{originStorySubtitle}</p>
        <OriginStorySourceLink className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#c89478]/55 bg-[#fffaf0]/70 px-3 py-1.5 text-sm font-semibold text-[#8b4f35] transition hover:bg-[#fff3e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c87e56] focus-visible:ring-offset-2" />
        <div className="mt-8 whitespace-pre-wrap text-base leading-8">{originStoryText}</div>
        <p className="mt-10 border-t border-[#eadfce] pt-5 text-sm leading-7 text-[#756858]">{originStoryFooter}</p>
      </article>
    </div>
  )
}

function PaperScene({ onClose, stageBox }: { onClose: () => void; stageBox: StageBox }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    let disposed = false
    let cleanupScene: (() => void) | undefined

    async function startScene() {
      const THREE = await import('three')
      const activeContainer = containerRef.current
      if (disposed || !activeContainer) {
        return
      }

      const clothBudget = getOriginStoryClothBudget()
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, clothBudget.maxPixelRatio))
      renderer.setSize(stageBox.width, stageBox.height)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFShadowMap
      activeContainer.append(renderer.domElement)

      const scene = new THREE.Scene()
      const aspect = stageBox.width / stageBox.height
      const frustumHeight = 8.6
      const camera = new THREE.OrthographicCamera(
        (frustumHeight * aspect) / -2,
        (frustumHeight * aspect) / 2,
        frustumHeight / 2,
        frustumHeight / -2,
        0.1,
        40,
      )
      camera.position.set(0, 0, 12)
      camera.zoom = 1.14
      camera.updateProjectionMatrix()
      camera.lookAt(0, 0, 0)

      scene.add(new THREE.AmbientLight(0xfffbf0, 1.9))
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
      keyLight.position.set(-2.6, 3.8, 6)
      keyLight.castShadow = true
      keyLight.shadow.mapSize.set(clothBudget.shadowMapSize, clothBudget.shadowMapSize)
      scene.add(keyLight)

      const cols = clothBudget.columns
      const rows = clothBudget.rows
      const paperWidth = 5.45
      const paperHeight = 7.72
      const particles = buildParticles(cols, rows, paperWidth, paperHeight)
      const constraints = buildConstraints(cols, rows, particles)
      const geometry = new THREE.PlaneGeometry(paperWidth, paperHeight, cols - 1, rows - 1)

      const visibleCanvas = document.createElement('canvas')
      visibleCanvas.width = 1440
      visibleCanvas.height = 2140
      const visibleContext = visibleCanvas.getContext('2d')
      if (!visibleContext) {
        throw new Error('Canvas 2D context is not available.')
      }
      const fullStoryCanvas = drawFullStoryCanvas()
      let scrollOffset = 0
      drawVisibleTexture(visibleContext, fullStoryCanvas, scrollOffset, visibleCanvas.width, visibleCanvas.height)
      const texture = new THREE.CanvasTexture(visibleCanvas)
      texture.anisotropy = Math.min(clothBudget.maxAnisotropy, renderer.capabilities.getMaxAnisotropy())

      const paperMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0,
        roughness: 0.92,
        side: THREE.DoubleSide,
      })
      const paperMesh = new THREE.Mesh(geometry, paperMaterial)
      paperMesh.castShadow = true
      paperMesh.receiveShadow = true
      scene.add(paperMesh)

      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(paperWidth * 1.08, paperHeight * 1.08),
        new THREE.ShadowMaterial({ color: 0x3b2a12, opacity: 0.14 }),
      )
      shadowPlane.position.z = -0.45
      shadowPlane.receiveShadow = true
      scene.add(shadowPlane)

      const raycaster = new THREE.Raycaster()
      const pointer = new THREE.Vector2()
      const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
      const dragTarget = new THREE.Vector3()
      let dragInfluences: DragInfluence[] = []
      let grabbedIndex: number | null = null
      let animationFrame = 0
      let canvasRect: DOMRect | null = null
      let frame = 0
      let hasQueuedDrag = false
      let queuedDragClientX = 0
      let queuedDragClientY = 0
      let tick = 0

      const updatePointer = (clientX: number, clientY: number) => {
        const rect = canvasRect ?? renderer.domElement.getBoundingClientRect()
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(pointer, camera)
        raycaster.ray.intersectPlane(dragPlane, dragTarget)
      }

      const queueDrag = (event: PointerEvent) => {
        queuedDragClientX = event.clientX
        queuedDragClientY = event.clientY
        hasQueuedDrag = true
      }

      const prepareDragInfluences = () => {
        if (grabbedIndex === null) {
          dragInfluences = []
          return
        }

        const grabbed = particles[grabbedIndex]
        const influences: DragInfluence[] = []
        for (let index = cols; index < particles.length; index += 1) {
          const particle = particles[index]
          const distance = Math.hypot(particle.ox - grabbed.ox, particle.oy - grabbed.oy)
          if (distance <= dragPullRadius) {
            influences.push({ index, influence: (1 - distance / dragPullRadius) ** 2 })
          }
        }
        dragInfluences = influences
      }

      const findNearestParticle = (target: import('three').Vector3) => {
        let nearestIndex = 0
        let nearestDistance = Number.POSITIVE_INFINITY
        for (let i = cols; i < particles.length; i += 1) {
          const particle = particles[i]
          const distance = Math.hypot(particle.x - target.x, particle.y - target.y, particle.z - target.z)
          if (distance < nearestDistance) {
            nearestDistance = distance
            nearestIndex = i
          }
        }
        return nearestIndex
      }

      const tugPaper = (target: import('three').Vector3) => {
        if (grabbedIndex === null) {
          return
        }

        const grabbed = particles[grabbedIndex]
        const pullX = target.x - grabbed.x
        const pullY = target.y - grabbed.y
        const pullZ = 0.42 - grabbed.z
        for (const { index, influence } of dragInfluences) {
          const particle = particles[index]
          particle.x += pullX * influence
          particle.y += pullY * influence
          particle.z += pullZ * influence
          particle.px = particle.x
          particle.py = particle.y
          particle.pz = particle.z
        }
      }

      const onPointerDown = (event: PointerEvent) => {
        if (event.button !== 0) {
          return
        }

        renderer.domElement.setPointerCapture(event.pointerId)
        canvasRect = renderer.domElement.getBoundingClientRect()
        updatePointer(event.clientX, event.clientY)
        grabbedIndex = findNearestParticle(dragTarget)
        prepareDragInfluences()
        tugPaper(dragTarget)
      }

      const onPointerMove = (event: PointerEvent) => {
        if (grabbedIndex === null) {
          return
        }

        queueDrag(event)
      }

      const onPointerUp = (event: PointerEvent) => {
        if (renderer.domElement.hasPointerCapture(event.pointerId)) {
          renderer.domElement.releasePointerCapture(event.pointerId)
        }
        canvasRect = null
        dragInfluences = []
        grabbedIndex = null
        hasQueuedDrag = false
      }

      const onWheel = (event: WheelEvent) => {
        event.preventDefault()
        const maxScroll = Math.max(0, fullStoryCanvas.height - visibleCanvas.height)
        scrollOffset = clamp(scrollOffset + event.deltaY * 2.2, 0, maxScroll)
        drawVisibleTexture(visibleContext, fullStoryCanvas, scrollOffset, visibleCanvas.width, visibleCanvas.height)
        texture.needsUpdate = true
      }

      renderer.domElement.addEventListener('pointerdown', onPointerDown)
      renderer.domElement.addEventListener('pointermove', onPointerMove)
      renderer.domElement.addEventListener('pointerup', onPointerUp)
      renderer.domElement.addEventListener('pointercancel', onPointerUp)
      renderer.domElement.addEventListener('wheel', onWheel, { passive: false })

      const solveConstraints = () => {
        for (const constraint of constraints) {
          const left = particles[constraint.a]
          const right = particles[constraint.b]
          const dx = right.x - left.x
          const dy = right.y - left.y
          const dz = right.z - left.z
          const distance = Math.hypot(dx, dy, dz) || 1
          const correction = ((distance - constraint.rest) / distance) * constraint.stiffness
          const cx = dx * correction * 0.5
          const cy = dy * correction * 0.5
          const cz = dz * correction * 0.5

          if (!left.fixed) {
            left.x += cx
            left.y += cy
            left.z += cz
          }
          if (!right.fixed) {
            right.x -= cx
            right.y -= cy
            right.z -= cz
          }
        }

        for (let col = 0; col < cols; col += 1) {
          const particle = particles[col]
          particle.x = particle.ox
          particle.y = particle.oy
          particle.z = 0
          particle.px = particle.ox
          particle.py = particle.oy
          particle.pz = 0
        }
      }

      const simulate = () => {
        tick += 1
        for (let i = cols; i < particles.length; i += 1) {
          const particle = particles[i]
          const vx = (particle.x - particle.px) * 0.982
          const vy = (particle.y - particle.py) * 0.982
          const vz = (particle.z - particle.pz) * 0.966
          particle.px = particle.x
          particle.py = particle.y
          particle.pz = particle.z
          particle.x += vx + (particle.ox - particle.x) * 0.0018
          particle.y += vy - 0.0016 + (particle.oy - particle.y) * 0.0024
          particle.z += vz + Math.sin(tick * 0.024 + particle.ox * 1.7 + particle.oy) * 0.00085 - particle.z * 0.018
        }

        for (let i = 0; i < clothBudget.constraintIterations; i += 1) {
          solveConstraints()
        }
      }

      const updateGeometry = () => {
        frame += 1
        const positions = geometry.attributes.position
        for (let i = 0; i < particles.length; i += 1) {
          const particle = particles[i]
          positions.setXYZ(i, particle.x, particle.y, particle.z)
        }
        positions.needsUpdate = true
        if (frame === 1 || frame % clothBudget.normalRecomputeInterval === 0) {
          geometry.computeVertexNormals()
        }
      }

      const flushQueuedDrag = () => {
        if (grabbedIndex === null || !hasQueuedDrag) {
          return
        }

        hasQueuedDrag = false
        updatePointer(queuedDragClientX, queuedDragClientY)
        tugPaper(dragTarget)
      }

      const animate = () => {
        flushQueuedDrag()
        simulate()
        updateGeometry()
        renderer.render(scene, camera)
        animationFrame = window.requestAnimationFrame(animate)
      }
      animate()

      cleanupScene = () => {
        window.cancelAnimationFrame(animationFrame)
        renderer.domElement.removeEventListener('pointerdown', onPointerDown)
        renderer.domElement.removeEventListener('pointermove', onPointerMove)
        renderer.domElement.removeEventListener('pointerup', onPointerUp)
        renderer.domElement.removeEventListener('pointercancel', onPointerUp)
        renderer.domElement.removeEventListener('wheel', onWheel)
        geometry.dispose()
        paperMaterial.dispose()
        texture.dispose()
        shadowPlane.geometry.dispose()
        ;(shadowPlane.material as import('three').Material).dispose()
        renderer.dispose()
        renderer.domElement.remove()
      }
    }

    void startScene()

    return () => {
      disposed = true
      cleanupScene?.()
    }
  }, [stageBox.height, stageBox.width])

  return (
    <div
      className="origin-story-stage fixed z-[92] cursor-grab active:cursor-grabbing"
      ref={containerRef}
      style={{ height: stageBox.height, left: stageBox.left, top: stageBox.top, width: stageBox.width }}
    >
      <OriginStoryCloseButton onClose={onClose} />
      <OriginStorySourceLink className="absolute bottom-5 left-5 z-20 inline-flex items-center gap-2 rounded-full border border-[#c89478]/65 bg-[#fffaf0]/94 px-3 py-1.5 text-sm font-semibold text-[#8b4f35] shadow-[0_8px_22px_rgba(73,43,27,0.18)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c87e56] focus-visible:ring-offset-2" />
      <article className="sr-only">
        <h2>{originStoryTitle}</h2>
        <p>{originStorySubtitle}</p>
        <p>{originStoryText}</p>
        <p>{originStoryFooter}</p>
        <a href={originStorySourceUrl} rel="noreferrer" target="_blank">
          {originStorySourceLabel}
        </a>
      </article>
    </div>
  )
}

export function OriginStoryPaper({ anchorRef, onClose, open, theme }: OriginStoryPaperProps) {
  const reducedMotion = useReducedMotion()
  const [stageBox, setStageBox] = useState<StageBox | null>(null)
  const [webglReady, setWebglReady] = useState(true)

  useEffect(() => {
    if (!open) {
      return
    }

    const updateBox = () => {
      const anchor = anchorRef.current?.getBoundingClientRect()
      const rawShellLeft = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--ff-sidebar-offset'),
      )
      setStageBox(
        calculateOriginStoryStageBox({
          anchorBottom: anchor?.bottom,
          isDesktop: window.matchMedia('(min-width: 768px)').matches,
          rawShellLeft,
          viewportHeight: window.innerHeight,
          viewportWidth: window.innerWidth,
        }),
      )
      setWebglReady(supportsWebGL())
    }

    updateBox()
    window.addEventListener('resize', updateBox)
    return () => window.removeEventListener('resize', updateBox)
  }, [anchorRef, open])

  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  if (!open) {
    return null
  }

  if (reducedMotion || !webglReady || !stageBox) {
    return <FallbackPaper onClose={onClose} theme={theme} />
  }

  return (
    <div
      aria-label="为什么做一页萤屿"
      aria-modal="true"
      className={`fixed inset-0 z-[90] backdrop-blur-[3px] ${theme === 'dark' ? 'bg-[#071012]/78' : 'bg-[#cfc7b8]/72'}`}
      id="origin-story-paper"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      role="dialog"
    >
      <PaperScene onClose={onClose} stageBox={stageBox} />
    </div>
  )
}
