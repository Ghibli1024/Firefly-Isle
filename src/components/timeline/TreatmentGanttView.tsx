/**
 * [INPUT]: 依赖 react 的 CSSProperties/ref/pointer 键盘事件、@/lib/locale 的 Locale、@/types/patient 的 PatientRecord、./treatment-gantt 的治疗方案甘特投影与 transitions-dev.css 的 stagger/gantt grow 动效合同。
 * [OUTPUT]: 对外提供 TreatmentGanttView 组件，窄屏渲染纵向治疗卡片，桌面渲染左右固定、中间时间轴可独立拖动且使用 BL/Ln 标记的只读治疗方案甘特图。
 * [POS]: components/timeline 的甘特图展示层，只把 PatientRecord 与展示层补充文案投影为响应式只读治疗方案视图，不拥有记录编辑、保存或导出行为。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { type CSSProperties, type KeyboardEvent, type PointerEvent, useRef, useState } from 'react'

import type { Locale } from '@/lib/locale'
import type { PatientRecord } from '@/types/patient'

import { buildTreatmentGanttProjection, type TreatmentGanttRow } from './treatment-gantt'

type TreatmentGanttViewProps = {
  locale: Locale
  record: PatientRecord
  supplementNotes?: Record<string, string>
}

const copy = {
  en: {
    axisLabel: 'Draggable treatment timeline. Use left and right arrow keys to move.',
    emptyBody: 'Treatment lines will appear here after the record contains structured treatment data.',
    emptyTitle: 'No treatment lines yet',
    leftTitle: 'Time / Treatment plan',
    noBar: 'No duration bar generated',
    rightTitle: 'Supplemental info',
    supplementFallback: 'No additional IHC, genetic-test, biopsy, efficacy or progression note is recorded.',
    title: 'Treatment Plan',
  },
  zh: {
    axisLabel: '可拖动或用左右方向键移动的治疗时间轴',
    emptyBody: '当病历包含结构化治疗数据后，治疗方案会在这里按时间展开。',
    emptyTitle: '暂无治疗线',
    leftTitle: '时间 / 治疗方案',
    noBar: '未生成时间条',
    rightTitle: '补充信息',
    supplementFallback: '原始记录未列额外免疫组化、基因检测或疗效补充。',
    title: '治疗方案',
  },
} satisfies Record<Locale, Record<string, string>>

function getSupplementText(row: TreatmentGanttRow, locale: Locale, supplementNotes?: Record<string, string>) {
  const override = supplementNotes?.[row.id]

  if (override) {
    return override
  }

  if (row.supplementParts.length > 0) {
    return row.supplementParts.map((part) => `${part.label}：${part.value}`).join('；')
  }

  return copy[locale].supplementFallback
}

function TimelineDragHint() {
  return (
    <span
      aria-label="时间轴可横向拖动"
      className="sticky left-[calc(100%-8rem)] top-3 z-10 inline-flex h-8 w-32 items-center justify-center rounded-[var(--ff-radius-full)] border border-[color-mix(in_srgb,var(--ff-accent-primary)_48%,transparent)] bg-[var(--ff-surface-accent)] shadow-[0_0_22px_color-mix(in_srgb,var(--ff-accent-primary)_16%,transparent)]"
      data-scroll-hint="true"
    >
      <span aria-hidden className="h-2 w-2 rotate-45 border-b-2 border-l-2 border-[var(--ff-accent-primary)]" />
      <span aria-hidden className="relative mx-2 h-px w-16 rounded-full bg-gradient-to-r from-transparent via-[var(--ff-accent-primary)] to-transparent">
        <span className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 rounded-[var(--ff-radius-full)] border border-white/40 bg-[var(--ff-accent-primary)] shadow-[0_0_14px_color-mix(in_srgb,var(--ff-accent-primary)_70%,transparent)]" />
      </span>
      <span aria-hidden className="h-2 w-2 -rotate-45 border-b-2 border-r-2 border-[var(--ff-accent-primary)]" />
    </span>
  )
}

function CompactTreatmentRows({
  locale,
  rows,
  supplementNotes,
}: {
  locale: Locale
  rows: TreatmentGanttRow[]
  supplementNotes?: Record<string, string>
}) {
  const text = copy[locale]

  return (
    <div className="grid gap-3 lg:hidden" data-testid="treatment-gantt-compact-list">
      {rows.map((row, index) => (
        <article
          className={[
            't-stagger grid min-w-0 grid-cols-[46px_minmax(0,1fr)] gap-3 rounded-[var(--ff-radius-md)] border bg-[var(--ff-surface-panel)] p-3',
            row.isCurrent ? 'border-[var(--ff-accent-primary)] shadow-[inset_3px_0_0_var(--ff-accent-primary)]' : 'border-[var(--ff-border-muted)]',
          ].join(' ')}
          data-gantt-row-state={row.status}
          key={row.id}
          style={{ '--t-order': index } as CSSProperties}
        >
          <div className="grid h-11 w-11 place-items-center rounded-[var(--ff-radius-full)] border border-[var(--ff-accent-primary)] bg-[var(--ff-surface-accent)] font-[var(--ff-font-mono)] text-sm font-black text-[var(--ff-accent-primary)]">
            {row.marker}
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <strong className="font-[var(--ff-font-mono)] text-xs text-[var(--ff-text-primary)] [overflow-wrap:anywhere]">{row.rangeLabel}</strong>
              <span className="rounded-[var(--ff-radius-full)] border border-[var(--ff-border-muted)] px-2 py-0.5 text-[11px] font-bold text-[var(--ff-text-muted)]">
                {row.pfsLabel}
              </span>
            </div>
            <p className="m-0 whitespace-normal text-sm leading-6 text-[var(--ff-text-secondary)] [overflow-wrap:anywhere]">
              {row.plan}
            </p>
            <p className="mt-3 border-t border-[var(--ff-border-muted)] pt-3 text-xs leading-6 text-[var(--ff-text-secondary)] [overflow-wrap:anywhere]">
              <span className="mb-1 block font-extrabold text-[var(--ff-text-primary)]">{text.rightTitle}</span>
              {getSupplementText(row, locale, supplementNotes)}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}

export function TreatmentGanttView({ locale, record, supplementNotes }: TreatmentGanttViewProps) {
  const text = copy[locale]
  const projection = buildTreatmentGanttProjection(record, locale)
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ pointerId: -1, startScroll: 0, startX: 0 })
  const [isDragging, setIsDragging] = useState(false)

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const target = scrollRef.current

    if (!target) {
      return
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startScroll: target.scrollLeft,
      startX: event.clientX,
    }
    setIsDragging(true)
    target.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const target = scrollRef.current

    if (!target || !isDragging || dragRef.current.pointerId !== event.pointerId) {
      return
    }

    event.preventDefault()
    target.scrollLeft = dragRef.current.startScroll - (event.clientX - dragRef.current.startX)
  }

  function stopDragging(event: PointerEvent<HTMLDivElement>) {
    const target = scrollRef.current

    if (!target || dragRef.current.pointerId !== event.pointerId) {
      return
    }

    setIsDragging(false)

    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = scrollRef.current
    const moves: Record<string, number> = {
      ArrowLeft: -220,
      ArrowRight: 220,
      End: target?.scrollWidth ?? 0,
      Home: -(target?.scrollWidth ?? 0),
    }

    if (!target || !(event.key in moves)) {
      return
    }

    event.preventDefault()
    target.scrollBy({ behavior: 'smooth', left: moves[event.key] })
  }

  return (
    <section className="w-full max-w-full overflow-hidden rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-4 md:p-6 2xl:p-8">
      <header className="mb-6">
        <h1 className="font-[var(--ff-font-display)] text-4xl font-bold leading-tight tracking-normal md:text-5xl">{text.title}</h1>
      </header>

      {projection.rows.length === 0 ? (
        <div className="rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] p-6">
          <h2 className="text-2xl font-semibold tracking-normal">{text.emptyTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ff-text-secondary)]">{text.emptyBody}</p>
        </div>
      ) : (
        <div className="max-w-full overflow-hidden rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] p-3 md:p-4">
          <CompactTreatmentRows locale={locale} rows={projection.rows} supplementNotes={supplementNotes} />
          <div className="hidden lg:grid min-w-0 gap-3 lg:grid-cols-[minmax(230px,0.78fr)_minmax(220px,1fr)_minmax(250px,0.9fr)] 2xl:grid-cols-[minmax(270px,360px)_minmax(280px,1fr)_minmax(300px,430px)]" data-testid="treatment-gantt-desktop-grid">
            <div className="min-w-0 w-full">
              <div className="flex h-auto items-center pb-3 text-sm font-extrabold text-[var(--ff-text-primary)] lg:h-[78px] lg:pb-0">{text.leftTitle}</div>
              <div className="grid gap-2.5">
                {projection.rows.map((row, index) => (
                  <article
                    className={[
                      't-stagger grid min-h-[118px] w-full min-w-0 grid-cols-[46px_minmax(0,1fr)] items-center gap-3 rounded-[var(--ff-radius-md)] border bg-[var(--ff-surface-panel)] p-3',
                      row.isCurrent ? 'border-[var(--ff-accent-primary)] shadow-[inset_3px_0_0_var(--ff-accent-primary)]' : 'border-[var(--ff-border-muted)]',
                    ].join(' ')}
                    key={row.id}
                    style={{ '--t-order': index, maxWidth: 'calc(100vw - 4rem)' } as CSSProperties}
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-[var(--ff-radius-full)] border border-[var(--ff-accent-primary)] bg-[var(--ff-surface-accent)] font-[var(--ff-font-mono)] text-sm font-black text-[var(--ff-accent-primary)]">
                      {row.marker}
                    </div>
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        <strong className="font-[var(--ff-font-mono)] text-xs text-[var(--ff-text-primary)] [overflow-wrap:anywhere]">{row.rangeLabel}</strong>
                        <span className="rounded-[var(--ff-radius-full)] border border-[var(--ff-border-muted)] px-2 py-0.5 text-[11px] font-bold text-[var(--ff-text-muted)]">
                          {row.pfsLabel}
                        </span>
                      </div>
                      <p className="m-0 whitespace-normal text-sm leading-6 text-[var(--ff-text-secondary)]" style={{ overflowWrap: 'anywhere', wordBreak: 'break-all' }}>
                        {row.plan}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div
              aria-label={text.axisLabel}
              className={[
                'relative w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden pb-3 outline-none [scrollbar-color:var(--ff-accent-primary)_color-mix(in_srgb,var(--ff-text-primary)_8%,transparent)] [scrollbar-width:thin] focus-visible:ring-1 focus-visible:ring-[var(--ff-accent-primary)]',
                isDragging ? 'cursor-grabbing select-none' : 'cursor-grab',
              ].join(' ')}
              data-testid="treatment-gantt-scroll"
              onKeyDown={handleKeyDown}
              onPointerCancel={stopDragging}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDragging}
              ref={scrollRef}
              tabIndex={0}
            >
              <div className="relative" style={{ width: projection.canvasWidth }}>
                <div className="relative h-[78px] border-b border-[var(--ff-line)] font-[var(--ff-font-mono)] text-xs text-[var(--ff-text-muted)]">
                  {projection.axisTicks.map((tick) => (
                    <span className="absolute bottom-[-18px] whitespace-nowrap" key={tick.label} style={{ left: `${tick.leftPercent}%` }}>
                      <b className="absolute bottom-[18px] h-3 w-px bg-[var(--ff-line)]" />
                      {tick.label}
                    </span>
                  ))}
                  <TimelineDragHint />
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[78px] overflow-hidden">
                  {projection.events.map((event) => (
                    <i className="absolute bottom-0 top-0 w-px bg-[color-mix(in_srgb,var(--ff-accent-primary)_26%,transparent)]" key={`${event.label}-${event.leftPercent}`} style={{ left: `${event.leftPercent}%` }}>
                      <b className="absolute left-[-11px] top-0 grid h-[22px] w-[22px] place-items-center rounded-[var(--ff-radius-full)] bg-[var(--ff-accent-primary)] font-[var(--ff-font-mono)] text-[10px] text-white">
                        {event.label}
                      </b>
                    </i>
                  ))}
                </div>

                <div className="grid gap-2.5">
                  {projection.rows.map((row) => (
                    <article className="flex min-h-[118px] items-center" data-gantt-row-state={row.status} key={row.id}>
                      <div className="relative h-11 w-full overflow-hidden rounded-[var(--ff-radius-md)] border border-[var(--ff-border-muted)] bg-[linear-gradient(90deg,color-mix(in_srgb,var(--ff-line)_16%,transparent)_1px,transparent_1px),color-mix(in_srgb,var(--ff-text-primary)_3%,transparent)] bg-[length:8.333%_100%]">
                        {row.gap ? (
                          <i
                            className="absolute top-[22px] z-[1] h-0 border-t-2 border-dashed border-[var(--ff-accent-primary)]"
                            style={{ left: `${row.gap.leftPercent}%`, width: `${row.gap.widthPercent}%` }}
                          />
                        ) : null}
                        {row.bar ? (
                          <i
                            className={[
                              't-gantt-grow absolute top-[9px] z-[3] grid h-6 min-w-4 place-items-center rounded-[var(--ff-radius-md)] border font-[var(--ff-font-mono)] text-[11px] font-black text-white',
                              row.isBaseline ? 'border-[var(--ff-border-muted)] bg-[color-mix(in_srgb,var(--ff-text-primary)_32%,transparent)]' : 'border-[var(--ff-accent-strong)] bg-[var(--ff-accent-primary)]',
                            ].join(' ')}
                            data-current={row.isCurrent ? 'true' : 'false'}
                            data-testid="treatment-gantt-bar"
                            style={{
                              '--t-gantt-width': `${row.bar.widthPercent}%`,
                              left: `${row.bar.leftPercent}%`,
                              width: 'var(--t-gantt-width)',
                            } as CSSProperties}
                          >
                            {row.marker}
                          </i>
                        ) : (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--ff-text-secondary)]">{text.noBar}</span>
                        )}
                        {row.continueFromPercent !== null ? (
                          <i
                            className="absolute right-2 top-[22px] z-[1] h-0 border-t-2 border-dashed border-[var(--ff-accent-primary)]"
                            style={{ left: `${row.continueFromPercent}%` }}
                          />
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="min-w-0 w-full">
              <div className="flex h-auto items-center pb-3 text-sm font-extrabold text-[var(--ff-text-primary)] lg:h-[78px] lg:pb-0">{text.rightTitle}</div>
              <div className="grid gap-2.5">
                {projection.rows.map((row, index) => (
                  <article
                    className={[
                      't-stagger flex min-h-[118px] items-center rounded-[var(--ff-radius-md)] border bg-[var(--ff-surface-panel)] p-3',
                      row.isCurrent ? 'border-[var(--ff-accent-primary)] shadow-[inset_3px_0_0_var(--ff-accent-primary)]' : 'border-[var(--ff-border-muted)]',
                    ].join(' ')}
                    key={row.id}
                    style={{ '--t-order': index, maxWidth: 'calc(100vw - 4rem)' } as CSSProperties}
                  >
                    <p className="m-0 whitespace-normal text-sm leading-6 text-[var(--ff-text-secondary)]" style={{ overflowWrap: 'anywhere', wordBreak: 'break-all' }}>
                      {getSupplementText(row, locale, supplementNotes)}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
