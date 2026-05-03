/**
 * [INPUT]: 依赖 @/lib/llm 的 chat 边界、@/lib/extractionPrompt、@/types/patient。
 * [OUTPUT]: 对外提供 MAX_FOLLOW_UP_ROUNDS、ExtractionParseError、normalizePatientRecord、getMissingCriticalFields、mergePatientRecord、buildFollowUpQuestion、parsePatientRecordResponse、extractPatientRecord 与 runExtractionWithFollowUps。
 * [POS]: src/lib 的信息提取主链路，把解析、归一化、缺失字段检测与追问 merge 收敛在一处。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { buildExtractionPrompt } from '@/lib/extractionPrompt'
import { chat } from '@/lib/llm'
import { type Message } from '@/lib/llm/types'
import type { PatientRecord, TreatmentLine } from '@/types/patient'

const CRITICAL_FIELDS = ['tumorType', 'stage', 'regimen'] as const
const DATE_PATTERN = /^\d{4}-(\d{2})(-\d{2})?$/
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

  const normalized = value.trim().replaceAll('/', '-')
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

export function normalizePatientRecord(input: Partial<PatientRecord>): PatientRecord {
  const treatmentLines = Array.isArray(input.treatmentLines)
    ? input.treatmentLines.map((line, index) => normalizeTreatmentLine(line, index + 1))
    : []

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

export async function extractPatientRecord(input: string, existingRecord?: PatientRecord): Promise<PatientRecord> {
  const messages: Message[] = [
    {
      role: 'system',
      content: '你是一个严格输出 JSON 的肿瘤病历结构化提取器。',
    },
    {
      role: 'user',
      content: buildExtractionPrompt(input, existingRecord),
    },
  ]

  const response = await chat(messages, { responseFormat: 'json_object' })
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
