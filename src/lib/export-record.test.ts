/**
 * [INPUT]: 依赖 vitest 的模块 mock，依赖 ./export-record 的 PDF/PNG 导出工具。
 * [OUTPUT]: 对外提供共享病历导出工具的分支行为回归测试，包含导出克隆 DOM 的安全色、背景图与滤镜降级。
 * [POS]: lib 的导出边界测试文件，确保 PDF/PNG 导出迁移后仍复用 html2canvas、jsPDF、下载链路与 html2canvas 兼容的现代 CSS 清洗。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { exportElementAsPdf, exportElementAsPng } from './export-record'

const addImage = vi.fn()
const addPage = vi.fn()
const save = vi.fn()
const toBlob = vi.fn((resolve: (blob: Blob | null) => void) => resolve(new Blob(['png'], { type: 'image/png' })))
const toDataURL = vi.fn(() => 'data:image/png;base64,record')

vi.mock('html2canvas', () => ({
  default: vi.fn(async () => ({
    height: 400,
    toBlob,
    toDataURL,
    width: 200,
  })),
}))

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(function jsPDFMock() {
    return {
      addImage,
      addPage,
      internal: {
        pageSize: {
          getHeight: () => 297,
          getWidth: () => 210,
        },
      },
      save,
    }
  }),
}))

describe('export-record helpers', () => {
  const element = {} as HTMLElement
  const click = vi.fn()
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('document', {
      createElement: () => ({
        click,
        download: '',
        href: '',
      }),
    })
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:record'),
      revokeObjectURL,
    })
  })

  it('exports PNG through the shared html2canvas download branch', async () => {
    await exportElementAsPng(element)

    expect(html2canvas).toHaveBeenCalledWith(element, {
      backgroundColor: '#ffffff',
      onclone: expect.any(Function),
      scale: 2,
      useCORS: true,
    })
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png')
    expect(click).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:record')
  })

  it('normalizes unsupported export clone colors before html2canvas parses them', async () => {
    await exportElementAsPng(element)

    const options = vi.mocked(html2canvas).mock.calls[0][1]
    const cloneChild = { style: {} as Record<string, string> }
    const cloneRoot = {
      querySelectorAll: () => [cloneChild],
      setAttribute: vi.fn(),
      style: {} as Record<string, string>,
    }
    const getComputedStyle = vi.fn(() => ({
      backgroundColor: 'color-mix(in srgb, red 50%, transparent)',
      borderBottomColor: 'color(srgb 0.25 0.5 0.75 / 0.5)',
      borderLeftColor: 'rgb(48, 54, 58)',
      borderRightColor: 'transparent',
      borderTopColor: 'color(srgb 1 0.25 0)',
      boxShadow: '0 0 18px color-mix(in srgb, red 20%, transparent)',
      backgroundImage: 'linear-gradient(color-mix(in srgb, red 50%, transparent), white)',
      color: 'color(srgb 1 0.5 0 / 0.75)',
      filter: 'drop-shadow(0 0 8px color-mix(in srgb, red 40%, transparent))',
      outlineColor: 'oklch(70% 0.1 40)',
      textDecorationColor: 'rgba(1, 2, 3, 0.5)',
      textShadow: '0 0 4px color-mix(in srgb, red 20%, transparent)',
    }))

    options?.onclone?.({ defaultView: { getComputedStyle } } as unknown as Document, cloneRoot as unknown as HTMLElement)

    expect(cloneRoot.setAttribute).toHaveBeenCalledWith('data-firefly-export-snapshot', 'true')
    expect(cloneChild.style.color).toBe('rgba(255, 128, 0, 0.75)')
    expect(cloneChild.style.backgroundColor).toBe('transparent')
    expect(cloneChild.style.borderTopColor).toBe('rgb(255, 64, 0)')
    expect(cloneChild.style.borderBottomColor).toBe('rgba(64, 128, 191, 0.5)')
    expect(cloneChild.style.outlineColor).toBe('transparent')
    expect(cloneChild.style.backgroundImage).toBe('none')
    expect(cloneChild.style.boxShadow).toBe('none')
    expect(cloneChild.style.filter).toBe('none')
    expect(cloneChild.style.textShadow).toBe('none')
  })

  it('exports PDF through jsPDF with the existing A4 portrait branch', async () => {
    await exportElementAsPdf(element)

    expect(html2canvas).toHaveBeenCalledWith(element, {
      backgroundColor: '#ffffff',
      onclone: expect.any(Function),
      scale: 2,
      useCORS: true,
    })
    expect(jsPDF).toHaveBeenCalledWith({ format: 'a4', orientation: 'portrait', unit: 'mm' })
    expect(addImage).toHaveBeenCalledWith('data:image/png;base64,record', 'PNG', 0, 0, 210, 420)
    expect(addPage).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith(expect.stringMatching(/^firefly-\d{4}-\d{2}-\d{2}\.pdf$/))
  })
})
