/**
 * [INPUT]: 依赖 react 的弹层生命周期、three 的 WebGL 纸张网格、工作区侧栏偏移、顶部问号按钮 anchor、刘勇原文常量与 03 Apple Editorial canvas 字体常量。
 * [OUTPUT]: 对外提供 OriginStoryPaper，点击顶栏问号后渲染带 Verlet 粒子约束的创作初衷纸页，并支持 Esc、背景点击与键盘辅助关闭。
 * [POS]: src/components/system 的情感入口层，承接帮助按钮，将创作初衷故事以可拖拽纸页呈现，并保留可访问原文副本。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useRef, useState, type RefObject } from 'react'

type OriginStoryPaperProps = {
  anchorRef: RefObject<HTMLElement>
  onClose: () => void
  open: boolean
  theme: 'dark' | 'light'
}

type StageBox = {
  height: number
  left: number
  top: number
  width: number
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

const storyParagraphs = [
  '昨天我路过以前的家，2018年方法官确诊后我们就搬离了那里',
  '小区马路对面是个六层的楼，以前是一家公司的办公楼',
  '大堂里挂着一盏巨大的华丽的水晶吊灯',
  '一到晚上，两个保安就会打开这盏吊灯，照的大堂里金碧辉煌，大理石的地板泛着光',
  '我们20年前搬去的第一天，晚上散步时，就被那灯光所吸引',
  '那个时候，每天晚上，晚饭后，我们散散步；散完了回家，方法官读书写文章，我也读书写文章',
  '有天很晚了，我们两个看书都有点疲了',
  '我说“方法官，请你跳个舞吧”',
  '她说“啊，这么晚了，去哪里跳呢？”',
  '我说“对面的大堂，灯光那么亮，地板那么平，多好的场地”',
  '她说“好像是的”',
  '于是，我们以最快的速度，她换上我给她买的礼服裙子，我换上她给我买的三件套西装',
  '半夜三更，我们去了对面的大楼大堂',
  '轻声的放《一步之遥》，开心的跳了起来',
  '03年时候方法官第一次去我宿舍，我电脑上放《闻香识女人》给她看',
  '看到弗兰克和唐娜一曲《一步之遥》舞毕',
  '我们笑意盈盈对视，眼睛亮晶晶',
  '我们去找一个跟我们两个关系都要好的女同学--她是舞后，我们的交谊舞就是她教我们的，请她教我们跳探戈',
  '女同学鄙夷的说“我是前世不修啊，去长风公园划船我给你们两个划！现在还要教你们跳探戈！”',
  '她看了几十遍《闻香识女人》、《真实的谎言》的跳舞片段',
  '然后教我们两个跳探戈',
  '臂下悬、折腰、拖步',
  '她说 “just tango on”',
  '于是我和方法官就 just tango on，从学校一路 on 到了 对面的大堂，从03年 on 到了 18年',
  '18年方法官确诊了，骨头上长满了病灶，不能 tango on 了',
  '有时候我们两在家里，放起音乐，抱着轻轻的踱两步，权当是 just tango on 了',
  '我说“要是80年代，我们这就叫开黑灯舞会跳贴面舞，那都是要严打的”',
  '有时候我们去复兴公园，坐在长椅上，看着老头老太翩翩起舞，给她们鼓掌',
  '想着我们老了以后',
  '现在，对面的大楼已经改造成了一个酒店公寓',
  '大堂和水晶吊灯都没了',
  '而我',
  'just tango on 的那个人也没了',
  '20年前那个晚上，伴着音乐，方法官做臂下悬，裙摆被带动散开宛如一朵花绽放的时候',
  '我是想不到会有今天的',
  '当时只道是寻常',
]

const originStoryText = storyParagraphs.join('\n\n')
const originStoryFooter =
  '作者是一位律师，大家习惯称呼为刘律，他呼吁大家自学自救，至今依旧在为患者朋友们无偿解答疑惑。最近刘律在完成他的小说，如果出版我也会第一时间附上阅读链接。希望刘律能调整好自己的状态拥抱生活，爱一直在那里，tango always on。愿每一段治疗经历，都能被清楚整理、温柔保存，并在真正需要的时候，来得及被看见。'
const canvasDisplayFont = '"Songti SC", "STSong", "New York", "Times New Roman", serif'
const canvasUiFont = '"PingFang SC", "Hiragino Sans GB", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
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

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = []
  let line = ''

  for (const character of text) {
    const nextLine = `${line}${character}`
    if (line && context.measureText(nextLine).width > maxWidth) {
      lines.push(line)
      line = character
    } else {
      line = nextLine
    }
  }

  if (line) {
    lines.push(line)
  }

  return lines
}

function paintPaperBase(context: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = context.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#fffdf7')
  gradient.addColorStop(0.52, '#fffaf0')
  gradient.addColorStop(1, '#f6efe0')
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)

  context.strokeStyle = 'rgba(91, 72, 45, 0.08)'
  context.lineWidth = 1
  for (let y = 44; y < height; y += 48) {
    context.beginPath()
    context.moveTo(72, y)
    context.lineTo(width - 72, y + Math.sin(y * 0.013) * 1.4)
    context.stroke()
  }

  context.globalAlpha = 0.18
  for (let i = 0; i < 520; i += 1) {
    const x = (i * 73) % width
    const y = (i * 191) % height
    const length = 12 + ((i * 17) % 42)
    context.strokeStyle = i % 3 === 0 ? '#ded0b6' : '#ffffff'
    context.lineWidth = 0.7
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + length, y + ((i % 5) - 2) * 0.5)
    context.stroke()
  }
  context.globalAlpha = 1

  context.fillStyle = 'rgba(232, 93, 42, 0.95)'
  context.fillRect(96, 80, 8, 88)
}

function measureStoryHeight(context: CanvasRenderingContext2D, width: number) {
  const marginX = 136
  const maxWidth = width - marginX * 2
  let y = 308

  context.font = `400 42px ${canvasUiFont}`
  for (const paragraph of storyParagraphs) {
    const lines = wrapText(context, paragraph, maxWidth)
    const lineHeight = paragraph === '当时只道是寻常' ? 76 : 64
    y += lines.length * lineHeight
    y += paragraph === '当时只道是寻常' ? 156 : 42
  }

  return Math.ceil(y + 260)
}

function drawFullStoryCanvas() {
  const width = 1440
  const scratch = document.createElement('canvas')
  const scratchContext = scratch.getContext('2d')
  if (!scratchContext) {
    throw new Error('Canvas 2D context is not available.')
  }

  const height = measureStoryHeight(scratchContext, width)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context is not available.')
  }

  paintPaperBase(context, width, height)

  const marginX = 136
  const maxWidth = width - marginX * 2
  let y = 128

  context.fillStyle = '#201a14'
  context.font = `800 70px ${canvasDisplayFont}`
  context.fillText('为什么做一页萤屿', marginX, y)
  y += 72

  context.fillStyle = 'rgba(32, 26, 20, 0.56)'
  context.font = `500 30px ${canvasUiFont}`
  context.fillText('我在病友群读到的一则故事（原文）', marginX, y)
  y += 86

  for (const paragraph of storyParagraphs) {
    const isEnding = paragraph === '当时只道是寻常'
    context.fillStyle = isEnding ? '#22180f' : 'rgba(32, 26, 20, 0.86)'
    context.font = isEnding
      ? `800 52px ${canvasDisplayFont}`
      : `400 40px ${canvasUiFont}`

    if (isEnding) {
      y += 52
      context.fillStyle = 'rgba(232, 93, 42, 0.18)'
      context.fillRect(marginX, y - 34, 248, 2)
      context.fillStyle = '#22180f'
    }

    const lines = wrapText(context, paragraph, maxWidth)
    const lineHeight = isEnding ? 76 : 64
    for (const line of lines) {
      context.fillText(line, marginX, y)
      y += lineHeight
    }
    y += isEnding ? 110 : 42
  }

  context.fillStyle = 'rgba(32, 26, 20, 0.46)'
  context.font = `500 28px ${canvasUiFont}`
  for (const line of wrapText(context, originStoryFooter, maxWidth)) {
    context.fillText(line, marginX, y)
    y += 46
  }

  return canvas
}

function drawVisibleTexture(
  context: CanvasRenderingContext2D,
  fullCanvas: HTMLCanvasElement,
  scrollOffset: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  context.clearRect(0, 0, viewportWidth, viewportHeight)
  paintPaperBase(context, viewportWidth, viewportHeight)
  context.drawImage(fullCanvas, 0, scrollOffset, fullCanvas.width, viewportHeight, 0, 0, viewportWidth, viewportHeight)

  const progress = fullCanvas.height <= viewportHeight ? 1 : scrollOffset / (fullCanvas.height - viewportHeight)
  context.fillStyle = 'rgba(32, 26, 20, 0.12)'
  context.fillRect(viewportWidth - 52, 130, 5, viewportHeight - 260)
  context.fillStyle = 'rgba(232, 93, 42, 0.62)'
  context.fillRect(viewportWidth - 53, 130 + (viewportHeight - 320) * progress, 7, 72)
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
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-white/82 px-4 py-20 backdrop-blur-sm md:pl-[var(--ff-sidebar-offset)]"
      id="origin-story-paper"
      role="dialog"
    >
      <article
        className={`relative max-h-[78vh] w-[min(36rem,calc(100vw-2rem))] overflow-y-auto rounded-[10px] border px-7 py-8 shadow-[0_22px_70px_rgba(36,26,12,0.18)] ${
          theme === 'dark' ? 'border-[#3b3328] bg-[#fffaf0] text-[#201a14]' : 'border-[#e0d6c4] bg-[#fffaf0] text-[#201a14]'
        }`}
      >
        <OriginStoryCloseButton onClose={onClose} />
        <h2 className="text-3xl font-black tracking-tight">为什么做一页萤屿</h2>
        <p className="mt-2 text-sm font-semibold text-[#756858]">我在病友群读到的一则故事（原文）</p>
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

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(stageBox.width, stageBox.height)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
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
      camera.lookAt(0, 0, 0)

      scene.add(new THREE.AmbientLight(0xfffbf0, 1.9))
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
      keyLight.position.set(-2.6, 3.8, 6)
      keyLight.castShadow = true
      keyLight.shadow.mapSize.set(1024, 1024)
      scene.add(keyLight)

      const cols = 34
      const rows = 54
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
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy()

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
      let grabbedIndex: number | null = null
      let animationFrame = 0
      let tick = 0

      const updatePointer = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect()
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(pointer, camera)
        raycaster.ray.intersectPlane(dragPlane, dragTarget)
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
        const pullRadius = 0.72
        for (const particle of particles) {
          if (particle.fixed) {
            continue
          }

          const distance = Math.hypot(particle.ox - grabbed.ox, particle.oy - grabbed.oy)
          if (distance > pullRadius) {
            continue
          }

          const influence = (1 - distance / pullRadius) ** 2
          particle.x += (target.x - grabbed.x) * influence
          particle.y += (target.y - grabbed.y) * influence
          particle.z += (0.42 - grabbed.z) * influence
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
        updatePointer(event)
        grabbedIndex = findNearestParticle(dragTarget)
        tugPaper(dragTarget)
      }

      const onPointerMove = (event: PointerEvent) => {
        if (grabbedIndex === null) {
          return
        }

        updatePointer(event)
        tugPaper(dragTarget)
      }

      const onPointerUp = (event: PointerEvent) => {
        if (renderer.domElement.hasPointerCapture(event.pointerId)) {
          renderer.domElement.releasePointerCapture(event.pointerId)
        }
        grabbedIndex = null
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

        for (let i = 0; i < 5; i += 1) {
          solveConstraints()
        }
      }

      const updateGeometry = () => {
        const positions = geometry.attributes.position
        for (let i = 0; i < particles.length; i += 1) {
          const particle = particles[i]
          positions.setXYZ(i, particle.x, particle.y, particle.z)
        }
        positions.needsUpdate = true
        geometry.computeVertexNormals()
      }

      const animate = () => {
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
      <article className="sr-only">
        <h2>为什么做一页萤屿</h2>
        <p>我在病友群读到的一则故事（原文）</p>
        <p>{originStoryText}</p>
        <p>{originStoryFooter}</p>
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
      const shellLeft = window.matchMedia('(min-width: 768px)').matches && Number.isFinite(rawShellLeft) ? rawShellLeft : 0
      const availableWidth = window.innerWidth - shellLeft
      const top = Math.round((anchor?.bottom ?? 68) + 16)
      const targetWidth = Math.min(620, Math.max(320, availableWidth - 48))
      const width = Math.round(Math.min(targetWidth, window.innerWidth - 32))
      const availableHeight = window.innerHeight - top - 24
      const height = Math.round(clamp(availableHeight, 520, 760))
      const left = Math.round(shellLeft + (availableWidth - width) / 2)
      setStageBox({ height, left, top, width })
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
      className="fixed inset-0 z-[90] bg-white/72 backdrop-blur-[2px]"
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
