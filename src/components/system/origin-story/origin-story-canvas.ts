/**
 * [INPUT]: 依赖浏览器 Canvas 2D API 与 origin-story-content 的创作初衷正文。
 * [OUTPUT]: 对外提供 drawFullStoryCanvas 与 drawVisibleTexture，生成完整长文纸页和可滚动视口纹理。
 * [POS]: components/system/origin-story 的创作初衷纸页纹理层，被 origin-story-paper 的 WebGL 材质消费。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import {
  originStoryFooter,
  originStorySourceLabel,
  originStorySubtitle,
  originStoryTitle,
  storyParagraphs,
} from './origin-story-content'

const canvasDisplayFont = '"Songti SC", "STSong", "New York", "Times New Roman", serif'
const canvasUiFont = '"PingFang SC", "Hiragino Sans GB", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'

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
  gradient.addColorStop(0, '#f4eddd')
  gradient.addColorStop(0.52, '#eadfc9')
  gradient.addColorStop(1, '#d7c7a8')
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
  for (const [index, paragraph] of storyParagraphs.entries()) {
    const lines = wrapText(context, paragraph, maxWidth)
    const isEnding = index === storyParagraphs.length - 1
    const lineHeight = isEnding ? 76 : 64
    y += lines.length * lineHeight
    y += isEnding ? 156 : 42
  }

  return Math.ceil(y + 260)
}

export function drawFullStoryCanvas() {
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
  context.fillText(originStoryTitle, marginX, y)
  y += 72

  context.fillStyle = 'rgba(32, 26, 20, 0.56)'
  context.font = `500 30px ${canvasUiFont}`
  context.fillText(originStorySubtitle, marginX, y)
  y += 86

  for (const [index, paragraph] of storyParagraphs.entries()) {
    const isEnding = index === storyParagraphs.length - 1
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

  y += 22
  context.fillStyle = '#9b6b54'
  context.font = `500 28px ${canvasUiFont}`
  context.fillText(originStorySourceLabel, marginX, y)

  return canvas
}

export function drawVisibleTexture(
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
