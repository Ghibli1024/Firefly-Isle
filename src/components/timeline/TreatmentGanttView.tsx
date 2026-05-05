/**
 * [INPUT]: 依赖 react 的 CSSProperties、@/lib/locale 的 Locale、@/types/patient 的 PatientRecord、./treatment-gantt 的治疗线归一化能力与 transitions-dev.css 的 stagger/gantt grow 动效合同。
 * [OUTPUT]: 对外提供 TreatmentGanttView 组件，渲染带治疗条生长动效的只读甘特图。
 * [POS]: components/timeline 的甘特图展示层，只把 PatientRecord.treatmentLines 投影为只读治疗持续时间视图，不拥有记录编辑或导出行为。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { CSSProperties } from 'react'

import type { Locale } from '@/lib/locale'
import type { PatientRecord } from '@/types/patient'

import { buildTreatmentGanttRows, type TreatmentGanttRow } from './treatment-gantt'

type TreatmentGanttViewProps = {
  locale: Locale
  record: PatientRecord
}

const copy = {
  en: {
    current: 'Current line',
    emptyBody: 'Treatment lines will appear here after the record contains structured advanced-treatment data.',
    emptyTitle: 'No treatment lines yet',
    noBar: 'No duration bar generated',
    pending: 'Date pending',
    subtitle: 'Line number, regimen, duration and current-treatment status',
    title: 'Treatment Line Gantt',
    treatmentLine: 'Treatment line',
  },
  zh: {
    current: '当前治疗线',
    emptyBody: '当病历包含结构化晚期治疗数据后，治疗线会在这里按时间展开。',
    emptyTitle: '暂无治疗线',
    noBar: '未生成时间条',
    pending: '日期待补充',
    subtitle: '治疗线、方案、持续时间与当前治疗状态',
    title: '治疗线甘特图',
    treatmentLine: '治疗线',
  },
} satisfies Record<Locale, Record<string, string>>

function formatRange(row: TreatmentGanttRow, locale: Locale) {
  if (row.status === 'pending') {
    return copy[locale].pending
  }

  return `${row.startDate} - ${row.endDate}`
}

function getRegimen(row: TreatmentGanttRow, locale: Locale) {
  return row.regimen ?? (locale === 'zh' ? '方案待补充' : 'Regimen pending')
}

export function TreatmentGanttView({ locale, record }: TreatmentGanttViewProps) {
  const text = copy[locale]
  const rows = buildTreatmentGanttRows(record.treatmentLines)

  return (
    <section className="w-full rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-5 md:p-8 2xl:p-10">
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-[var(--ff-font-mono)] text-sm uppercase tracking-normal text-[var(--ff-accent-primary)]">TREATMENT_GANTT</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-normal md:text-5xl">{text.title}</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--ff-text-secondary)]">{text.subtitle}</p>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] p-6">
          <h2 className="text-2xl font-semibold tracking-normal">{text.emptyTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ff-text-secondary)]">{text.emptyBody}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row, index) => (
            <article
              className="t-stagger grid gap-4 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] p-5 lg:grid-cols-[220px_minmax(0,1fr)]"
              data-gantt-row-state={row.status}
              key={row.lineNumber}
              style={{ '--t-order': index } as CSSProperties}
            >
              <div>
                <div className="text-sm font-semibold text-[var(--ff-text-primary)]">
                  {text.treatmentLine} {row.lineNumber}
                </div>
                <div className="mt-2 text-base font-semibold tracking-normal text-[var(--ff-text-primary)]">{getRegimen(row, locale)}</div>
                <div className="mt-2 text-sm text-[var(--ff-text-secondary)]">{formatRange(row, locale)}</div>
                {row.isCurrent ? (
                  <div className="mt-3 inline-flex rounded-[var(--ff-radius-full)] border border-[var(--ff-accent-primary)] px-3 py-1 text-xs font-semibold text-[var(--ff-accent-primary)]">
                    {text.current}
                  </div>
                ) : null}
              </div>

              <div className="flex min-h-[88px] items-center">
                {row.bar ? (
                  <div className="relative h-12 w-full rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)]">
                    <div
                      className="t-gantt-grow absolute top-2 h-8 rounded-[var(--ff-radius-md)] bg-[var(--ff-accent-primary)]"
                      data-current={row.isCurrent ? 'true' : 'false'}
                      data-testid="treatment-gantt-bar"
                      style={{
                        '--t-gantt-width': `${row.bar.widthPercent}%`,
                        left: `${row.bar.leftPercent}%`,
                        width: 'var(--t-gantt-width)',
                      } as CSSProperties}
                    />
                  </div>
                ) : (
                  <div className="w-full rounded-[var(--ff-radius-md)] border border-dashed border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] px-4 py-3 text-sm font-semibold text-[var(--ff-text-secondary)]">
                    {text.noBar}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
