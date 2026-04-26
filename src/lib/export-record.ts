/**
 * [INPUT]: 依赖 html2canvas 捕获正式病历 DOM，依赖 jsPDF 生成 A4 portrait PDF，依赖浏览器 Blob / URL 下载能力。
 * [OUTPUT]: 对外提供 exportElementAsPdf 与 exportElementAsPng。
 * [POS]: lib 的跨页面导出边界，把 PDF/PNG 行为从 /app preview 迁出，供 /record/:id 正式档案面独占消费。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

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

async function renderRecordCanvas(element: HTMLElement) {
  return html2canvas(element, {
    backgroundColor: 'var(--ff-surface-paper)',
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
