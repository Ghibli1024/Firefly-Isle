/**
 * [INPUT]: 依赖 @/components/app-shell 的设计复刻壳层与占位图，依赖 @/components/timeline/TimelineTable 的正式表格渲染器，依赖 @/lib/auth 的当前会话，依赖 @/lib/extraction 的提取主链路，依赖 @/lib/supabase 的落库与最近记录恢复入口，依赖 @/lib/theme 的 useTheme。
 * [OUTPUT]: 对外提供 WorkspacePage 组件，对应 /app。
 * [POS]: routes 的临床工作区实现，承载文本输入、信息提取、追问、解析错误恢复、结构化时间线预览与 inline edit 持久化，并保留 Dark/Light 复刻骨架。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useState } from 'react'

import {
  ArchiveSideNav,
  DarkTopBar,
  QR_PLACEHOLDER,
} from '@/components/app-shell'
import { TimelineTable } from '@/components/timeline/TimelineTable'
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
import type { PatientFieldTarget, PatientRecord, TreatmentLine } from '@/types/patient'

type WorkspacePageProps = {
  isSigningOut?: boolean
  onSignOut?: () => void
  userLabel?: string
}

type ExtractionState = {
  currentQuestion: string | null
  error: string | null
  extractionInput: string
  followUpAnswers: string[]
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
  const [state, setState] = useState<ExtractionState>({
    currentQuestion: null,
    error: null,
    extractionInput: '',
    followUpAnswers: [],
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

  function setExtractionInput(extractionInput: string) {
    setState((current) => ({ ...current, extractionInput }))
  }

  return {
    ...state,
    handleFieldCommit,
    retryLastAction,
    runFollowUpExtraction,
    runInitialExtraction,
    setExtractionInput,
  }
}


function DarkWorkspacePage({ isSigningOut, onSignOut, userLabel }: WorkspacePageProps) {
  const {
    currentQuestion,
    error,
    extractionInput,
    handleFieldCommit,
    isExtracting,
    isSaving,
    record,
    remainingMissing,
    retryLastAction,
    retryMode,
    runFollowUpExtraction,
    runInitialExtraction,
    setExtractionInput,
  } = useExtractionState()
  const [followUpInput, setFollowUpInput] = useState('')
  const displayRecord = record ?? EMPTY_RECORD

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-['Inter'] text-[#FAFAFA]">
      <DarkTopBar />
      <ArchiveSideNav dark isSigningOut={isSigningOut} onSignOut={onSignOut} userLabel={userLabel} />

      <main className="ml-0 min-h-screen bg-[#131313] pt-16 md:ml-[15%]">
        <section className="border-b border-[#262626] bg-[#0A0A0A] p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#FF3D00]">
                PATIENT_HISTORY_INPUT
              </label>
              <textarea
                className="h-48 w-full resize-none border-0 border-b border-[#262626] bg-[#1A1A1A] p-4 text-[#FAFAFA] outline-none placeholder:text-[#353534] focus:border-[#FF3D00] focus:border-b-2"
                onChange={(event) => setExtractionInput(event.target.value)}
                placeholder="请描述患者的病情及治疗历程..."
                value={extractionInput}
              />
            </div>

            {error ? <div className="border border-[#7A1F00] px-4 py-3 text-sm text-[#FF8A65]">{error}</div> : null}
            {isSaving ? <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-[0.2em] text-[#FF3D00]">保存中…</div> : null}

            {retryMode ? (
              <button
                className="border border-[#262626] px-4 py-3 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.2em] text-[#FAFAFA]/70"
                onClick={() => void retryLastAction()}
                type="button"
              >
                {retryMode === 'follow-up' ? '重试这轮补充' : '重试提取'}
              </button>
            ) : null}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <button
                className="group flex flex-col items-center justify-center border-2 border-dashed border-[#262626] bg-[#131313] py-10 transition-colors hover:border-[#FF3D00]"
                onClick={() => void runInitialExtraction()}
                type="button"
              >
                <span className="material-symbols-outlined mb-2 text-4xl text-[#353534] group-hover:text-[#FF3D00]">
                  auto_awesome
                </span>
                <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[#353534] group-hover:text-[#FAFAFA]">
                  {isExtracting ? '提取中…' : '开始结构化提取'}
                </span>
              </button>
              <div className="flex items-center justify-center">
                <button className="flex h-full min-h-[120px] w-full flex-col items-center justify-center gap-3 bg-[#FF3D00] text-[#0A0A0A] transition-colors hover:bg-[#FAFAFA]">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    mic
                  </span>
                  <span className="font-['Inter_Tight'] text-xl font-black uppercase tracking-tighter">语音录入</span>
                </button>
              </div>
            </div>

            {currentQuestion ? (
              <div className="border border-[#262626] bg-[#131313] p-6">
                <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#FF3D00]">FOLLOW UP</div>
                <p className="mt-3 text-sm leading-7 text-[#FAFAFA]/80">{currentQuestion}</p>
                <textarea
                  className="mt-4 h-28 w-full resize-none border border-[#262626] bg-[#0A0A0A] p-4 outline-none focus:border-[#FF3D00]"
                  onChange={(event) => setFollowUpInput(event.target.value)}
                  placeholder="一次性补充缺失信息..."
                  value={followUpInput}
                />
                <button
                  className="mt-4 border border-[#FF3D00] px-4 py-3 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.2em] text-[#FF3D00]"
                  onClick={() => {
                    void runFollowUpExtraction(followUpInput)
                    setFollowUpInput('')
                  }}
                  type="button"
                >
                  提交补充
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="flex-1 bg-[#131313] p-8">
          <div className="relative mx-auto max-w-6xl overflow-hidden bg-white p-10 text-[#0A0A0A] shadow-2xl">
            <div className="pointer-events-none absolute right-0 top-0 select-none text-8xl font-black opacity-5 -rotate-12">
              FORENSIC
            </div>
            <div className="mb-8 flex items-end justify-between border-b-4 border-[#0A0A0A] pb-4">
              <div>
                <h1 className="font-['Inter_Tight'] text-5xl font-black leading-none tracking-tighter">
                  临床结构化报告
                </h1>
                <p className="mt-2 font-['JetBrains_Mono'] text-[10px] tracking-widest">
                  GENERATED BY ONE-PAGE FIREFLY AI ARCHIVE
                </p>
              </div>
              <div className="text-right">
                <p className="font-['JetBrains_Mono'] text-xs font-bold">REPORT_ID: LIVE-DRAFT</p>
                <p className="font-['JetBrains_Mono'] text-xs">MISSING: {remainingMissing.length}</p>
              </div>
            </div>

            <TimelineTable disabled={isExtracting || isSaving} onCommitField={handleFieldCommit} record={displayRecord} theme="dark" />

            <div className="mt-12 flex items-center justify-between border-t-2 border-[#0A0A0A] pt-4">
              <div className="max-w-[400px] font-['JetBrains_Mono'] text-[9px]">
                声明：本报告由人工智能辅助系统自动提取，仅供医疗专业人士参考。最终诊断需结合原始影像及病理报告。
              </div>
              <div className="flex flex-col items-center border border-[#0A0A0A] p-2">
                <div className="flex h-16 w-16 items-center justify-center bg-[#F0F0F0]">
                  <img alt="验证码" src={QR_PLACEHOLDER} />
                </div>
                <span className="mt-1 text-[8px]">扫码验证报告</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function LightWorkspacePage({ isSigningOut, onSignOut, userLabel }: WorkspacePageProps) {
  const {
    currentQuestion,
    error,
    extractionInput,
    followUpAnswers,
    handleFieldCommit,
    isExtracting,
    isSaving,
    record,
    remainingMissing,
    retryLastAction,
    retryMode,
    runFollowUpExtraction,
    runInitialExtraction,
    setExtractionInput,
  } = useExtractionState()
  const [followUpInput, setFollowUpInput] = useState('')
  const displayRecord = record ?? EMPTY_RECORD

  return (
    <div className="ff-light-workspace-bg min-h-screen text-[#111111]">
      <div className="flex min-h-screen">
        <ArchiveSideNav dark={false} isSigningOut={isSigningOut} onSignOut={onSignOut} userLabel={userLabel} />

        <main className="flex-1 overflow-y-auto bg-[#F9F9F7] p-12">
          <header className="mx-auto mb-12 w-full max-w-6xl">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h1 className="font-['Playfair_Display'] text-7xl font-black uppercase -tracking-widest text-[#111111]">
                  EXTRACTOR
                </h1>
                <p className="mt-2 font-['JetBrains_Mono'] text-xs uppercase tracking-widest opacity-60">
                  Session ID: AI-2949-01 // Clinical Intelligence Engine
                </p>
              </div>
              <div className="text-right font-['JetBrains_Mono'] text-xs opacity-40">
                <span className="block">DATE: 2024.05.20</span>
                <span className="block">LOCATION: SHANGHAI CLINIC</span>
              </div>
            </div>
            <div className="ff-light-double-rule" />
          </header>

          <section className="mx-auto grid w-full max-w-6xl grid-cols-12 gap-8">
            <div className="col-span-8 flex flex-col gap-6">
              <div className="border-2 border-[#111111] bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <label className="font-['Inter'] text-xs font-bold uppercase tracking-[0.2em] text-[#111111]">
                    文字输入 / TEXT INPUT
                  </label>
                  <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#CC0000]">
                    {isExtracting ? 'ANALYZING' : 'READY TO ANALYZE'}
                  </span>
                </div>
                <textarea
                  className="h-48 w-full resize-none border-0 bg-transparent text-xl leading-relaxed outline-none placeholder:opacity-20"
                  onChange={(event) => setExtractionInput(event.target.value)}
                  placeholder="在此输入患者病史或临床表现描述..."
                  value={extractionInput}
                />
                <div className="mt-6 flex items-center gap-4">
                  <button
                    className="border-2 border-[#111111] bg-[#111111] px-6 py-3 font-['Inter'] text-xs font-bold uppercase tracking-[0.2em] text-[#F9F9F7]"
                    onClick={() => void runInitialExtraction()}
                    type="button"
                  >
                    {isExtracting ? '提取中…' : '开始提取'}
                  </button>
                  {error ? <span className="text-sm text-[#ba1a1a]">{error}</span> : null}
                  {isSaving ? <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-[#CC0000]">保存中…</span> : null}
                  {retryMode ? (
                    <button
                      className="border-2 border-[#111111] px-6 py-3 font-['Inter'] text-xs font-bold uppercase tracking-[0.2em]"
                      onClick={() => void retryLastAction()}
                      type="button"
                    >
                      {retryMode === 'follow-up' ? '重试这轮补充' : '重试提取'}
                    </button>
                  ) : null}
                </div>
              </div>

              {currentQuestion ? (
                <div className="ff-light-ink-shadow border-2 border-[#111111] bg-white p-6">
                  <h3 className="font-['Inter'] text-xs font-bold uppercase tracking-[0.2em]">FOLLOW UP</h3>
                  <p className="mt-3 text-sm leading-7">{currentQuestion}</p>
                  <textarea
                    className="mt-4 h-32 w-full resize-none border-2 border-[#111111] bg-transparent p-4 outline-none"
                    onChange={(event) => setFollowUpInput(event.target.value)}
                    placeholder="一次性补充缺失信息..."
                    value={followUpInput}
                  />
                  <button
                    className="mt-4 border-2 border-[#111111] px-6 py-3 font-['Inter'] text-xs font-bold uppercase tracking-[0.2em]"
                    onClick={() => {
                      void runFollowUpExtraction(followUpInput)
                      setFollowUpInput('')
                    }}
                    type="button"
                  >
                    提交补充
                  </button>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <button
                  className="border-2 border-[#111111] bg-[#111111] px-6 py-3 font-['Inter'] text-xs font-bold uppercase tracking-[0.2em] text-[#F9F9F7] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isExtracting || isSaving}
                  onClick={() => void runInitialExtraction()}
                  type="button"
                >
                  {isExtracting ? '提取中…' : '开始提取'}
                </button>
                <div className="ff-light-hard-shadow flex cursor-pointer flex-col items-center justify-center bg-[#CC0000] p-6 text-white transition-all hover:-translate-y-1">
                  <span className="material-symbols-outlined mb-2 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    mic
                  </span>
                  <span className="font-['Inter'] text-xs font-bold uppercase tracking-widest">语音录入</span>
                  <span className="mt-1 font-['JetBrains_Mono'] text-[10px] opacity-80">HOLD TO RECORD</span>
                </div>
              </div>
            </div>

            <div className="col-span-4 flex flex-col gap-8 border-l-2 border-[#111111] pl-8">
              <div>
                <h3 className="mb-4 border-b border-[#111111] pb-2 font-['Playfair_Display'] text-2xl font-bold">
                  Instructional
                </h3>
                <p className="ff-light-drop-cap text-sm italic leading-relaxed">
                  先输入完整病史，再根据追问一次性补充缺失的临床关键字段。当前仅对肿瘤类型、分期与治疗方案触发追问。
                </p>
              </div>
              <div className="bg-[#111111] p-6 text-[#F9F9F7]">
                <h4 className="mb-4 font-['Inter'] text-[10px] font-bold uppercase tracking-widest">
                  Current Parameters
                </h4>
                <ul className="space-y-2 font-['JetBrains_Mono'] text-[11px] opacity-80">
                  <li className="flex justify-between"><span>MODEL</span><span>GEMINI</span></li>
                  <li className="flex justify-between"><span>FOLLOW UPS</span><span>MAX 3</span></li>
                  <li className="flex justify-between"><span>MISSING</span><span>{remainingMissing.length}</span></li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-8 w-full max-w-6xl">
            <div className="mb-6 flex items-baseline gap-4">
              <h2 className="font-['Newsreader'] text-4xl font-bold tracking-tighter">临床结构化报告</h2>
              <div className="h-[2px] flex-1 bg-[#111111]" />
            </div>
            <div className="border-2 border-[#111111] bg-white p-8">
              <TimelineTable disabled={isExtracting || isSaving} onCommitField={handleFieldCommit} record={displayRecord} theme="light" />

              <div className="mt-12 grid grid-cols-2 gap-12 border-t border-[#111111]/10 pt-8">
                <div>
                  <h5 className="mb-4 font-['Inter'] text-[10px] font-bold uppercase tracking-widest">Clinical Notes</h5>
                  <p className="text-xs italic opacity-60">
                    {remainingMissing.length > 0
                      ? `仍待补充：${remainingMissing.join('、')}`
                      : '关键临床字段已补齐，可进入下一阶段渲染。'}
                  </p>
                </div>
                <div className="flex flex-col justify-end">
                  <div className="flex items-center justify-between bg-[#eeeeec] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center bg-[#111111] font-['Playfair_Display'] text-xl font-black text-[#F9F9F7]">
                        AI
                      </div>
                      <div>
                        <p className="font-['Inter'] text-[10px] font-bold uppercase leading-none">
                          Verified by AI Agent
                        </p>
                        <p className="font-['JetBrains_Mono'] text-[9px] opacity-60">FOLLOW-UPS USED: {Math.min(MAX_FOLLOW_UP_ROUNDS, followUpAnswers.length)}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#CC0000]">verified</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="mx-auto mt-12 w-full max-w-6xl border-t border-[#111111]/10 py-12 text-center opacity-30">
            <span className="font-['Playfair_Display'] text-4xl font-black uppercase italic tracking-tighter">
              Ink &amp; Archive
            </span>
            <p className="mt-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.4em]">
              Protocol: CLINICAL-ALPHA-01 // NO UNMATCHED DATA
            </p>
          </footer>
        </main>
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
