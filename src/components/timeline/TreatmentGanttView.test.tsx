/**
 * [INPUT]: 依赖 react-dom/server 的静态渲染、vitest 断言、PatientRecord 与 ./TreatmentGanttView。
 * [OUTPUT]: 对外提供治疗线甘特图组件渲染与动效合同回归测试。
 * [POS]: components/timeline 的展示测试，约束多线、缺失日期、当前治疗线、甘特条生长动效与空态在 DOM 中可读。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { PatientRecord } from '@/types/patient'

import { TreatmentGanttView } from './TreatmentGanttView'

function renderGantt(record: PatientRecord) {
  return renderToStaticMarkup(<TreatmentGanttView locale="zh" record={record} />)
}

describe('TreatmentGanttView', () => {
  it('renders multiple treatment lines with bars and the current-line marker', () => {
    const markup = renderGantt({
      treatmentLines: [
        { endDate: '2024-02', lineNumber: 2, regimen: '多西他赛', startDate: '2023-11' },
        { endDate: '2023-10', lineNumber: 1, regimen: '奥希替尼', startDate: '2023-05' },
        { lineNumber: 3, regimen: '临床试验', startDate: '2024-03' },
      ],
    })

    expect(markup.indexOf('治疗线 1')).toBeLessThan(markup.indexOf('治疗线 2'))
    expect(markup).toContain('奥希替尼')
    expect(markup).toContain('多西他赛')
    expect(markup).toContain('当前治疗线')
    expect(markup.match(/data-testid="treatment-gantt-bar"/g)?.length).toBe(2)
    expect(markup).toContain('t-gantt-grow')
    expect(markup).toContain('style="--t-gantt-width:')
  })

  it('shows pending rows for missing dates instead of drawing bars', () => {
    const markup = renderGantt({
      treatmentLines: [
        { endDate: '2023-10', lineNumber: 1, regimen: '缺少开始日期' },
        { lineNumber: 2, regimen: '缺少结束日期', startDate: '2023-11' },
      ],
    })

    expect(markup.match(/日期待补充/g)?.length).toBe(2)
    expect(markup).not.toContain('data-testid="treatment-gantt-bar"')
  })

  it('renders an empty state when no treatment lines exist', () => {
    const markup = renderGantt({ treatmentLines: [] })

    expect(markup).toContain('暂无治疗线')
    expect(markup).not.toContain('data-testid="treatment-gantt-bar"')
  })
})
