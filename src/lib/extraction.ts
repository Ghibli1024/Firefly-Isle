/**
 * [INPUT]: 依赖 @/lib/llm 的 chat 边界、@/lib/extractionPrompt、@/types/patient。
 * [OUTPUT]: 对外提供 MAX_FOLLOW_UP_ROUNDS、ExtractionParseError、normalizePatientRecord、getMissingCriticalFields、mergePatientRecord、buildFollowUpQuestion、parsePatientRecordResponse、extractPatientRecord 与 runExtractionWithFollowUps，保留 labResults 独立结构、中文/点号日期归一化与单消息 JSON mode 降级重试。
 * [POS]: src/lib 的信息提取主链路，把解析、归一化、缺失字段检测与追问 merge 收敛在一处。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { buildExtractionPrompt } from '@/lib/extractionPrompt'
import { chat } from '@/lib/llm'
import { type Message } from '@/lib/llm/types'
import type { LabResult, LabResultCategory, LabResultSource, PatientRecord, TreatmentLine } from '@/types/patient'

const CRITICAL_FIELDS = ['tumorType', 'stage', 'regimen'] as const
const DATE_PATTERN = /^\d{4}-(\d{2})(-\d{2})?$/
const LAB_CATEGORIES = new Set<LabResultCategory>(['blood-routine', 'blood-biochemistry', 'tumor-marker'])
const LAB_SOURCES = new Set<LabResultSource>(['ocr', 'manual', 'test'])
export const MAX_FOLLOW_UP_ROUNDS = 3

type CriticalField = (typeof CRITICAL_FIELDS)[number]

export class ExtractionParseError extends Error {
  rawResponse: string

  constructor(rawResponse: string) {
    super('Failed to parse extracted PatientRecord JSON.')
    this.name = 'ExtractionParseError'
    this.rawResponse = rawResponse
  }
}

function stripMarkdownFences(input: string) {
  const trimmed = input.trim()

  if (!trimmed.startsWith('```')) {
    return trimmed
  }

  return trimmed
    .replace(/^```[a-zA-Z]*\n?/, '')
    .replace(/```$/, '')
    .trim()
}

function normalizeNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const normalized = Number(value.trim())
    return Number.isFinite(normalized) ? normalized : undefined
  }

  return undefined
}

function normalizeDate(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const parts = value
    .trim()
    .replace(/[年/.]/g, '-')
    .replace(/月/g, '-')
    .replace(/日/g, '')
    .replace(/-+$/g, '')
    .split('-')
    .filter(Boolean)

  if (parts.length !== 2 && parts.length !== 3) {
    return undefined
  }

  const [year, month, day] = parts

  if (!/^\d{4}$/.test(year) || !/^\d{1,2}$/.test(month) || (day !== undefined && !/^\d{1,2}$/.test(day))) {
    return undefined
  }

  const monthNumber = Number(month)
  const dayNumber = day === undefined ? undefined : Number(day)

  if (monthNumber < 1 || monthNumber > 12 || (dayNumber !== undefined && (dayNumber < 1 || dayNumber > 31))) {
    return undefined
  }

  const normalized = `${year}-${month.padStart(2, '0')}${day === undefined ? '' : `-${day.padStart(2, '0')}`}`
  return DATE_PATTERN.test(normalized) ? normalized : undefined
}

function normalizeTreatmentLine(line: Partial<TreatmentLine> | undefined, fallbackLineNumber: number): TreatmentLine {
  return {
    lineNumber: normalizeNumber(line?.lineNumber) ?? fallbackLineNumber,
    startDate: normalizeDate(line?.startDate),
    endDate: normalizeDate(line?.endDate),
    regimen: typeof line?.regimen === 'string' && line.regimen.trim() ? line.regimen.trim() : undefined,
    biopsy: typeof line?.biopsy === 'string' && line.biopsy.trim() ? line.biopsy.trim() : undefined,
    immunohistochemistry:
      typeof line?.immunohistochemistry === 'string' && line.immunohistochemistry.trim()
        ? line.immunohistochemistry.trim()
        : undefined,
    geneticTest:
      typeof line?.geneticTest === 'string' && line.geneticTest.trim() ? line.geneticTest.trim() : undefined,
  }
}

function normalizeString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function normalizeLabCategory(value: unknown): LabResultCategory | undefined {
  return typeof value === 'string' && LAB_CATEGORIES.has(value as LabResultCategory) ? (value as LabResultCategory) : undefined
}

function normalizeLabSource(value: unknown): LabResultSource | undefined {
  return typeof value === 'string' && LAB_SOURCES.has(value as LabResultSource) ? (value as LabResultSource) : undefined
}

function normalizeLabResult(reading: Partial<LabResult> | undefined): LabResult | null {
  const category = normalizeLabCategory(reading?.category)
  const itemCode = normalizeString(reading?.itemCode)
  const itemName = normalizeString(reading?.itemName)
  const value = normalizeNumber(reading?.value)

  if (!category || !itemCode || !itemName || value === undefined) {
    return null
  }

  return {
    category,
    itemCode,
    itemName,
    referenceHigh: normalizeNumber(reading?.referenceHigh),
    referenceLow: normalizeNumber(reading?.referenceLow),
    source: normalizeLabSource(reading?.source),
    testDate: normalizeDate(reading?.testDate),
    unit: normalizeString(reading?.unit),
    value,
  }
}

export function normalizePatientRecord(input: Partial<PatientRecord>): PatientRecord {
  const treatmentLines = Array.isArray(input.treatmentLines)
    ? input.treatmentLines.map((line, index) => normalizeTreatmentLine(line, index + 1))
    : []
  const labResults = Array.isArray(input.labResults)
    ? input.labResults.map(normalizeLabResult).filter((reading): reading is LabResult => reading !== null)
    : undefined

  return {
    id: typeof input.id === 'string' && input.id.trim() ? input.id.trim() : undefined,
    basicInfo: input.basicInfo
      ? {
          gender:
            typeof input.basicInfo.gender === 'string' && input.basicInfo.gender.trim()
              ? input.basicInfo.gender.trim()
              : undefined,
          age: normalizeNumber(input.basicInfo.age),
          height: normalizeNumber(input.basicInfo.height),
          weight: normalizeNumber(input.basicInfo.weight),
          tumorType:
            typeof input.basicInfo.tumorType === 'string' && input.basicInfo.tumorType.trim()
              ? input.basicInfo.tumorType.trim()
              : undefined,
          diagnosisDate: normalizeDate(input.basicInfo.diagnosisDate),
          stage:
            typeof input.basicInfo.stage === 'string' && input.basicInfo.stage.trim()
              ? input.basicInfo.stage.trim()
              : undefined,
        }
      : undefined,
    initialOnset: input.initialOnset
      ? {
          triggerDate: normalizeDate(input.initialOnset.triggerDate),
          treatment:
            typeof input.initialOnset.treatment === 'string' && input.initialOnset.treatment.trim()
              ? input.initialOnset.treatment.trim()
              : undefined,
          immunohistochemistry:
            typeof input.initialOnset.immunohistochemistry === 'string' && input.initialOnset.immunohistochemistry.trim()
              ? input.initialOnset.immunohistochemistry.trim()
              : undefined,
          geneticTest:
            typeof input.initialOnset.geneticTest === 'string' && input.initialOnset.geneticTest.trim()
              ? input.initialOnset.geneticTest.trim()
              : undefined,
        }
      : undefined,
    labResults: labResults && labResults.length > 0 ? labResults : undefined,
    treatmentLines: treatmentLines.sort((a, b) => a.lineNumber - b.lineNumber),
  }
}

export function getMissingCriticalFields(record: PatientRecord): string[] {
  const missing = new Set<string>()

  for (const field of CRITICAL_FIELDS) {
    if (field === 'regimen') {
      const hasRegimen =
        (record.initialOnset?.treatment && record.initialOnset.treatment.trim().length > 0) ||
        record.treatmentLines.some((line) => typeof line.regimen === 'string' && line.regimen.trim().length > 0)

      if (!hasRegimen) {
        missing.add('regimen')
      }

      continue
    }

    if (!record.basicInfo?.[field]?.trim()) {
      missing.add(field)
    }
  }

  return [...missing]
}

function mergeTreatmentLines(current: TreatmentLine[], incoming: TreatmentLine[]) {
  const byLineNumber = new Map<number, TreatmentLine>()

  for (const line of current) {
    byLineNumber.set(line.lineNumber, line)
  }

  for (const line of incoming) {
    const existing = byLineNumber.get(line.lineNumber)

    byLineNumber.set(line.lineNumber, {
      ...existing,
      ...line,
      lineNumber: line.lineNumber,
      regimen: line.regimen ?? existing?.regimen,
      biopsy: line.biopsy ?? existing?.biopsy,
      immunohistochemistry: line.immunohistochemistry ?? existing?.immunohistochemistry,
      geneticTest: line.geneticTest ?? existing?.geneticTest,
      startDate: line.startDate ?? existing?.startDate,
      endDate: line.endDate ?? existing?.endDate,
    })
  }

  return [...byLineNumber.values()].sort((a, b) => a.lineNumber - b.lineNumber)
}

function mergeLabResults(current: LabResult[] | undefined, incoming: LabResult[] | undefined) {
  return incoming && incoming.length > 0 ? [...(current ?? []), ...incoming] : current
}

export function mergePatientRecord(current: PatientRecord, incoming: Partial<PatientRecord>) {
  const normalizedIncoming = normalizePatientRecord(incoming)

  return normalizePatientRecord({
    ...current,
    basicInfo: {
      ...current.basicInfo,
      ...normalizedIncoming.basicInfo,
    },
    initialOnset: {
      ...current.initialOnset,
      ...normalizedIncoming.initialOnset,
    },
    labResults: mergeLabResults(current.labResults, normalizedIncoming.labResults),
    treatmentLines: mergeTreatmentLines(current.treatmentLines, normalizedIncoming.treatmentLines),
  })
}

export function buildFollowUpQuestion(missingFields: string[]) {
  if (missingFields.length === 0) {
    return null
  }

  const labels: Record<CriticalField, string> = {
    tumorType: '肿瘤类型',
    stage: '分期',
    regimen: '治疗方案',
  }

  return `还缺少这些关键信息：${missingFields
    .map((field) => labels[field as CriticalField] ?? field)
    .join('、')}。请一次性补充。`
}

export function parsePatientRecordResponse(response: string) {
  const normalizedJson = stripMarkdownFences(response)

  try {
    const parsed = JSON.parse(normalizedJson) as Partial<PatientRecord>
    return normalizePatientRecord(parsed)
  } catch {
    throw new ExtractionParseError(response)
  }
}

function shouldRetryWithoutJsonMode(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'LLMUpstreamError' &&
    (!('status' in error) || error.status === 502)
  )
}

export async function extractPatientRecord(input: string, existingRecord?: PatientRecord): Promise<PatientRecord> {
  const messages: Message[] = [
    {
      role: 'user',
      content: buildExtractionPrompt(input, existingRecord),
    },
  ]

  let response: string

  try {
    response = await chat(messages, { responseFormat: 'json_object' })
  } catch (error) {
    if (!shouldRetryWithoutJsonMode(error)) {
      throw error
    }

    response = await chat(messages)
  }

  const normalized = parsePatientRecordResponse(response)

  return existingRecord ? mergePatientRecord(existingRecord, normalized) : normalized
}

export async function runExtractionWithFollowUps(input: string, answers: string[] = []) {
  let record = await extractPatientRecord(input)
  const askedQuestions: string[] = []

  for (const answer of answers.slice(0, MAX_FOLLOW_UP_ROUNDS)) {
    const missing = getMissingCriticalFields(record)

    if (missing.length === 0) {
      break
    }

    const question = buildFollowUpQuestion(missing)

    if (question) {
      askedQuestions.push(question)
    }

    record = await extractPatientRecord(answer, record)
  }

  return {
    askedQuestions,
    missingFields: getMissingCriticalFields(record),
    record,
  }
}
