/**
 * [INPUT]: 依赖 @/types/patient 的 LabResult 领域模型。
 * [OUTPUT]: 对外提供 DEFAULT_LAB_REFERENCE_RANGES、LabTrendRow 与 buildLabTrendRows。
 * [POS]: lib 的实验室趋势纯逻辑边界，集中参考范围、异常分类与持续增高提示，不承载 UI。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { LabResult } from '@/types/patient'

type ReferenceRange = {
  high?: number
  low?: number
}

export type LabTrendStatus = 'normal' | 'high' | 'low' | 'persistent-high' | 'reference-missing'

export type LabTrendRow = {
  itemCode: string
  itemName: string
  latestDate: string | null
  latestValue: number
  readingCount: number
  referenceRangeLabel: string
  status: LabTrendStatus
  trendWarning: string | null
  undatedCount: number
  unit?: string
}

export const DEFAULT_LAB_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  alt: { high: 40, low: 0 },
  ca125: { high: 35, low: 0 },
  cea: { high: 5, low: 0 },
  wbc: { high: 9.5, low: 3.5 },
} satisfies Record<string, ReferenceRange>

function groupByItem(readings: LabResult[]) {
  const groups = new Map<string, LabResult[]>()

  for (const reading of readings) {
    groups.set(reading.itemCode, [...(groups.get(reading.itemCode) ?? []), reading])
  }

  return groups
}

function hasDate(reading: LabResult) {
  return typeof reading.testDate === 'string' && reading.testDate.trim().length > 0
}

function sortByDate(readings: LabResult[]) {
  return readings.filter(hasDate).sort((left, right) => left.testDate!.localeCompare(right.testDate!))
}

function getReferenceRange(reading: LabResult): ReferenceRange | null {
  const rowRange = {
    high: reading.referenceHigh,
    low: reading.referenceLow,
  }

  if (rowRange.high !== undefined || rowRange.low !== undefined) {
    return rowRange
  }

  return DEFAULT_LAB_REFERENCE_RANGES[reading.itemCode] ?? null
}

function formatReferenceRange(range: ReferenceRange | null, unit?: string) {
  if (!range) {
    return '需补充参考范围'
  }

  const suffix = unit ? ` ${unit}` : ''

  if (range.low !== undefined && range.high !== undefined) {
    return `${range.low}-${range.high}${suffix}`
  }

  if (range.low !== undefined) {
    return `≥ ${range.low}${suffix}`
  }

  return `≤ ${range.high}${suffix}`
}

function classifyReading(reading: LabResult): Exclude<LabTrendStatus, 'persistent-high'> {
  const range = getReferenceRange(reading)

  if (!range) {
    return 'reference-missing'
  }

  if (range.high !== undefined && reading.value > range.high) {
    return 'high'
  }

  if (range.low !== undefined && reading.value < range.low) {
    return 'low'
  }

  return 'normal'
}

function countLatestConsecutiveHigh(readings: LabResult[]) {
  let count = 0

  for (const reading of [...readings].reverse()) {
    if (classifyReading(reading) !== 'high') {
      break
    }

    count += 1
  }

  return count
}

function latestReading(readings: LabResult[]) {
  const dated = sortByDate(readings)
  return dated.at(-1) ?? readings.at(-1)
}

export function buildLabTrendRows(readings: LabResult[]): LabTrendRow[] {
  return [...groupByItem(readings).entries()]
    .map(([itemCode, group]) => {
      const latest = latestReading(group)!
      const dated = sortByDate(group)
      const latestStatus = classifyReading(latest)
      const persistentHigh = dated.length > 1 && countLatestConsecutiveHigh(dated) >= 2
      const status: LabTrendStatus = persistentHigh ? 'persistent-high' : latestStatus

      return {
        itemCode,
        itemName: latest.itemName,
        latestDate: hasDate(latest) ? latest.testDate! : null,
        latestValue: latest.value,
        readingCount: group.length,
        referenceRangeLabel: formatReferenceRange(getReferenceRange(latest), latest.unit),
        status,
        trendWarning: persistentHigh ? '连续多次高于参考范围，仅作趋势提示，请结合临床资料人工确认。' : null,
        undatedCount: group.length - dated.length,
        unit: latest.unit,
      }
    })
    .sort((left, right) => left.itemName.localeCompare(right.itemName))
}
