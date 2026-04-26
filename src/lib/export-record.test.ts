/**
 * [INPUT]: 依赖 vitest 的模块 mock，依赖 ./export-record 的 PDF/PNG 导出工具。
 * [OUTPUT]: 对外提供共享病历导出工具的分支行为回归测试。
 * [POS]: lib 的导出边界测试文件，确保 PDF/PNG 导出迁移后仍复用 html2canvas、jsPDF 与下载链路。
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
      backgroundColor: 'var(--ff-surface-paper)',
      scale: 2,
      useCORS: true,
    })
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png')
    expect(click).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:record')
  })

  it('exports PDF through jsPDF with the existing A4 portrait branch', async () => {
    await exportElementAsPdf(element)

    expect(jsPDF).toHaveBeenCalledWith({ format: 'a4', orientation: 'portrait', unit: 'mm' })
    expect(addImage).toHaveBeenCalledWith('data:image/png;base64,record', 'PNG', 0, 0, 210, 420)
    expect(addPage).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith(expect.stringMatching(/^firefly-\d{4}-\d{2}-\d{2}\.pdf$/))
  })
})
