/**
 * [INPUT]: 依赖 react 的 CSSProperties/RefObject、react-router-dom 的 Link、PatientRecord、LabTrendsTable、record-copy、record-derived、record 展示类型与 transitions-dev.css 的 stagger/control/timeline rail 动效合同。
 * [OUTPUT]: 对外提供 RecordDossier 与 RecordUnavailableDossier 两个病例详情展示组件，渲染带顺序进入、桌面独立不换行时间段/PFS rail、移动卡内 PFS 和时间线 rail draw-in 的档案视图。
 * [POS]: components/record 的主展示层，承载宽幅病历档案、概要指标、按需实验室趋势、左侧时间段 rail、移动卡内 PFS、时间线、证据卡、临床备注、导出按钮与不可用态，不再在标题旁渲染线别小字或重复已表达信息。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { CSSProperties, RefObject } from 'react'
import { Link } from 'react-router-dom'

import type { Locale } from '@/lib/locale'
import type { PatientRecord } from '@/types/patient'

import { getRecordSummaryMetrics, getRecordTimelineEntries } from './record-derived'
import { LabTrendsTable } from './LabTrendsTable'
import { getTimelineEntries, labels, summaryMetrics } from './record-copy'
import type { EvidenceCard, ExportFormat, Metric, TimelineEntry } from './types'

function SummaryGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div
      className="t-stagger grid overflow-hidden rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] sm:grid-cols-2 lg:grid-cols-3"
      style={{ '--t-order': 1 } as CSSProperties}
    >
      {metrics.map((metric) => (
        <div
          className="-mb-px -mr-px min-h-[100px] border-b border-r border-[var(--ff-border-default)] p-6"
          key={metric.label}
        >
          <div className="text-sm text-[var(--ff-text-muted)]">{metric.label}</div>
          <div className="mt-3 text-2xl font-semibold tracking-normal">{metric.value}</div>
        </div>
      ))}
    </div>
  )
}

function EvidenceCardView({ card, order }: { card: EvidenceCard; order: number }) {
  return (
    <article
      className="t-stagger rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] p-5"
      style={{ '--t-order': order } as CSSProperties}
    >
      <h4 className="mb-4 font-bold text-[var(--ff-accent-primary)]">{card.title}</h4>
      <div className="space-y-3">
        {card.items.map((item) => (
          <div className="flex justify-between gap-6 border-b border-[var(--ff-border-muted)] pb-2 text-sm" key={`${item.label}:${item.value}`}>
            {item.label ? <span className="text-[var(--ff-text-secondary)]">{item.label}</span> : null}
            <span className={`${item.label ? 'text-right' : ''} font-medium text-[var(--ff-text-primary)]`}>{item.value}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function TimelineNode({ entry, order }: { entry: TimelineEntry; order: number }) {
  const hasCards = entry.cards.length > 0
  const timeframeClass = [
    'mt-3 max-w-full whitespace-nowrap font-[var(--ff-font-mono)] text-sm text-[var(--ff-text-secondary)]',
    entry.railDate ? 'md:hidden' : '',
  ].join(' ')

  return (
    <article
      className={[
        't-stagger relative grid gap-6 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-5 sm:p-6 2xl:p-8',
        hasCards
          ? 'lg:grid-cols-[minmax(0,1fr)_minmax(260px,32%)] xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]'
          : '',
      ].join(' ')}
      style={{ '--t-order': order } as CSSProperties}
    >
      <div>
        <div className="mb-5 flex flex-wrap items-end gap-4">
          <span className="font-[var(--ff-font-mono)] text-5xl font-bold text-[var(--ff-accent-primary)]">{entry.index}</span>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-3xl font-bold tracking-normal">{entry.title}</h3>
              {entry.badge ? (
                <span className="rounded-[var(--ff-radius-full)] border border-[color:color-mix(in_srgb,var(--ff-accent-success)_42%,var(--ff-border-default))] bg-[color:color-mix(in_srgb,var(--ff-accent-success)_10%,var(--ff-surface-panel))] px-3 py-1 text-sm text-[var(--ff-accent-success)]">
                  {entry.badge}
                </span>
              ) : null}
            </div>
            <div className={timeframeClass}>{entry.timeframe}</div>
            {entry.railMeta ? (
              <div className="mt-2 md:hidden" data-timeline-mobile-pfs={entry.railMeta}>
                <span className="inline-flex max-w-full items-center whitespace-nowrap rounded-[var(--ff-radius-full)] border border-[color-mix(in_srgb,var(--ff-accent-primary)_38%,var(--ff-border-default))] bg-[var(--ff-surface-accent)] px-2 py-0.5 font-[var(--ff-font-mono)] text-[11px] font-bold leading-5 text-[var(--ff-accent-primary)]">
                  {entry.railMeta}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <h4 className="mb-4 text-2xl font-semibold">{entry.treatment}</h4>
        {entry.body.length > 0 ? (
          <div className="space-y-2 text-base leading-8 text-[var(--ff-text-secondary)]">
            {entry.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        {entry.meta.length > 0 ? (
          <div className="mt-10 grid border-t border-[var(--ff-border-default)] pt-5 sm:grid-cols-2 xl:grid-cols-4">
            {entry.meta.map((item, index) => (
              <div
                className={[
                  'border-[var(--ff-border-default)] pr-4',
                  index < entry.meta.length - 1 ? 'border-b pb-4' : '',
                  index < entry.meta.length - 2 ? 'sm:border-b sm:pb-4' : 'sm:border-b-0 sm:pb-0',
                  'xl:border-b-0 xl:pb-0',
                  index % 2 === 0 ? 'sm:border-r' : 'sm:border-r-0',
                  index % 4 !== 3 ? 'xl:border-r' : 'xl:border-r-0',
                ].join(' ')}
                key={item.label}
              >
                <div className="text-xs text-[var(--ff-text-muted)]">{item.label}</div>
                <div className="mt-2 text-sm font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        ) : null}

        {entry.highlight ? (
          <div className="mt-6 rounded-[var(--ff-radius-md)] border border-[var(--ff-accent-primary)] bg-[var(--ff-surface-warning)] p-5">
            <h5 className="font-bold text-[var(--ff-accent-primary)]">{entry.highlight.title}</h5>
            <p className="mt-2 text-sm leading-7 text-[var(--ff-text-secondary)]">{entry.highlight.body}</p>
          </div>
        ) : null}

        {entry.footMetrics ? (
          <div className="mt-6 grid rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] sm:grid-cols-2">
            {entry.footMetrics.map((metric, index) => (
              <div className={index === 0 ? 'border-b border-[var(--ff-border-default)] p-5 sm:border-b-0 sm:border-r' : 'p-5'} key={metric.label}>
                <div className="text-sm text-[var(--ff-text-muted)]">{metric.label}</div>
                <div className={`mt-2 text-2xl font-semibold ${index === 1 ? 'text-[var(--ff-accent-primary)]' : ''}`}>{metric.value}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {hasCards ? (
        <div className="space-y-4 border-[var(--ff-border-default)] md:border-l md:pl-6">
          {entry.cards.map((card, cardIndex) => (
            <EvidenceCardView card={card} key={card.title} order={order + cardIndex + 1} />
          ))}
        </div>
      ) : null}
    </article>
  )
}

function TimelineRailMarker({ entry }: { entry: TimelineEntry }) {
  const railDate = entry.railDate ?? entry.timeframe

  return (
    <>
      <div className="relative hidden md:block" aria-hidden="true">
        <span className="absolute left-[20px] top-8 h-4 w-4 rounded-[var(--ff-radius-full)] border-4 border-[var(--ff-surface-panel)] bg-[var(--ff-line)]" />
      </div>
      <div
        className="hidden min-w-0 pr-2 pt-7 md:block"
        data-timeline-rail-date={railDate}
      >
        <time className="block whitespace-nowrap font-[var(--ff-font-mono)] text-[13px] font-black leading-tight tracking-normal text-[var(--ff-text-muted)] xl:text-sm 2xl:text-base">
          {railDate}
        </time>
        {entry.railMeta ? (
          <span className="mt-2 inline-flex max-w-full items-center whitespace-nowrap rounded-[var(--ff-radius-full)] border border-[color-mix(in_srgb,var(--ff-accent-primary)_38%,var(--ff-border-default))] bg-[var(--ff-surface-accent)] px-2 py-0.5 font-[var(--ff-font-mono)] text-[11px] font-bold leading-5 text-[var(--ff-accent-primary)]">
            {entry.railMeta}
          </span>
        ) : null}
      </div>
    </>
  )
}

export function RecordDossier({
  exportError,
  exportFormat,
  isExportDisabled,
  isExporting,
  locale,
  onExport,
  record,
  recordRef,
}: {
  exportError: string | null
  exportFormat: ExportFormat | null
  isExportDisabled: boolean
  isExporting: boolean
  locale: Locale
  onExport: (format: ExportFormat) => void
  record?: PatientRecord
  recordRef: RefObject<HTMLDivElement>
}) {
  const text = labels[locale]
  const entries = record ? getRecordTimelineEntries(record, locale) : getTimelineEntries(locale)
  const metrics = record ? getRecordSummaryMetrics(record, locale) : summaryMetrics[locale]
  const labTrendRecord = (record?.labResults?.length ?? 0) > 0 ? record : undefined
  const clinicalNotes =
    record?.clinicalNotes ??
    (locale === 'zh'
      ? '此档案由临床 AI 自动整理并结构化，所有数据点均经过病理报告与影像诊断交叉验证。'
      : 'This dossier is automatically structured by clinical AI and cross-checked against pathology and imaging reports.')

  return (
    <div
      className="w-full rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] md:p-8 2xl:p-10"
      ref={recordRef}
    >
      <header className="mb-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-5xl font-bold leading-tight tracking-normal md:text-5xl xl:text-6xl">{text.pageTitle}</h1>
          </div>
          <div className="text-left md:text-right">
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--ff-text-secondary)] md:justify-end">
              <span className="material-symbols-outlined text-base">lock</span>
              {text.access}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 md:justify-end">
              <button
                className="t-control-press inline-flex h-12 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isExportDisabled || isExporting}
                onClick={() => onExport('pdf')}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">description</span>
                {isExporting && exportFormat === 'pdf' ? text.exportPdfLoading : text.exportPdf}
              </button>
              <button
                className="t-control-press inline-flex h-12 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isExportDisabled || isExporting}
                onClick={() => onExport('png')}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">image</span>
                {isExporting && exportFormat === 'png' ? text.exportPngLoading : text.exportPng}
              </button>
              <Link
                className="t-control-press inline-flex h-12 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 text-sm font-semibold"
                to="/app"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                {text.back}
              </Link>
            </div>
            {exportError ? (
              <div className="mt-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-accent-primary)] bg-[var(--ff-surface-warning)] px-4 py-3 text-sm font-semibold text-[var(--ff-accent-primary)]">
                {exportError}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <SummaryGrid metrics={metrics} />

      {labTrendRecord ? (
        <div className="t-stagger" style={{ '--t-order': 2 } as CSSProperties}>
          <LabTrendsTable locale={locale} record={labTrendRecord} />
        </div>
      ) : null}

      <section className="mt-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-8 w-[3px] bg-[var(--ff-accent-primary)]" />
          <h2 className="text-2xl font-bold">{text.timeline}</h2>
        </div>

        <div className="relative space-y-4">
          <div className="t-timeline-rail absolute bottom-0 left-7 top-0 hidden w-px bg-[var(--ff-border-default)] md:block" />
          {entries.map((entry, index) => (
            <div
              className="relative grid gap-3 md:grid-cols-[56px_12rem_minmax(0,1fr)] md:gap-5 xl:grid-cols-[56px_14rem_minmax(0,1fr)]"
              key={entry.index}
            >
              <TimelineRailMarker entry={entry} />
              <TimelineNode entry={entry} order={index + 3} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold">{text.clinicalNotes}</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--ff-text-secondary)]">{clinicalNotes}</p>
          </div>
          <div className="flex items-center gap-4 font-[var(--ff-font-mono)] text-sm text-[var(--ff-text-muted)]">
            2024-05-20 12:08:00
            <button className="t-control-press flex h-10 w-10 items-center justify-center rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)]" type="button">
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>
          </div>
        </div>
      </section>

      <section className="mt-5 grid rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] md:grid-cols-3">
        <div className="flex items-center gap-4 border-[var(--ff-border-default)] p-6 md:border-r">
          <span className="material-symbols-outlined text-[40px]">health_and_safety</span>
          <div>
            <h3 className="font-bold">{text.aiStatus}</h3>
            <p className="mt-1 text-sm text-[var(--ff-accent-success)]">{text.verified}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border-[var(--ff-border-default)] p-6 md:border-r">
          <span className="material-symbols-outlined text-[40px]">database</span>
          <div>
            <h3 className="font-bold">{text.completeness}</h3>
            <p className="mt-1 text-sm text-[var(--ff-accent-success)]">
              {locale === 'zh' ? '所有必填字段已完整捕获' : 'All required fields captured'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6">
          <span className="material-symbols-outlined text-[40px] text-[var(--ff-accent-primary)]">verified</span>
          <div>
            <h3 className="text-2xl font-bold">
              <span className="text-[var(--ff-accent-primary)]">AI</span> VERIFIED
            </h3>
            <p className="mt-1 text-sm text-[var(--ff-text-secondary)]">{text.archiveComplete}</p>
          </div>
        </div>
      </section>

      <footer className="mt-6 flex flex-col gap-2 border-t border-[var(--ff-border-default)] pt-5 font-[var(--ff-font-mono)] text-xs text-[var(--ff-text-muted)] md:flex-row md:justify-between">
        <span>{text.footer}</span>
        <span>LAST_UPDATE: 2024.05.20 12:08:00</span>
      </footer>
    </div>
  )
}

export function RecordUnavailableDossier({
  exportError,
  exportFormat,
  isExporting,
  locale,
  message,
  onExport,
}: {
  exportError: string | null
  exportFormat: ExportFormat | null
  isExporting: boolean
  locale: Locale
  message: string
  onExport: (format: ExportFormat) => void
}) {
  const text = labels[locale]

  return (
    <div className="w-full rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-5 md:p-8 2xl:p-10">
      <header className="mb-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-5xl font-bold leading-tight tracking-normal md:text-5xl xl:text-6xl">{text.pageTitle}</h1>
            <p className="mt-5 font-[var(--ff-font-mono)] text-xl tracking-[0.08em] text-[var(--ff-text-secondary)]">
              {locale === 'zh' ? '真实病历载入中' : 'Loading saved medical record'}
            </p>
          </div>
          <div className="text-left md:text-right">
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--ff-text-secondary)] md:justify-end">
              <span className="material-symbols-outlined text-base">lock</span>
              {text.access}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 md:justify-end">
              <button
                className="t-control-press inline-flex h-12 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                disabled
                onClick={() => onExport('pdf')}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">description</span>
                {isExporting && exportFormat === 'pdf' ? text.exportPdfLoading : text.exportPdf}
              </button>
              <button
                className="t-control-press inline-flex h-12 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                disabled
                onClick={() => onExport('png')}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">image</span>
                {isExporting && exportFormat === 'png' ? text.exportPngLoading : text.exportPng}
              </button>
              <Link
                className="t-control-press inline-flex h-12 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 text-sm font-semibold"
                to="/app"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                {text.back}
              </Link>
            </div>
            {exportError ? (
              <div className="mt-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-accent-primary)] bg-[var(--ff-surface-warning)] px-4 py-3 text-sm font-semibold text-[var(--ff-accent-primary)]">
                {exportError}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 py-8 text-base font-semibold text-[var(--ff-text-secondary)]">
        {message}
      </div>
    </div>
  )
}
