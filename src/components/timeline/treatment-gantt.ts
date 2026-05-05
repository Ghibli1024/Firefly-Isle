/**
 * [INPUT]: 依赖 @/types/patient 的 TreatmentLine 领域结构。
 * [OUTPUT]: 对外提供 TreatmentGanttRow、TreatmentGanttBar 与 buildTreatmentGanttRows。
 * [POS]: components/timeline 的甘特图纯数据投影层，把治疗线日期归一为可测试的排序、bar 与当前线状态。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { TreatmentLine } from '@/types/patient'

export type TreatmentGanttBar = {
  leftPercent: number
  widthPercent: number
}

export type TreatmentGanttRow = {
  bar: TreatmentGanttBar | null
  endDate?: string
  isCurrent: boolean
  lineNumber: number
  regimen?: string
  startDate?: string
  status: 'complete' | 'pending'
}

type ParsedDate = {
  serialMonth: number
}

type LineDraft = {
  end: ParsedDate | null
  line: TreatmentLine
  start: ParsedDate | null
}

const MIN_BAR_WIDTH = 8

function trim(value?: string) {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function roundPercent(value: number) {
  return Number(value.toFixed(2))
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

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null
  }

  return {
    serialMonth: year * 12 + month - 1,
  }
}

function getCurrentLineNumber(drafts: LineDraft[]) {
  const withStart = drafts.filter((draft) => draft.start)

  if (withStart.length === 0) {
    return drafts.at(-1)?.line.lineNumber ?? null
  }

  return [...withStart].sort((left, right) => {
    const byDate = (right.start?.serialMonth ?? 0) - (left.start?.serialMonth ?? 0)
    return byDate === 0 ? right.line.lineNumber - left.line.lineNumber : byDate
  })[0].line.lineNumber
}

export function buildTreatmentGanttRows(lines: TreatmentLine[]): TreatmentGanttRow[] {
  const drafts = [...lines]
    .sort((left, right) => left.lineNumber - right.lineNumber)
    .map((line) => ({
      end: parseDate(line.endDate),
      line,
      start: parseDate(line.startDate),
    }))
  const completeDrafts = drafts.filter(
    (draft) => draft.start && draft.end && draft.end.serialMonth >= draft.start.serialMonth,
  )
  const minStart = Math.min(...completeDrafts.map((draft) => draft.start?.serialMonth ?? 0))
  const maxEnd = Math.max(...completeDrafts.map((draft) => draft.end?.serialMonth ?? 0))
  const span = Math.max(maxEnd - minStart, 1)
  const currentLineNumber = getCurrentLineNumber(drafts)

  return drafts.map((draft) => {
    const complete = Boolean(draft.start && draft.end && draft.end.serialMonth >= draft.start.serialMonth)
    const bar = complete
      ? {
          leftPercent: roundPercent((((draft.start?.serialMonth ?? minStart) - minStart) / span) * 100),
          widthPercent: roundPercent(Math.max((((draft.end?.serialMonth ?? maxEnd) - (draft.start?.serialMonth ?? minStart)) / span) * 100, MIN_BAR_WIDTH)),
        }
      : null

    return {
      bar,
      endDate: trim(draft.line.endDate),
      isCurrent: draft.line.lineNumber === currentLineNumber,
      lineNumber: draft.line.lineNumber,
      regimen: trim(draft.line.regimen),
      startDate: trim(draft.line.startDate),
      status: complete ? 'complete' : 'pending',
    }
  })
}
