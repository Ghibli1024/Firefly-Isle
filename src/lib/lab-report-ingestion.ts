/**
 * [INPUT]: 依赖 @/lib/lab-dictionary 的分类字典、OCR 候选归一化和参考范围解析，依赖 @/lib/lab-results 的血常规派生指标生成。
 * [OUTPUT]: 对外提供 LabReviewRow、extractLabReportReviewRows、toConfirmedLabReadings、hasBlockingReviewRows 与 buildLabReportDate。
 * [POS]: lib 的网页端实验室报告摄入纯逻辑层，把 OCR 文本转成可复核表格行，并在确认后输出可写入 Supabase 的 LabResult。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import {
  findLabIndicator,
  getLabIndicatorsByCategory,
  matchLabIndicatorInText,
  normalizeLabCandidate,
  parseReferenceRange,
} from '@/lib/lab-dictionary'
import { buildDerivedBloodRoutineReadings } from '@/lib/lab-results'
import type { LabResult, LabResultCategory } from '@/types/patient'

export type LabReviewRow = {
  id: string
  include: boolean
  itemCode: string
  itemName: string
  message: string
  rawText: string
  referenceHigh: string
  referenceLow: string
  status: 'mapped' | 'needs-review'
  testDate: string
  unit: string
  value: string
}

const DATE_PATTERNS = [
  /(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})日?/,
  /(\d{4})[-/.年](\d{1,2})月?/,
] as const

function pad(value: string) {
  return value.padStart(2, '0')
}

export function buildLabReportDate(text: string) {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern)

    if (!match) {
      continue
    }

    const [, year, month, day] = match
    return day ? `${year}-${pad(month)}-${pad(day)}` : `${year}-${pad(month)}`
  }

  return ''
}

function extractReferenceText(line: string) {
  const explicit = line.match(/参考(?:范围|值)?[:：]?\s*([<>≤≥]?\s*-?\d+(?:\.\d+)?\s*(?:[-~～至]\s*-?\d+(?:\.\d+)?)?)/)

  return explicit?.[1] ?? ''
}

function stripKnownNoise(line: string, category: LabResultCategory) {
  const item = matchLabIndicatorInText(category, line)
  let clean = line

  if (item) {
    for (const alias of item.aliases) {
      clean = clean.replace(new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' ')
    }
  }

  return clean
    .replace(/\d{4}[-/.年]\d{1,2}(?:[-/.月]\d{1,2}日?)?/g, ' ')
    .replace(/参考(?:范围|值)?[:：]?\s*[<>≤≥]?\s*-?\d+(?:\.\d+)?\s*(?:[-~～至]\s*-?\d+(?:\.\d+)?)?/g, ' ')
}

function extractValue(line: string, category: LabResultCategory) {
  const clean = stripKnownNoise(line, category)
  const match = clean.match(/-?\d+(?:\.\d+)?/)

  return match?.[0] ?? ''
}

function createReviewRow(rawText: string, category: LabResultCategory, fallbackDate: string, index: number): LabReviewRow | null {
  const item = matchLabIndicatorInText(category, rawText)

  if (!item) {
    return null
  }

  const referenceText = extractReferenceText(rawText)
  const value = extractValue(rawText, category)
  const normalized = normalizeLabCandidate(
    {
      itemName: item.name,
      rawText,
      referenceRange: referenceText,
      testDate: fallbackDate || undefined,
      value,
    },
    category,
  )
  const reading = normalized.reading
  const range = parseReferenceRange(referenceText)

  return {
    id: `lab-review-${index}`,
    include: true,
    itemCode: reading?.itemCode ?? item.code,
    itemName: reading?.itemName ?? item.name,
    message: normalized.message,
    rawText,
    referenceHigh: String(reading?.referenceHigh ?? range?.high ?? item.referenceHigh ?? ''),
    referenceLow: String(reading?.referenceLow ?? range?.low ?? item.referenceLow ?? ''),
    status: normalized.status === 'mapped' ? 'mapped' : 'needs-review',
    testDate: reading?.testDate ?? fallbackDate,
    unit: reading?.unit ?? item.unit ?? '',
    value: reading ? String(reading.value) : value,
  }
}

export function extractLabReportReviewRows(ocrText: string, category: LabResultCategory): LabReviewRow[] {
  const fallbackDate = buildLabReportDate(ocrText)

  return ocrText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => createReviewRow(line, category, fallbackDate, index))
    .filter((row): row is LabReviewRow => row !== null)
}

function numberOrUndefined(value: string) {
  if (!value.trim()) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function hasBlockingReviewRows(rows: LabReviewRow[]) {
  return rows.some((row) => row.include && (row.status !== 'mapped' || !row.itemCode || numberOrUndefined(row.value) === undefined))
}

export function toConfirmedLabReadings(rows: LabReviewRow[], category: LabResultCategory): LabResult[] {
  const directReadings = rows
    .filter((row) => row.include)
    .flatMap((row) => {
      const item = findLabIndicator(category, row.itemCode) ?? getLabIndicatorsByCategory(category).find((entry) => entry.code === row.itemCode)
      const value = numberOrUndefined(row.value)

      if (!item || value === undefined) {
        return []
      }

      return [
        {
          category,
          itemCode: item.code,
          itemName: item.name,
          referenceHigh: numberOrUndefined(row.referenceHigh) ?? item.referenceHigh,
          referenceLow: numberOrUndefined(row.referenceLow) ?? item.referenceLow,
          source: 'ocr' as const,
          testDate: row.testDate.trim() || undefined,
          unit: row.unit.trim() || item.unit,
          value,
        },
      ]
    })

  return category === 'blood-routine' ? [...directReadings, ...buildDerivedBloodRoutineReadings(directReadings)] : directReadings
}
