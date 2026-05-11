/**
 * [INPUT]: 依赖 html2canvas 捕获正式病历 DOM，依赖 jsPDF 生成 A4 portrait PDF，依赖浏览器 Blob / URL 下载能力。
 * [OUTPUT]: 对外提供 exportElementAsPdf 与 exportElementAsPng，并在截图克隆中清洗 html2canvas 不支持的现代 CSS 色值。
 * [POS]: lib 的跨页面导出边界，把 PDF/PNG 行为从 /app preview 迁出，供 /record/:id 正式档案面独占消费；兼容 V3 token 的 var/color-mix 视觉系统。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const EXPORT_BACKGROUND_COLOR = '#ffffff'
const EXPORT_COLOR_PROPERTIES = [
  'backgroundColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderRightColor',
  'borderTopColor',
  'color',
  'outlineColor',
  'textDecorationColor',
] as const

function getExportFileBase() {
  const date = new Date().toISOString().slice(0, 10)
  return `firefly-${date}`
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function normalizeSrgbChannel(token: string) {
  const value = token.endsWith('%') ? Number(token.slice(0, -1)) / 100 : Number(token)

  if (!Number.isFinite(value)) {
    return null
  }

  return Math.max(0, Math.min(255, Math.round((value <= 1 ? value * 255 : value))))
}

function normalizeSrgbAlpha(token: string | undefined) {
  if (!token) {
    return 1
  }

  const value = token.endsWith('%') ? Number(token.slice(0, -1)) / 100 : Number(token)
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1
}

function convertSrgbColor(value: string) {
  const match = value.match(/^color\(\s*srgb\s+(.+?)\s*\)$/i)

  if (!match) {
    return null
  }

  const [channels, alpha] = match[1].split('/').map((part) => part.trim())
  const [red, green, blue] = channels.split(/\s+/).map(normalizeSrgbChannel)

  if (red === null || green === null || blue === null) {
    return null
  }

  const opacity = normalizeSrgbAlpha(alpha)
  return opacity < 1 ? `rgba(${red}, ${green}, ${blue}, ${opacity})` : `rgb(${red}, ${green}, ${blue})`
}

function toExportSafeColor(value: string, fallback = 'transparent') {
  const color = value.trim()

  if (!color) {
    return fallback
  }

  const converted = convertSrgbColor(color)

  if (converted) {
    return converted
  }

  if (/^(#|rgb\(|rgba\(|hsl\(|hsla\(|transparent$|[a-z]+$)/i.test(color)) {
    return color
  }

  return fallback
}

function sanitizeExportNode(node: HTMLElement, view: Window) {
  const computed = view.getComputedStyle(node)
  const style = node.style as CSSStyleDeclaration & Record<string, string>

  for (const property of EXPORT_COLOR_PROPERTIES) {
    style[property] = toExportSafeColor(computed[property])
  }

  if (/color-mix\(|\bcolor\(|oklch\(|lab\(|lch\(/i.test(computed.backgroundImage)) {
    style.backgroundImage = 'none'
  }

  style.animation = 'none'
  style.boxShadow = 'none'
  style.filter = 'none'
  style.textShadow = 'none'
  style.transition = 'none'
}

function prepareRecordExportClone(_document: Document, cloneRoot: HTMLElement) {
  const view = cloneRoot.ownerDocument?.defaultView ?? _document.defaultView

  if (!view) {
    return
  }

  cloneRoot.setAttribute('data-firefly-export-snapshot', 'true')

  for (const node of [cloneRoot, ...cloneRoot.querySelectorAll<HTMLElement>('*')]) {
    sanitizeExportNode(node, view)
  }
}

async function renderRecordCanvas(element: HTMLElement) {
  return html2canvas(element, {
    backgroundColor: EXPORT_BACKGROUND_COLOR,
    onclone: prepareRecordExportClone,
    scale: 2,
    useCORS: true,
  })
}

export async function exportElementAsPng(element: HTMLElement) {
  const canvas = await renderRecordCanvas(element)
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })

  if (!blob) {
    throw new Error('Failed to create PNG blob.')
  }

  downloadBlob(blob, `${getExportFileBase()}.png`)
}

export async function exportElementAsPdf(element: HTMLElement) {
  const canvas = await renderRecordCanvas(element)
  const image = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ format: 'a4', orientation: 'portrait', unit: 'mm' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imageHeight = (canvas.height * pageWidth) / canvas.width
  let remainingHeight = imageHeight
  let offsetY = 0

  pdf.addImage(image, 'PNG', 0, offsetY, pageWidth, imageHeight)
  remainingHeight -= pageHeight

  while (remainingHeight > 0) {
    offsetY = remainingHeight - imageHeight
    pdf.addPage()
    pdf.addImage(image, 'PNG', 0, offsetY, pageWidth, imageHeight)
    remainingHeight -= pageHeight
  }

  pdf.save(`${getExportFileBase()}.pdf`)
}
