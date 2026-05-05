/**
 * [INPUT]: 依赖 @/components/app-shell 的设计复刻壳层，依赖 @/components/workspace 的输入区、追问区与报告预览 feature 组件，依赖 @/lib/auth 的当前会话身份标签，依赖 @/lib/extraction 的提取主链路，依赖 @/lib/record-editing 的自然语言编辑边界，依赖 @/lib/medical-document-ocr 的医学文档 OCR client，依赖 @/lib/patient-record-storage 的落库与最近记录恢复入口，依赖 @/lib/theme 的 useTheme。
 * [OUTPUT]: 对外提供 WorkspacePage 组件，对应 /app。
 * [POS]: routes 的临床工作区 orchestration 层，保留文本/OCR 提取、追问、解析错误恢复与 inline edit 持久化，并编排统一 system shell 与 workspace feature 组件。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useState } from 'react'
import { ArchiveSideNav, ClinicalTopBar } from '@/components/app-shell'
import { getCopy, copy } from '@/lib/copy'
import { useLocale } from '@/lib/locale'
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
import { getMedicalDocumentOcrMessage, recognizeMedicalDocument } from '@/lib/medical-document-ocr'
import { loadLatestPatientRecord, persistPatientRecord } from '@/lib/patient-record-storage'
import { applyPatientRecordEdit, applyPatientRecordEdits, extractPatientRecordEdits } from '@/lib/record-editing'
import { useTheme } from '@/lib/theme'
import { shellContentWidthClass, sidebarOffsetClass, topBarOffsetClass } from '@/lib/theme/tokens'
import type { PatientFieldTarget, PatientRecord } from '@/types/patient'

type WorkspacePageProps = {
  isSigningOut?: boolean
  onSignOut?: () => void
  userIsAnonymous?: boolean
  userLabel?: string
}

type ExtractionState = {
  currentQuestion: string | null
  editFeedback: string | null
  error: string | null
  extractionInput: string
  followUpAnswers: string[]
  isExtracting: boolean
  isSaving: boolean
  ocr: OcrState
  record: PatientRecord | null
  remainingMissing: string[]
  retryAnswer: string | null
  retryMode: 'initial' | 'follow-up' | 'edit' | null
}

type OcrState = {
  error: string | null
  isProcessing: boolean
  text: string | null
}

const EMPTY_RECORD: PatientRecord = {
  treatmentLines: [],
}

function getSaveErrorMessage(target: PatientFieldTarget, locale: 'zh' | 'en') {
  return target.section === 'treatmentLine'
    ? getCopy(copy.workspace.errors.saveTreatmentLine, locale)
    : getCopy(copy.workspace.errors.savePatient, locale)
}

function getNextQuestion(missingFields: string[], followUpCount: number) {
  if (missingFields.length === 0 || followUpCount >= MAX_FOLLOW_UP_ROUNDS) {
    return null
  }

  return buildFollowUpQuestion(missingFields)
}

function useExtractionState() {
  const { user } = useAuth()
  const { locale } = useLocale()
  const [state, setState] = useState<ExtractionState>({
    currentQuestion: null,
    editFeedback: null,
    error: null,
    extractionInput: '',
    followUpAnswers: [],
    isExtracting: false,
    isSaving: false,
    ocr: {
      error: null,
      isProcessing: false,
      text: null,
    },
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
          editFeedback: null,
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
          error: current.record ? current.error : getCopy(copy.workspace.errors.loadLatest, locale),
        }))
      })

    return () => {
      active = false
    }
  }, [locale, user])

  async function runInitialExtraction(inputOverride?: string) {
    const extractionText = inputOverride ?? state.extractionInput

    if (!extractionText.trim()) {
      setState((current) => ({
        ...current,
        error: getCopy(copy.workspace.errors.missingInput, locale),
        retryMode: null,
      }))
      return
    }

    setState((current) => ({
      ...current,
      currentQuestion: null,
      editFeedback: null,
      error: null,
      followUpAnswers: [],
      isExtracting: true,
      ocr: {
        error: null,
        isProcessing: false,
        text: null,
      },
      record: null,
      remainingMissing: [],
      retryAnswer: null,
      retryMode: null,
    }))

    try {
      const record = await extractPatientRecord(extractionText)
      const missingFields = getMissingCriticalFields(record)
      let persistedRecord = record
      let persistenceError: string | null = null

      try {
        persistedRecord = await persistField(record)
      } catch {
        persistenceError = getCopy(copy.workspace.errors.savePatient, locale)
      }

      setState((current) => ({
        ...current,
        currentQuestion: getNextQuestion(missingFields, 0),
        editFeedback: null,
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

    const previousRecord = state.record

    setState((current) => ({
      ...current,
      error: null,
      editFeedback: null,
      isExtracting: true,
      retryAnswer: null,
      retryMode: null,
    }))

    try {
      const nextRecord = await extractPatientRecord(answer, previousRecord)

      try {
        const persistedRecord = await persistField(nextRecord)
        const nextMissing = getMissingCriticalFields(persistedRecord)

        setState((current) => {
          const followUpAnswers = [...current.followUpAnswers, answer]

          return {
            ...current,
            currentQuestion: getNextQuestion(nextMissing, followUpAnswers.length),
            editFeedback: null,
            error: null,
            followUpAnswers,
            isExtracting: false,
            record: persistedRecord,
            remainingMissing: nextMissing,
            retryAnswer: null,
            retryMode: null,
          }
        })
      } catch {
        setState((current) => ({
          ...current,
          currentQuestion: getNextQuestion(getMissingCriticalFields(previousRecord), current.followUpAnswers.length),
          editFeedback: null,
          error: getCopy(copy.workspace.errors.savePatient, locale),
          isExtracting: false,
          record: previousRecord,
          remainingMissing: getMissingCriticalFields(previousRecord),
          retryAnswer: answer,
          retryMode: 'follow-up',
        }))
      }
    } catch (error) {
      setState((current) => ({
        ...current,
        editFeedback: null,
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
    if (state.retryMode === 'edit' && state.retryAnswer && state.record) {
      await runConversationalEdit(state.retryAnswer)
      return
    }

    if (state.retryMode === 'follow-up' && state.retryAnswer) {
      await runFollowUpExtraction(state.retryAnswer)
      return
    }

    await runInitialExtraction()
  }

  async function runConversationalEdit(inputOverride?: string) {
    const editCommand = inputOverride ?? state.extractionInput
    const previousRecord = state.record

    if (!previousRecord) {
      await runInitialExtraction(inputOverride)
      return
    }

    if (!editCommand.trim()) {
      setState((current) => ({
        ...current,
        editFeedback: null,
        error: getCopy(copy.workspace.errors.missingInput, locale),
        retryMode: null,
      }))
      return
    }

    setState((current) => ({
      ...current,
      editFeedback: null,
      error: null,
      isExtracting: true,
      retryAnswer: null,
      retryMode: null,
    }))

    try {
      const edits = await extractPatientRecordEdits(editCommand, previousRecord)
      const nextRecord = applyPatientRecordEdits(previousRecord, edits)
      const persistedRecord = await persistField(nextRecord)
      const nextMissing = getMissingCriticalFields(persistedRecord)

      setState((current) => ({
        ...current,
        currentQuestion: getNextQuestion(nextMissing, current.followUpAnswers.length),
        editFeedback: getCopy(copy.workspace.composer.editSaved, locale),
        error: null,
        extractionInput: '',
        isExtracting: false,
        record: persistedRecord,
        remainingMissing: nextMissing,
        retryAnswer: null,
        retryMode: null,
      }))
    } catch {
      setState((current) => ({
        ...current,
        editFeedback: null,
        error: locale === 'zh' ? '修改解析或保存失败，请重试。' : 'Edit parsing or saving failed. Please retry.',
        isExtracting: false,
        record: previousRecord,
        retryAnswer: editCommand,
        retryMode: 'edit',
      }))
    }
  }

  async function submitComposerInput() {
    if (state.record) {
      await runConversationalEdit()
      return
    }

    await runInitialExtraction()
  }

  async function importMedicalDocument(file: File) {
    setState((current) => ({
      ...current,
      error: null,
      ocr: {
        error: null,
        isProcessing: true,
        text: null,
      },
    }))

    try {
      const result = await recognizeMedicalDocument(file)

      setState((current) => ({
        ...current,
        ocr: {
          error: null,
          isProcessing: false,
          text: result.text,
        },
      }))
    } catch (error) {
      setState((current) => ({
        ...current,
        error: null,
        ocr: {
          error: getMedicalDocumentOcrMessage(error, locale),
          isProcessing: false,
          text: null,
        },
        record: current.record,
        remainingMissing: current.remainingMissing,
      }))
    }
  }

  async function confirmOcrText() {
    const ocrText = state.ocr.text?.trim()

    if (!ocrText) {
      return
    }

    setState((current) => ({
      ...current,
      extractionInput: ocrText,
      ocr: {
        error: null,
        isProcessing: false,
        text: null,
      },
    }))

    await runInitialExtraction(ocrText)
  }

  function discardOcrText() {
    setState((current) => ({
      ...current,
      ocr: {
        error: null,
        isProcessing: false,
        text: null,
      },
    }))
  }

  async function persistField(record: PatientRecord) {
    if (!user) {
      throw new Error('Missing authenticated user.')
    }

    return persistPatientRecord(record, user.id)
  }

  async function handleFieldCommit(target: PatientFieldTarget, value: string) {
    if (!state.record) {
      return
    }

    const previousRecord = state.record
    const nextRecord = applyPatientRecordEdit(previousRecord, { target, value })
    const nextMissing = getMissingCriticalFields(nextRecord)

    setState((current) => ({
      ...current,
      currentQuestion: getNextQuestion(nextMissing, current.followUpAnswers.length),
      editFeedback: null,
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
        editFeedback: null,
        isSaving: false,
        record: persistedRecord,
      }))
    } catch {
      setState((current) => ({
        ...current,
        currentQuestion: getNextQuestion(getMissingCriticalFields(previousRecord), current.followUpAnswers.length),
        editFeedback: null,
        error: getSaveErrorMessage(target, locale),
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
    confirmOcrText,
    discardOcrText,
    importMedicalDocument,
    retryLastAction,
    runFollowUpExtraction,
    runInitialExtraction,
    submitComposerInput,
    setExtractionInput,
  }
}

function DarkWorkspacePage({ isSigningOut, onSignOut, userIsAnonymous, userLabel }: WorkspacePageProps) {
  const { locale } = useLocale()
  const {
    currentQuestion,
    editFeedback,
    error,
    extractionInput,
    confirmOcrText,
    discardOcrText,
    handleFieldCommit,
    importMedicalDocument,
    isExtracting,
    isSaving,
    ocr,
    record,
    remainingMissing,
    retryLastAction,
    retryMode,
    runFollowUpExtraction,
    submitComposerInput,
    setExtractionInput,
  } = useExtractionState()
  const displayRecord = record ?? EMPTY_RECORD

  return (
    <div className="min-h-screen bg-[var(--ff-surface-base)] font-[var(--ff-font-ui)] text-[var(--ff-text-primary)]">
      <ClinicalTopBar theme="dark" title={locale === 'zh' ? '病程整理台' : 'Clinical Course Organizer'} withRail />
      <ArchiveSideNav dark isSigningOut={isSigningOut} onSignOut={onSignOut} userIsAnonymous={userIsAnonymous} userLabel={userLabel} />

      <MainShell className={`${topBarOffsetClass} ${sidebarOffsetClass} min-h-screen`} theme="dark">
        <SectionSurface className="border-0 px-4 pb-2 pt-4 md:px-8 md:pb-3 md:pt-4" theme="dark" tone="base">
          <div className={`${shellContentWidthClass} space-y-6`}>
            <ExtractionComposer
              error={error}
              feedback={editFeedback}
              extractionInput={extractionInput}
              isExtracting={isExtracting}
              isSaving={isSaving}
              ocrState={ocr}
              onConfirmOcrText={() => void confirmOcrText()}
              onDiscardOcrText={discardOcrText}
              onExtract={() => void submitComposerInput()}
              onImportFile={(file) => void importMedicalDocument(file)}
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

        <SectionSurface className="border-0 px-4 pb-8 pt-2 md:px-8 md:pb-8 md:pt-3" theme="dark" tone="base">
          <div className={shellContentWidthClass}>
            <ReportPreviewFrame
              isExtracting={isExtracting}
              isSaving={isSaving}
              onCommitField={handleFieldCommit}
              record={displayRecord}
              remainingMissing={remainingMissing}
              setReportRef={() => undefined}
              theme="dark"
            />
          </div>
        </SectionSurface>
      </MainShell>
    </div>
  )
}

function LightWorkspacePage({ isSigningOut, onSignOut, userIsAnonymous, userLabel }: WorkspacePageProps) {
  const { locale } = useLocale()
  const {
    currentQuestion,
    editFeedback,
    error,
    extractionInput,
    confirmOcrText,
    discardOcrText,
    followUpAnswers,
    handleFieldCommit,
    importMedicalDocument,
    isExtracting,
    isSaving,
    ocr,
    record,
    remainingMissing,
    retryLastAction,
    retryMode,
    runFollowUpExtraction,
    submitComposerInput,
    setExtractionInput,
  } = useExtractionState()
  const displayRecord = record ?? EMPTY_RECORD

  return (
    <div className="ff-light-workspace-bg min-h-screen text-[var(--ff-text-primary)]">
      <ClinicalTopBar theme="light" title={locale === 'zh' ? '病程整理台' : 'Clinical Course Organizer'} withRail />
      <ArchiveSideNav dark={false} isSigningOut={isSigningOut} onSignOut={onSignOut} userIsAnonymous={userIsAnonymous} userLabel={userLabel} />

      <MainShell className={`${topBarOffsetClass} ${sidebarOffsetClass} min-h-screen`} theme="light">
        <SectionSurface className="border-0 px-4 pb-2 pt-4 md:px-8 md:pb-3 md:pt-4" theme="light" tone="base">
          <div className={`${shellContentWidthClass} space-y-6`}>
            <ExtractionComposer
              error={error}
              feedback={editFeedback}
              extractionInput={extractionInput}
              isExtracting={isExtracting}
              isSaving={isSaving}
              ocrState={ocr}
              onConfirmOcrText={() => void confirmOcrText()}
              onDiscardOcrText={discardOcrText}
              onExtract={() => void submitComposerInput()}
              onImportFile={(file) => void importMedicalDocument(file)}
              onInputChange={setExtractionInput}
              onRetry={() => void retryLastAction()}
              remainingMissingCount={remainingMissing.length}
              retryMode={retryMode}
              theme="light"
            />

            {currentQuestion ? (
              <FollowUpPanel currentQuestion={currentQuestion} onSubmit={(value) => void runFollowUpExtraction(value)} theme="light" />
            ) : null}
          </div>
        </SectionSurface>

        <SectionSurface className="border-0 px-4 pb-8 pt-2 md:px-8 md:pb-8 md:pt-3" theme="light" tone="base">
          <div className={shellContentWidthClass}>
            <ReportPreviewFrame
              followUpCount={Math.min(MAX_FOLLOW_UP_ROUNDS, followUpAnswers.length)}
              isExtracting={isExtracting}
              isSaving={isSaving}
              onCommitField={handleFieldCommit}
              record={displayRecord}
              remainingMissing={remainingMissing}
              setReportRef={() => undefined}
              theme="light"
            />
          </div>
        </SectionSurface>
      </MainShell>
    </div>
  )
}

export function WorkspacePage({ isSigningOut, onSignOut, userIsAnonymous, userLabel }: WorkspacePageProps) {
  const { theme } = useTheme()

  return theme === 'dark' ? (
    <DarkWorkspacePage isSigningOut={isSigningOut} onSignOut={onSignOut} userIsAnonymous={userIsAnonymous} userLabel={userLabel} />
  ) : (
    <LightWorkspacePage isSigningOut={isSigningOut} onSignOut={onSignOut} userIsAnonymous={userIsAnonymous} userLabel={userLabel} />
  )
}
