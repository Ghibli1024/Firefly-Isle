/**
 * [INPUT]: 依赖 @/components/app-shell 的设计复刻壳层，依赖 @/components/workspace 的输入区、追问区与报告预览 feature 组件，依赖 @/lib/auth 的当前会话，依赖 @/lib/extraction 的提取主链路，依赖 @/lib/supabase 的落库与最近记录恢复入口，依赖 @/lib/theme 的 useTheme，依赖 html2canvas 与 jsPDF 的前端导出能力。
 * [OUTPUT]: 对外提供 WorkspacePage 组件，对应 /app。
 * [POS]: routes 的临床工作区 orchestration 层，保留文本提取、追问、解析错误恢复、inline edit 持久化与 PDF/PNG 导出状态机，并编排统一 system shell 与 workspace feature 组件。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useRef, useState } from 'react'

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

import { ArchiveSideNav, DarkTopBar } from '@/components/app-shell'
import { ExtractionComposer } from '@/components/workspace/extraction-composer'
import { FollowUpPanel } from '@/components/workspace/follow-up-panel'
import { ReportPreviewFrame } from '@/components/workspace/report-preview-frame'
import { MainShell, SectionSurface } from '@/components/system/surfaces'
import { useAuth } from '@/lib/auth'
import {
  buildFollowUpQuestion,
  extractPatientRecord,
  ExtractionParseError,
  getMissingCriticalFields,
  MAX_FOLLOW_UP_ROUNDS,
} from '@/lib/extraction'
import { ChatError } from '@/lib/llm'
import { getSupabaseClient } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'
import { shellContentWidthClass, sidebarOffsetClass, topBarOffsetClass } from '@/lib/theme/tokens'
import type { PatientFieldTarget, PatientRecord, TreatmentLine } from '@/types/patient'

type WorkspacePageProps = {
  isSigningOut?: boolean
  onSignOut?: () => void
  userLabel?: string
}

type ExtractionState = {
  currentQuestion: string | null
  error: string | null
  exportError: string | null
  exportFormat: 'pdf' | 'png' | null
  extractionInput: string
  followUpAnswers: string[]
  isExporting: boolean
  isExtracting: boolean
  isSaving: boolean
  record: PatientRecord | null
  remainingMissing: string[]
  retryAnswer: string | null
  retryMode: 'initial' | 'follow-up' | null
}

type PatientRow = {
  basic_info: PatientRecord['basicInfo'] | null
  id: string
  initial_onset: PatientRecord['initialOnset'] | null
}

type TreatmentLineRow = {
  biopsy: string | null
  end_date: string | null
  genetic_test: string | null
  immunohistochemistry: string | null
  line_number: number
  regimen: string | null
  start_date: string | null
}

const EMPTY_RECORD: PatientRecord = {
  treatmentLines: [],
}

function getExportFileBase() {
  const date = new Date().toISOString().slice(0, 10)
  return `firefly-${date}`
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  link.click()

  URL.revokeObjectURL(url)
}

async function renderReportCanvas(element: HTMLElement) {
  return html2canvas(element, {
    backgroundColor: 'var(--ff-surface-paper)',
    scale: 2,
    useCORS: true,
  })
}

async function exportReportAsPng(element: HTMLElement) {
  const canvas = await renderReportCanvas(element)
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })

  if (!blob) {
    throw new Error('Failed to create PNG blob.')
  }

  downloadBlob(blob, `${getExportFileBase()}.png`)
}

async function exportReportAsPdf(element: HTMLElement) {
  const canvas = await renderReportCanvas(element)
  const image = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ format: 'a4', orientation: 'portrait', unit: 'mm' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imageHeight = (canvas.height * pageWidth) / canvas.width
  let remainingHeight = imageHeight
  let offsetY = 0

  pdf.addImage(image, 'PNG', 0, offsetY, pageWidth, imageHeight)
  remainingHeight -= pageHeight

  while (remainingHeight > 0) {
    offsetY = remainingHeight - imageHeight
    pdf.addPage()
    pdf.addImage(image, 'PNG', 0, offsetY, pageWidth, imageHeight)
    remainingHeight -= pageHeight
  }

  pdf.save(`${getExportFileBase()}.pdf`)
}

function getExportErrorMessage(format: 'pdf' | 'png') {
  return format === 'pdf' ? 'PDF 导出失败，请稍后重试。' : 'PNG 导出失败，请稍后重试。'
}

function parseNumericField(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return undefined
  }

  const normalized = Number(trimmed)
  return Number.isFinite(normalized) ? normalized : undefined
}

function parseTextField(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeFieldValue(target: PatientFieldTarget, value: string) {
  if (target.section === 'basicInfo' && ['age', 'height', 'weight'].includes(target.field)) {
    return parseNumericField(value)
  }

  return parseTextField(value)
}

function ensurePatientShell(record: PatientRecord): PatientRecord {
  return {
    ...record,
    basicInfo: record.basicInfo ?? {},
    initialOnset: record.initialOnset,
    treatmentLines: record.treatmentLines,
  }
}

function applyFieldUpdate(record: PatientRecord, target: PatientFieldTarget, rawValue: string): PatientRecord {
  const baseRecord = ensurePatientShell(record)
  const value = normalizeFieldValue(target, rawValue)

  if (target.section === 'basicInfo') {
    return {
      ...baseRecord,
      basicInfo: {
        ...baseRecord.basicInfo,
        [target.field]: value,
      },
    }
  }

  if (target.section === 'initialOnset') {
    return {
      ...baseRecord,
      initialOnset: {
        ...baseRecord.initialOnset,
        [target.field]: value,
      },
    }
  }

  return {
    ...baseRecord,
    treatmentLines: baseRecord.treatmentLines.map((line) =>
      line.lineNumber === target.lineNumber
        ? {
            ...line,
            [target.field]: value,
          }
        : line,
    ),
  }
}

function getPatientPayload(record: PatientRecord) {
  return {
    basic_info: record.basicInfo ?? {},
    initial_onset: record.initialOnset ? record.initialOnset : null,
  }
}

function getTreatmentLinePayload(line: TreatmentLine, patientId: string) {
  return {
    biopsy: line.biopsy ?? null,
    end_date: line.endDate ?? null,
    genetic_test: line.geneticTest ?? null,
    immunohistochemistry: line.immunohistochemistry ?? null,
    line_number: line.lineNumber,
    patient_id: patientId,
    regimen: line.regimen ?? null,
    start_date: line.startDate ?? null,
  }
}

function getSaveErrorMessage(target: PatientFieldTarget) {
  return target.section === 'treatmentLine' ? '治疗线保存失败，请稍后重试。' : '患者信息保存失败，请稍后重试。'
}

function mapTreatmentLineRow(row: TreatmentLineRow): TreatmentLine {
  return {
    biopsy: row.biopsy ?? undefined,
    endDate: row.end_date ?? undefined,
    geneticTest: row.genetic_test ?? undefined,
    immunohistochemistry: row.immunohistochemistry ?? undefined,
    lineNumber: row.line_number,
    regimen: row.regimen ?? undefined,
    startDate: row.start_date ?? undefined,
  }
}

function mapPatientRow(patient: PatientRow, lines: TreatmentLineRow[]): PatientRecord {
  return {
    basicInfo: patient.basic_info ?? undefined,
    id: patient.id,
    initialOnset: patient.initial_onset ?? undefined,
    treatmentLines: lines.map(mapTreatmentLineRow).sort((left, right) => left.lineNumber - right.lineNumber),
  }
}

async function loadLatestPatientRecord(userId: string) {
  const supabase = getSupabaseClient()
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('id, basic_info, initial_onset')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<PatientRow>()

  if (patientError) {
    throw patientError
  }

  if (!patient) {
    return null
  }

  const { data: lines, error: linesError } = await supabase
    .from('treatment_lines')
    .select('line_number, start_date, end_date, regimen, biopsy, immunohistochemistry, genetic_test')
    .eq('patient_id', patient.id)
    .order('line_number', { ascending: true })
    .returns<TreatmentLineRow[]>()

  if (linesError) {
    throw linesError
  }

  return mapPatientRow(patient, lines ?? [])
}

async function ensurePatientRecordExists(record: PatientRecord, userId: string) {
  if (record.id) {
    return record.id
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('patients')
    .insert({
      ...getPatientPayload(record),
      user_id: userId,
    })
    .select('id')
    .single()

  if (error) {
    throw error
  }

  return data.id
}

function getNextQuestion(missingFields: string[], followUpCount: number) {
  if (missingFields.length === 0 || followUpCount >= MAX_FOLLOW_UP_ROUNDS) {
    return null
  }

  return buildFollowUpQuestion(missingFields)
}

function useExtractionState() {
  const { user } = useAuth()
  const reportRef = useRef<HTMLDivElement | null>(null)
  const [state, setState] = useState<ExtractionState>({
    currentQuestion: null,
    error: null,
    exportError: null,
    exportFormat: null,
    extractionInput: '',
    followUpAnswers: [],
    isExporting: false,
    isExtracting: false,
    isSaving: false,
    record: null,
    remainingMissing: [],
    retryAnswer: null,
    retryMode: null,
  })

  useEffect(() => {
    if (!user) {
      setState((current) => {
        if (current.record === null && current.remainingMissing.length === 0) {
          return current
        }

        return {
          ...current,
          currentQuestion: null,
          error: null,
          record: null,
          remainingMissing: [],
          retryAnswer: null,
          retryMode: null,
        }
      })
      return
    }

    let active = true

    void loadLatestPatientRecord(user.id)
      .then((record) => {
        if (!active || !record) {
          return
        }

        const missingFields = getMissingCriticalFields(record)
        setState((current) => ({
          ...current,
          currentQuestion: getNextQuestion(missingFields, current.followUpAnswers.length),
          error: null,
          record,
          remainingMissing: missingFields,
          retryAnswer: null,
          retryMode: null,
        }))
      })
      .catch(() => {
        if (!active) {
          return
        }

        setState((current) => ({
          ...current,
          error: current.record ? current.error : '无法恢复最近一次患者记录，请刷新后重试。',
        }))
      })

    return () => {
      active = false
    }
  }, [user])

  async function runInitialExtraction() {
    if (!state.extractionInput.trim()) {
      setState((current) => ({
        ...current,
        error: '请先输入病情描述，再开始提取。',
        retryMode: null,
      }))
      return
    }

    setState((current) => ({
      ...current,
      currentQuestion: null,
      error: null,
      followUpAnswers: [],
      isExtracting: true,
      record: null,
      remainingMissing: [],
      retryAnswer: null,
      retryMode: null,
    }))

    try {
      const record = await extractPatientRecord(state.extractionInput)
      const missingFields = getMissingCriticalFields(record)
      let persistedRecord = record
      let persistenceError: string | null = null

      try {
        persistedRecord = await persistField(record)
      } catch {
        persistenceError = '患者记录保存失败，请稍后重试。'
      }

      setState((current) => ({
        ...current,
        currentQuestion: getNextQuestion(missingFields, 0),
        error: persistenceError,
        followUpAnswers: [],
        isExtracting: false,
        record: persistedRecord,
        remainingMissing: missingFields,
        retryAnswer: null,
        retryMode: null,
      }))
    } catch (error) {
      const message =
        error instanceof ExtractionParseError
          ? '解析失败，请检查返回内容后重试。'
          : error instanceof ChatError && error.name === 'LLMInvalidResponseError'
            ? '解析失败，请重试一次。'
            : '提取失败，请稍后重试。'

      setState((current) => ({
        ...current,
        error: message,
        isExtracting: false,
        retryAnswer: null,
        retryMode: 'initial',
      }))
    }
  }

  async function runFollowUpExtraction(answer: string) {
    if (!answer.trim() || !state.record) {
      return
    }

    setState((current) => ({
      ...current,
      error: null,
      isExtracting: true,
      retryAnswer: null,
      retryMode: null,
    }))

    try {
      const nextRecord = await extractPatientRecord(answer, state.record)
      const missingFields = getMissingCriticalFields(nextRecord)

      setState((current) => {
        const followUpAnswers = [...current.followUpAnswers, answer]

        return {
          ...current,
          currentQuestion: getNextQuestion(missingFields, followUpAnswers.length),
          followUpAnswers,
          isExtracting: false,
          record: nextRecord,
          remainingMissing: missingFields,
          retryAnswer: null,
          retryMode: null,
        }
      })

      try {
        const persistedRecord = await persistField(nextRecord)
        const nextMissing = getMissingCriticalFields(persistedRecord)

        setState((current) => ({
          ...current,
          currentQuestion: getNextQuestion(nextMissing, current.followUpAnswers.length),
          error: null,
          record: persistedRecord,
          remainingMissing: nextMissing,
        }))
      } catch {
        setState((current) => ({
          ...current,
          error: '患者记录保存失败，请稍后重试。',
        }))
      }
    } catch (error) {
      setState((current) => ({
        ...current,
        error:
          error instanceof ExtractionParseError
            ? '追问解析失败，请重试这轮补充。'
            : '追问合并失败，请重新提交这轮补充。',
        isExtracting: false,
        retryAnswer: answer,
        retryMode: 'follow-up',
      }))
    }
  }

  async function retryLastAction() {
    if (state.retryMode === 'follow-up' && state.retryAnswer) {
      await runFollowUpExtraction(state.retryAnswer)
      return
    }

    await runInitialExtraction()
  }

  async function persistField(record: PatientRecord) {
    if (!user) {
      throw new Error('Missing authenticated user.')
    }

    const patientId = await ensurePatientRecordExists(record, user.id)
    const persistedRecord = record.id ? record : { ...record, id: patientId }
    const supabase = getSupabaseClient()

    const { error: patientError } = await supabase.from('patients').update(getPatientPayload(persistedRecord)).eq('id', patientId)

    if (patientError) {
      throw patientError
    }

    if (persistedRecord.treatmentLines.length > 0) {
      const { error: lineError } = await supabase
        .from('treatment_lines')
        .upsert(
          persistedRecord.treatmentLines.map((line) => getTreatmentLinePayload(line, patientId)),
          { onConflict: 'patient_id,line_number' },
        )

      if (lineError) {
        throw lineError
      }
    }

    return persistedRecord
  }

  async function handleFieldCommit(target: PatientFieldTarget, value: string) {
    if (!state.record) {
      return
    }

    const previousRecord = state.record
    const nextRecord = applyFieldUpdate(previousRecord, target, value)
    const nextMissing = getMissingCriticalFields(nextRecord)

    setState((current) => ({
      ...current,
      currentQuestion: getNextQuestion(nextMissing, current.followUpAnswers.length),
      error: null,
      isSaving: true,
      record: nextRecord,
      remainingMissing: nextMissing,
      retryAnswer: null,
      retryMode: null,
    }))

    try {
      const persistedRecord = await persistField(nextRecord)

      setState((current) => ({
        ...current,
        isSaving: false,
        record: persistedRecord,
      }))
    } catch {
      setState((current) => ({
        ...current,
        currentQuestion: getNextQuestion(getMissingCriticalFields(previousRecord), current.followUpAnswers.length),
        error: getSaveErrorMessage(target),
        isSaving: false,
        record: previousRecord,
        remainingMissing: getMissingCriticalFields(previousRecord),
      }))
    }
  }

  async function handleExport(format: 'pdf' | 'png') {
    if (!reportRef.current || state.isExporting) {
      return
    }

    setState((current) => ({
      ...current,
      exportError: null,
      exportFormat: format,
      isExporting: true,
    }))

    try {
      if (format === 'pdf') {
        await exportReportAsPdf(reportRef.current)
      } else {
        await exportReportAsPng(reportRef.current)
      }

      setState((current) => ({
        ...current,
        exportFormat: null,
        isExporting: false,
      }))
    } catch (error) {
      console.error(error)
      setState((current) => ({
        ...current,
        exportError: getExportErrorMessage(format),
        exportFormat: null,
        isExporting: false,
      }))
    }
  }

  function setReportRef(node: HTMLDivElement | null) {
    reportRef.current = node
  }

  function setExtractionInput(extractionInput: string) {
    setState((current) => ({ ...current, extractionInput }))
  }

  return {
    ...state,
    handleExport,
    handleFieldCommit,
    retryLastAction,
    runFollowUpExtraction,
    runInitialExtraction,
    setExtractionInput,
    setReportRef,
  }
}

function DarkWorkspacePage({ isSigningOut, onSignOut, userLabel }: WorkspacePageProps) {
  const {
    currentQuestion,
    error,
    exportError,
    exportFormat,
    extractionInput,
    handleExport,
    handleFieldCommit,
    isExporting,
    isExtracting,
    isSaving,
    record,
    remainingMissing,
    retryLastAction,
    retryMode,
    runFollowUpExtraction,
    runInitialExtraction,
    setExtractionInput,
    setReportRef,
  } = useExtractionState()
  const displayRecord = record ?? EMPTY_RECORD

  return (
    <div className="min-h-screen bg-[var(--ff-surface-base)] font-['Inter'] text-[var(--ff-text-primary)]">
      <DarkTopBar />
      <ArchiveSideNav dark isSigningOut={isSigningOut} onSignOut={onSignOut} userLabel={userLabel} />

      <MainShell className={`${topBarOffsetClass} ${sidebarOffsetClass} min-h-screen`} theme="dark">
        <SectionSurface className="border-b border-[var(--ff-border-default)] p-8" theme="dark" tone="base">
          <div className={`${shellContentWidthClass} space-y-6`}>
            <ExtractionComposer
              error={error}
              exportError={exportError}
              exportFormat={exportFormat}
              extractionInput={extractionInput}
              isExporting={isExporting}
              isExtracting={isExtracting}
              isSaving={isSaving}
              onExport={(format) => void handleExport(format)}
              onExtract={() => void runInitialExtraction()}
              onInputChange={setExtractionInput}
              onRetry={() => void retryLastAction()}
              remainingMissingCount={remainingMissing.length}
              retryMode={retryMode}
              theme="dark"
            />

            {currentQuestion ? (
              <FollowUpPanel currentQuestion={currentQuestion} onSubmit={(value) => void runFollowUpExtraction(value)} theme="dark" />
            ) : null}
          </div>
        </SectionSurface>

        <SectionSurface className="p-8" theme="dark" tone="panel">
          <div className={shellContentWidthClass}>
            <ReportPreviewFrame
              isExtracting={isExtracting}
              isSaving={isSaving}
              onCommitField={handleFieldCommit}
              record={displayRecord}
              remainingMissing={remainingMissing}
              setReportRef={setReportRef}
              theme="dark"
            />
          </div>
        </SectionSurface>
      </MainShell>
    </div>
  )
}

function LightWorkspacePage({ isSigningOut, onSignOut, userLabel }: WorkspacePageProps) {
  const {
    currentQuestion,
    error,
    exportError,
    exportFormat,
    extractionInput,
    followUpAnswers,
    handleExport,
    handleFieldCommit,
    isExporting,
    isExtracting,
    isSaving,
    record,
    remainingMissing,
    retryLastAction,
    retryMode,
    runFollowUpExtraction,
    runInitialExtraction,
    setExtractionInput,
    setReportRef,
  } = useExtractionState()
  const displayRecord = record ?? EMPTY_RECORD

  return (
    <div className="ff-light-workspace-bg min-h-screen text-[var(--ff-text-primary)]">
      <div className="flex min-h-screen">
        <ArchiveSideNav dark={false} isSigningOut={isSigningOut} onSignOut={onSignOut} userLabel={userLabel} />

        <MainShell className="flex-1 overflow-y-auto p-12" theme="light">
          <header className={`${shellContentWidthClass} mb-12`}>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h1 className="font-['Playfair_Display'] text-7xl font-black uppercase -tracking-widest text-[var(--ff-text-primary)]">
                  EXTRACTOR
                </h1>
                <p className="mt-2 font-['JetBrains_Mono'] text-xs uppercase tracking-widest text-[var(--ff-text-secondary)]">
                  Session ID: AI-2949-01 // Clinical Intelligence Engine
                </p>
              </div>
              <div className="text-right font-['JetBrains_Mono'] text-xs text-[var(--ff-text-muted)]">
                <span className="block">DATE: 2024.05.20</span>
                <span className="block">LOCATION: SHANGHAI CLINIC</span>
              </div>
            </div>
            <div className="ff-light-double-rule" />
          </header>

          <div className={shellContentWidthClass}>
            <ExtractionComposer
              error={error}
              exportError={exportError}
              exportFormat={exportFormat}
              extractionInput={extractionInput}
              isExporting={isExporting}
              isExtracting={isExtracting}
              isSaving={isSaving}
              onExport={(format) => void handleExport(format)}
              onExtract={() => void runInitialExtraction()}
              onInputChange={setExtractionInput}
              onRetry={() => void retryLastAction()}
              remainingMissingCount={remainingMissing.length}
              retryMode={retryMode}
              theme="light"
            />
          </div>

          {currentQuestion ? (
            <section className={`${shellContentWidthClass} mt-8`}>
              <FollowUpPanel currentQuestion={currentQuestion} onSubmit={(value) => void runFollowUpExtraction(value)} theme="light" />
            </section>
          ) : null}

          <section className={`${shellContentWidthClass} mt-8`}>
            <div className="mb-6 flex items-baseline gap-4">
              <h2 className="font-['Newsreader'] text-4xl font-bold tracking-tighter">临床结构化报告</h2>
              <div className="h-[2px] flex-1 bg-[var(--ff-border-default)]" />
            </div>
            <ReportPreviewFrame
              followUpCount={Math.min(MAX_FOLLOW_UP_ROUNDS, followUpAnswers.length)}
              isExtracting={isExtracting}
              isSaving={isSaving}
              onCommitField={handleFieldCommit}
              record={displayRecord}
              remainingMissing={remainingMissing}
              setReportRef={setReportRef}
              theme="light"
            />
          </section>

          <footer className={`${shellContentWidthClass} mt-12 border-t border-[var(--ff-border-muted)] py-12 text-center text-[var(--ff-text-secondary)]`}>
            <span className="font-['Playfair_Display'] text-4xl font-black uppercase italic tracking-tighter">Ink &amp; Archive</span>
            <p className="mt-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.4em]">
              Protocol: CLINICAL-ALPHA-01 // NO UNMATCHED DATA
            </p>
          </footer>
        </MainShell>
      </div>
    </div>
  )
}

export function WorkspacePage({ isSigningOut, onSignOut, userLabel }: WorkspacePageProps) {
  const { theme } = useTheme()

  return theme === 'dark' ? (
    <DarkWorkspacePage isSigningOut={isSigningOut} onSignOut={onSignOut} userLabel={userLabel} />
  ) : (
    <LightWorkspacePage isSigningOut={isSigningOut} onSignOut={onSignOut} userLabel={userLabel} />
  )
}
