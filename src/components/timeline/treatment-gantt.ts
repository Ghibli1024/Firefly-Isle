/**
 * [INPUT]: 依赖 @/lib/locale 的 Locale 与 @/types/patient 的 PatientRecord/TreatmentLine 领域结构。
 * [OUTPUT]: 对外提供 TreatmentGanttProjection、TreatmentGanttRow 与 buildTreatmentGanttProjection。
 * [POS]: components/timeline 的甘特图纯数据投影层，把初发与治疗线日期归一为可测试的 PFS、bar、gap、axis 与开放当前线状态。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { Locale } from '@/lib/locale'
import type { PatientRecord, TreatmentLine } from '@/types/patient'

export type TreatmentGanttBar = {
  leftPercent: number
  widthPercent: number
}

export type TreatmentGanttGap = {
  leftPercent: number
  widthPercent: number
}

export type TreatmentGanttAxisTick = {
  label: string
  leftPercent: number
}

export type TreatmentGanttEvent = {
  label: string
  leftPercent: number
}

export type TreatmentGanttSupplementPart = {
  label: string
  value: string
}

export type TreatmentGanttRow = {
  bar: TreatmentGanttBar | null
  continueFromPercent: number | null
  gap: TreatmentGanttGap | null
  id: string
  isBaseline: boolean
  isCurrent: boolean
  lineNumber: number | null
  marker: string
  pfsLabel: string
  plan: string
  rangeLabel: string
  status: 'complete' | 'ongoing' | 'pending'
  supplementParts: TreatmentGanttSupplementPart[]
}

export type TreatmentGanttProjection = {
  axisTicks: TreatmentGanttAxisTick[]
  canvasWidth: number
  events: TreatmentGanttEvent[]
  rows: TreatmentGanttRow[]
}

type ParsedDate = {
  day: number | null
  month: number
  point: number
  time: number
  year: number
}

type RowDraft = {
  end: ParsedDate | null
  endRaw?: string
  id: string
  isBaseline: boolean
  lineNumber: number | null
  marker: string
  plan?: string
  start: ParsedDate | null
  startRaw?: string
  supplementParts: TreatmentGanttSupplementPart[]
}

const CANVAS_WIDTH = 1680
const ONGOING_MONTHS = 2
const MONTH_MS = 30.4375 * 24 * 60 * 60 * 1000

function trim(value?: string) {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function roundPercent(value: number) {
  return Number(value.toFixed(3))
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function parseDate(value?: string): ParsedDate | null {
  const raw = trim(value)

  if (!raw) {
    return null
  }

  const normalized = raw
    .replace(/[年月/]/g, '-')
    .replace(/日/g, '')
    .replace(/\./g, '-')
  const match = normalized.match(/(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/)

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = match[2] ? Number(match[2]) : 1
  const day = match[3] ? Number(match[3]) : null
  const maxDay = daysInMonth(year, month)

  if (
    !Number.isInteger(year)
    || !Number.isInteger(month)
    || month < 1
    || month > 12
    || (day !== null && (!Number.isInteger(day) || day < 1 || day > maxDay))
  ) {
    return null
  }

  return {
    day,
    month,
    point: year * 12 + month - 1 + (day === null ? 0 : (day - 1) / maxDay),
    time: Date.UTC(year, month - 1, day ?? 1),
    year,
  }
}

function cleanDateLabel(value?: string) {
  return trim(value)?.replace(/\s+/g, ' ')
}

function formatMarker(index: number) {
  return String(index).padStart(2, '0')
}

function formatRange(startRaw: string | undefined, endRaw: string | undefined, status: TreatmentGanttRow['status'], locale: Locale) {
  const start = cleanDateLabel(startRaw)
  const end = cleanDateLabel(endRaw)

  if (!start) {
    return locale === 'zh' ? '日期待补充' : 'Date pending'
  }

  if (status === 'ongoing') {
    return /起|至今|present|ongoing/i.test(start) ? start : locale === 'zh' ? `${start} 起` : `${start} onward`
  }

  if (!end) {
    return locale === 'zh' ? '日期待补充' : 'Date pending'
  }

  return `${start}-${end}`
}

function formatPfs(start: ParsedDate | null, end: ParsedDate | null, status: TreatmentGanttRow['status'], locale: Locale) {
  if (status === 'ongoing') {
    return locale === 'zh' ? 'PFS=进行中' : 'PFS=ongoing'
  }

  if (!start || !end) {
    return locale === 'zh' ? 'PFS=待补充' : 'PFS=pending'
  }

  const hasDayPrecision = start.day !== null || end.day !== null
  const months = hasDayPrecision ? Math.max((end.time - start.time) / MONTH_MS, 0) : Math.max(end.point - start.point, 0)

  if (hasDayPrecision) {
    const value = Number(months.toFixed(1))
    return locale === 'zh' ? `PFS=约${value}个月` : `PFS=about ${value} mo`
  }

  return locale === 'zh' ? `PFS=${Math.round(months)}个月` : `PFS=${Math.round(months)} mo`
}

function buildSupplementParts({
  biopsy,
  geneticTest,
  immunohistochemistry,
}: {
  biopsy?: string
  geneticTest?: string
  immunohistochemistry?: string
}) {
  const parts: TreatmentGanttSupplementPart[] = []

  if (trim(biopsy)) {
    parts.push({ label: '活检/事件', value: trim(biopsy)! })
  }

  if (trim(immunohistochemistry)) {
    parts.push({ label: '免疫组化', value: trim(immunohistochemistry)! })
  }

  if (trim(geneticTest)) {
    parts.push({ label: '基因检测', value: trim(geneticTest)! })
  }

  return parts
}

function firstTreatmentLine(lines: TreatmentLine[]) {
  return [...lines].sort((left, right) => left.lineNumber - right.lineNumber)[0]
}

function buildDrafts(record: PatientRecord): RowDraft[] {
  const lines = [...record.treatmentLines].sort((left, right) => left.lineNumber - right.lineNumber)
  const drafts: RowDraft[] = []

  if (record.initialOnset) {
    const firstLine = firstTreatmentLine(lines)

    drafts.push({
      end: parseDate(firstLine?.startDate),
      endRaw: firstLine?.startDate,
      id: 'initial',
      isBaseline: true,
      lineNumber: null,
      marker: '00',
      plan: record.initialOnset.treatment,
      start: parseDate(record.initialOnset.triggerDate),
      startRaw: record.initialOnset.triggerDate,
      supplementParts: buildSupplementParts(record.initialOnset),
    })
  }

  lines.forEach((line) => {
    drafts.push({
      end: parseDate(line.endDate),
      endRaw: line.endDate,
      id: `line-${line.lineNumber}`,
      isBaseline: false,
      lineNumber: line.lineNumber,
      marker: formatMarker(line.lineNumber),
      plan: line.regimen,
      start: parseDate(line.startDate),
      startRaw: line.startDate,
      supplementParts: buildSupplementParts(line),
    })
  })

  return drafts
}

function percent(point: number, domainStart: number, domainEnd: number) {
  const span = Math.max(domainEnd - domainStart, 1)
  return roundPercent(((point - domainStart) / span) * 100)
}

function widthPercent(start: number, end: number, domainStart: number, domainEnd: number) {
  const span = Math.max(domainEnd - domainStart, 1)
  return roundPercent(((end - start) / span) * 100)
}

function buildAxisTicks(domainStart: number, domainEnd: number): TreatmentGanttAxisTick[] {
  const startYear = Math.floor(domainStart / 12)
  const startMonth = Math.floor(domainStart % 12) + 1
  const endYear = Math.floor(domainEnd / 12)
  const ticks: TreatmentGanttAxisTick[] = [
    {
      label: startMonth >= 7 ? `${startYear} H2` : `${startYear}`,
      leftPercent: 0,
    },
  ]

  for (let year = startYear + 1; year <= endYear; year += 1) {
    const point = year * 12

    if (point > domainStart && point <= domainEnd) {
      ticks.push({
        label: `${year}`,
        leftPercent: percent(point, domainStart, domainEnd),
      })
    }
  }

  const q4Point = endYear * 12 + 9

  if (q4Point > domainStart && q4Point <= domainEnd && !ticks.some((tick) => tick.label === `${endYear} Q4`)) {
    ticks.push({
      label: `${endYear} Q4`,
      leftPercent: percent(q4Point, domainStart, domainEnd),
    })
  }

  return ticks
}

function getPlanFallback(locale: Locale) {
  return locale === 'zh' ? '方案待补充' : 'Regimen pending'
}

export function buildTreatmentGanttProjection(record: PatientRecord, locale: Locale): TreatmentGanttProjection {
  const drafts = buildDrafts(record)
  const datedStarts = drafts.flatMap((draft) => (draft.start ? [draft.start.point] : []))

  if (datedStarts.length === 0) {
    return {
      axisTicks: [],
      canvasWidth: CANVAS_WIDTH,
      events: [],
      rows: drafts.map((draft) => ({
        bar: null,
        continueFromPercent: null,
        gap: null,
        id: draft.id,
        isBaseline: draft.isBaseline,
        isCurrent: false,
        lineNumber: draft.lineNumber,
        marker: draft.marker,
        pfsLabel: formatPfs(draft.start, draft.end, 'pending', locale),
        plan: trim(draft.plan) ?? getPlanFallback(locale),
        rangeLabel: formatRange(draft.startRaw, draft.endRaw, 'pending', locale),
        status: 'pending',
        supplementParts: draft.supplementParts,
      })),
    }
  }

  const displayEnds = drafts.flatMap((draft) => {
    if (!draft.start) {
      return []
    }

    if (draft.end) {
      return [draft.end.point]
    }

    return [draft.start.point + ONGOING_MONTHS]
  })
  const domainStart = Math.min(...datedStarts)
  const domainEnd = Math.max(...displayEnds, domainStart + 1)
  let previousEnd: number | null = null

  const rows = drafts.map((draft) => {
    const status: TreatmentGanttRow['status'] = draft.start && draft.end
      ? draft.end.point >= draft.start.point
        ? 'complete'
        : 'pending'
      : draft.start && !draft.end
        ? 'ongoing'
        : 'pending'
    const displayEnd = status === 'ongoing' && draft.start ? draft.start.point + ONGOING_MONTHS : draft.end?.point
    const gap = draft.start && previousEnd !== null && draft.start.point > previousEnd
      ? {
          leftPercent: percent(previousEnd, domainStart, domainEnd),
          widthPercent: widthPercent(previousEnd, draft.start.point, domainStart, domainEnd),
        }
      : null
    const bar = draft.start && displayEnd !== undefined && displayEnd >= draft.start.point && status !== 'pending'
      ? {
        leftPercent: percent(draft.start.point, domainStart, domainEnd),
          widthPercent: widthPercent(draft.start.point, displayEnd, domainStart, domainEnd),
        }
      : null

    if (displayEnd !== undefined && status !== 'pending') {
      previousEnd = displayEnd
    }

    return {
      bar,
      continueFromPercent: status === 'ongoing' && displayEnd !== undefined ? percent(displayEnd, domainStart, domainEnd) : null,
      gap,
      id: draft.id,
      isBaseline: draft.isBaseline,
      isCurrent: status === 'ongoing',
      lineNumber: draft.lineNumber,
      marker: draft.marker,
      pfsLabel: formatPfs(draft.start, draft.end, status, locale),
      plan: trim(draft.plan) ?? getPlanFallback(locale),
      rangeLabel: formatRange(draft.startRaw, draft.endRaw, status, locale),
      status,
      supplementParts: draft.supplementParts,
    }
  })

  return {
    axisTicks: buildAxisTicks(domainStart, domainEnd),
    canvasWidth: CANVAS_WIDTH,
    events: rows.flatMap((row) => {
      const draft = drafts.find((item) => item.id === row.id)
      return draft?.start ? [{ label: row.marker, leftPercent: percent(draft.start.point, domainStart, domainEnd) }] : []
    }),
    rows,
  }
}
