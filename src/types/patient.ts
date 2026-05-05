/**
 * [INPUT]: 不依赖运行时框架，仅承载患者领域模型、编辑目标与判定逻辑。
 * [OUTPUT]: 对外提供 PatientRecord、TreatmentLine、InitialOnset、BasicInfo、LabResult、PatientArchetype、PatientFieldTarget 与 getPatientArchetype。
 * [POS]: types 的核心领域模型文件，为提取、渲染、编辑与持久化共享同一份患者结构真相源。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export interface BasicInfo {
  gender?: string
  age?: number
  height?: number
  weight?: number
  tumorType?: string
  diagnosisDate?: string
  stage?: string
}

export interface InitialOnset {
  triggerDate?: string
  treatment?: string
  immunohistochemistry?: string
  geneticTest?: string
}

export interface TreatmentLine {
  lineNumber: number
  startDate?: string
  endDate?: string
  regimen?: string
  biopsy?: string
  immunohistochemistry?: string
  geneticTest?: string
}

export type LabResultCategory = 'blood-routine' | 'blood-biochemistry' | 'tumor-marker'

export type LabResultSource = 'ocr' | 'manual' | 'test'

export interface LabResult {
  id?: string
  patientId?: string
  testDate?: string
  category: LabResultCategory
  itemCode: string
  itemName: string
  value: number
  unit?: string
  referenceLow?: number
  referenceHigh?: number
  source?: LabResultSource
}

export interface PatientRecord {
  id?: string
  basicInfo?: BasicInfo
  initialOnset?: InitialOnset
  labResults?: LabResult[]
  treatmentLines: TreatmentLine[]
}

export type PatientFieldTarget =
  | { section: 'basicInfo'; field: keyof BasicInfo }
  | { section: 'initialOnset'; field: keyof InitialOnset }
  | { section: 'treatmentLine'; field: Exclude<keyof TreatmentLine, 'lineNumber'>; lineNumber: number }

export type PatientArchetype =
  | 'non-advanced'
  | 'de-novo-advanced'
  | 'relapsed-advanced'

export function getPatientArchetype(record: PatientRecord): PatientArchetype {
  const hasInitialOnset = record.initialOnset !== undefined
  const hasTreatmentLines = record.treatmentLines.length > 0

  if (hasTreatmentLines) {
    return hasInitialOnset ? 'relapsed-advanced' : 'de-novo-advanced'
  }

  return 'non-advanced'
}
