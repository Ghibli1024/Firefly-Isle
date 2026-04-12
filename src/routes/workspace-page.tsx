/**
 * [INPUT]: 依赖 @/components/app-shell 的设计复刻壳层与占位图，依赖 @/lib/extraction 的提取主链路，依赖 @/lib/theme 的 useTheme。
 * [OUTPUT]: 对外提供 WorkspacePage 组件，对应 /app。
 * [POS]: routes 的临床工作区实现，承载文本输入、信息提取、追问、解析错误恢复与结果预览，并保留 Dark/Light 复刻骨架。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useMemo, useState } from 'react'

import {
  ArchiveSideNav,
  DarkTopBar,
  QR_PLACEHOLDER,
  SCAN_PLACEHOLDER,
} from '@/components/app-shell'
import {
  buildFollowUpQuestion,
  extractPatientRecord,
  ExtractionParseError,
  getMissingCriticalFields,
  MAX_FOLLOW_UP_ROUNDS,
} from '@/lib/extraction'
import { ChatError } from '@/lib/llm'
import { useTheme } from '@/lib/theme'
import type { PatientRecord } from '@/types/patient'

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
  record: PatientRecord | null
  remainingMissing: string[]
  retryAnswer: string | null
  retryMode: 'initial' | 'follow-up' | null
}

const EMPTY_RECORD: PatientRecord = {
  treatmentLines: [],
}

function getNextQuestion(missingFields: string[], followUpCount: number) {
  if (missingFields.length === 0 || followUpCount >= MAX_FOLLOW_UP_ROUNDS) {
    return null
  }

  return buildFollowUpQuestion(missingFields)
}

function useExtractionState() {
  const [state, setState] = useState<ExtractionState>({
    currentQuestion: null,
    error: null,
    extractionInput: '',
    followUpAnswers: [],
    isExtracting: false,
    record: null,
    remainingMissing: [],
    retryAnswer: null,
    retryMode: null,
  })

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

      setState((current) => ({
        ...current,
        currentQuestion: getNextQuestion(missingFields, 0),
        followUpAnswers: [],
        isExtracting: false,
        record,
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

  function setExtractionInput(extractionInput: string) {
    setState((current) => ({ ...current, extractionInput }))
  }

  return {
    ...state,
    retryLastAction,
    runFollowUpExtraction,
    runInitialExtraction,
    setExtractionInput,
  }
}


function renderBasicInfo(record: PatientRecord) {
  return [
    ['Gender / 性别', record.basicInfo?.gender],
    ['Age / 年龄', record.basicInfo?.age?.toString()],
    ['Tumor Type / 肿瘤类型', record.basicInfo?.tumorType],
    ['Stage / 分期', record.basicInfo?.stage],
  ]
}

function renderTimelineSummary(record: PatientRecord) {
  const items: Array<{ date: string; tag: string; title: string; desc: string; active: boolean }> = []

  if (record.initialOnset) {
    items.push({
      active: true,
      date: record.initialOnset.triggerDate ?? '未提供',
      desc: record.initialOnset.treatment ?? '待补充初发治疗方案',
      tag: 'Initial Onset',
      title: '初发诊断区块',
    })
  }

  for (const line of record.treatmentLines) {
    items.push({
      active: false,
      date: `${line.startDate ?? '未提供'} → ${line.endDate ?? '至今'}`,
      desc: line.regimen ?? '待补充当前治疗方案',
      tag: `Line ${line.lineNumber}`,
      title: `治疗线 ${line.lineNumber}`,
    })
  }

  if (items.length === 0) {
    items.push({
      active: true,
      date: '待提取',
      desc: '提交患者描述后，这里会显示结构化结果。',
      tag: 'Waiting',
      title: '尚未生成结构化结果',
    })
  }

  return items
}

function DarkWorkspacePage({ isSigningOut, onSignOut, userLabel }: WorkspacePageProps) {
  const {
    currentQuestion,
    error,
    extractionInput,
    isExtracting,
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
  const summaryItems = useMemo(() => renderTimelineSummary(displayRecord), [displayRecord])

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

            <div className="mb-8 grid grid-cols-4 border-2 border-[#0A0A0A]">
              {renderBasicInfo(displayRecord).map(([label, value], index) => (
                <div key={label} className={`bg-[#F0F0F0] p-2 ${index < 3 ? 'border-r border-[#0A0A0A]' : ''}`}>
                  <label className="block font-['JetBrains_Mono'] text-[9px] font-bold">{label}</label>
                  <span className={`text-lg font-bold ${value ? '' : 'text-[#FF3D00]'}`}>{value ?? '待补充'}</span>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h2 className="mb-2 inline-block bg-[#0A0A0A] px-4 py-1 text-sm font-bold uppercase tracking-widest text-white">
                追问与治疗摘要 / EXTRACTION SUMMARY
              </h2>
              {summaryItems.map((item) => (
                <div className="mb-4 border-2 border-[#0A0A0A]" key={`${item.tag}-${item.date}-${item.title}`}>
                  <div className="flex items-center justify-between bg-[#0A0A0A] p-2 text-white">
                    <span className="text-xs font-bold tracking-tighter">{item.title}</span>
                    <span className="font-['JetBrains_Mono'] text-[10px]">{item.date}</span>
                  </div>
                  <div className="grid grid-cols-[160px_1fr]">
                    <div className="border-r border-[#0A0A0A] bg-[#F0F0F0] p-2 text-xs font-bold">{item.tag}</div>
                    <div className="p-2 text-sm">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

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
    isExtracting,
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
  const summaryItems = useMemo(() => renderTimelineSummary(displayRecord), [displayRecord])

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

              <div className="grid grid-cols-2 gap-6">
                <div className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[#111111] bg-[#e0e0db]/20 p-6 transition-colors hover:bg-[#e0e0db]/40">
                  <img alt="Upload placeholder" className="mb-2 h-20 w-20 object-cover" src={SCAN_PLACEHOLDER} />
                  <span className="font-['Inter'] text-xs font-bold uppercase tracking-widest">
                    图片及 PDF 输入
                  </span>
                  <span className="mt-1 font-['JetBrains_Mono'] text-[10px] opacity-50">
                    Drag & Drop Documents
                  </span>
                </div>
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
            <div className="grid grid-cols-12 gap-0 border-2 border-[#111111] bg-white">
              <div className="col-span-3 border-r-2 border-[#111111] bg-[#f4f4f2] p-6">
                <h3 className="mb-6 flex items-center gap-2 font-['Inter'] text-xs font-black uppercase tracking-[0.2em]">
                  <span className="material-symbols-outlined text-sm">person_search</span>
                  患者元数据
                </h3>
                <div className="space-y-6">
                  {renderBasicInfo(displayRecord).map(([label, value]) => (
                    <div key={label}>
                      <span className="block font-['JetBrains_Mono'] text-[10px] uppercase opacity-60">{label}</span>
                      <span className={`font-['Newsreader'] text-3xl font-bold ${value ? '' : 'text-[#ba1a1a]'}`}>
                        {value ?? '待补充'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-9 bg-white p-8">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="font-['Inter'] text-xs font-black uppercase tracking-[0.2em]">
                    治疗时间轴 / TREATMENT TIMELINE
                  </h3>
                  <div className="flex gap-2">
                    <span className="h-2 w-2 bg-[#111111]" />
                    <span className="h-2 w-2 bg-[#111111]/20" />
                    <span className="h-2 w-2 bg-[#111111]/20" />
                  </div>
                </div>

                <div className="relative space-y-12 border-l-2 border-[#111111]/10 pl-12">
                  {summaryItems.map((item, index) => (
                    <div className="relative" key={`${item.tag}-${item.date}-${item.title}`}>
                      <span className={`absolute -left-[54px] top-0 h-3 w-3 ${index === summaryItems.length - 1 ? 'border-2 border-[#111111] bg-[#F9F9F7]' : 'bg-[#111111]'} ${item.active ? '' : 'opacity-40'}`} />
                      <div className="flex items-start justify-between">
                        <span className={`px-2 py-1 font-['JetBrains_Mono'] text-xs font-bold ${item.active ? 'bg-[#111111] text-[#F9F9F7]' : 'border border-[#111111]'}`}>
                          {item.date}
                        </span>
                        <span className={`font-['Inter'] text-[10px] font-bold uppercase ${item.active ? 'text-[#CC0000]' : 'text-[#111111]/40'}`}>
                          {item.tag}
                        </span>
                      </div>
                      <h4 className="mt-2 font-['Newsreader'] text-xl font-bold">{item.title}</h4>
                      <p className="mt-1 text-sm text-[#111111]/70">{item.desc}</p>
                    </div>
                  ))}
                </div>

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
