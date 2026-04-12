/**
 * [INPUT]: 依赖 @/types/patient 的 PatientRecord 结构真相源。
 * [OUTPUT]: 对外提供 PATIENT_RECORD_SCHEMA 与 buildExtractionPrompt。
 * [POS]: src/lib 的提取提示词边界，把 LLM 的 JSON 输出约束锁在一处。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { PatientRecord } from '@/types/patient'

export const PATIENT_RECORD_SCHEMA = `interface PatientRecord {
  basicInfo?: {
    gender?: string
    age?: number
    height?: number
    weight?: number
    tumorType?: string
    diagnosisDate?: string
    stage?: string
  }
  initialOnset?: {
    triggerDate?: string
    treatment?: string
    immunohistochemistry?: string
    geneticTest?: string
  }
  treatmentLines: Array<{
    lineNumber: number
    startDate?: string
    endDate?: string
    regimen?: string
    biopsy?: string
    immunohistochemistry?: string
    geneticTest?: string
  }>
}`

export function buildExtractionPrompt(input: string, existingRecord?: PatientRecord) {
  const existingRecordJson = existingRecord ? JSON.stringify(existingRecord, null, 2) : 'null'

  return [
    '你是一个肿瘤病历结构化提取器。',
    '只输出合法 JSON，不要输出 markdown 代码块，不要解释。',
    '如果原文没有提到字段，就省略该字段，不要编造。',
    '数值字段必须输出 number；日期字段只允许 YYYY-MM-DD 或 YYYY-MM。',
    'treatmentLines 必须按 lineNumber 升序。',
    '',
    '目标 TypeScript schema：',
    PATIENT_RECORD_SCHEMA,
    '',
    '当前已知记录（没有则为 null）：',
    existingRecordJson,
    '',
    '待提取文本：',
    input.trim(),
  ].join('\n')
}
