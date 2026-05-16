/**
 * [INPUT]: 依赖 react/useEffect/useRef/useState、react-router-dom 的 useParams、RecordDossier 只读展示、record-sharing 的授权码加载器、locale/theme 与 system surface。
 * [OUTPUT]: 对外提供 SharedRecordPage 组件，对应 /share/:code，渲染单份 PatientRecord 只读分享与过期/撤销/不可用反馈。
 * [POS]: routes 的公开只读分享页，只消费授权码换回的单份记录，不挂载编辑、保存、导出或 AI 分析动作。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { ClinicalTopBar } from '@/components/app-shell'
import { RecordDossier } from '@/components/record/record-dossier'
import { MainShell } from '@/components/system/surfaces'
import { useLocale } from '@/lib/locale'
import { getOnlineRequiredMessage, isOnlineRequiredError } from '@/lib/network-status'
import { loadSharedPatientRecordByCode, type SharedRecordStatus } from '@/lib/record-sharing'
import { useTheme } from '@/lib/theme'
import { shellWideContentClass, topBarOffsetClass } from '@/lib/theme/tokens'
import type { PatientRecord } from '@/types/patient'

type SharedRecordState = {
  code: string
  error: string | null
  isLoading: boolean
  record: PatientRecord | null
  status: SharedRecordStatus | null
}

function getStatusCopy(locale: 'zh' | 'en', status: SharedRecordStatus | null, error: string | null) {
  if (error) {
    return error
  }

  const copy = locale === 'zh'
    ? {
        expired: '分享已过期，请联系记录所有者重新生成。',
        revoked: '分享已撤销，请联系记录所有者确认。',
        unavailable: '分享不可用，授权码可能错误或记录不存在。',
      }
    : {
        expired: 'This share has expired. Ask the record owner to create a new link.',
        revoked: 'This share has been revoked. Ask the record owner to confirm access.',
        unavailable: 'This share is unavailable. The code may be invalid or the record may not exist.',
      }

  if (status === 'expired') {
    return copy.expired
  }

  if (status === 'revoked') {
    return copy.revoked
  }

  return copy.unavailable
}

function SharedRecordMessage({
  error,
  isLoading,
  locale,
  status,
}: {
  error: string | null
  isLoading: boolean
  locale: 'zh' | 'en'
  status: SharedRecordStatus | null
}) {
  const title = locale === 'zh' ? '只读病历分享' : 'Read-only record share'
  const loading = locale === 'zh' ? '正在验证授权码...' : 'Verifying share code...'
  const message = isLoading ? loading : getStatusCopy(locale, status, error)

  return (
    <section className="rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-8">
      <div className="font-[var(--ff-font-mono)] text-xs uppercase tracking-[0.3em] text-[var(--ff-text-muted)]">SHARE_ACCESS</div>
      <h1 className="mt-3 text-4xl font-black tracking-normal">{title}</h1>
      <p className="mt-5 text-base font-semibold leading-7 text-[var(--ff-text-secondary)]" role={isLoading ? 'status' : 'alert'}>
        {message}
      </p>
    </section>
  )
}

export function SharedRecordPage() {
  const { code = '' } = useParams()
  const { locale } = useLocale()
  const { theme } = useTheme()
  const recordRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<SharedRecordState>({
    code,
    error: null,
    isLoading: true,
    record: null,
    status: null,
  })

  useEffect(() => {
    let active = true

    void loadSharedPatientRecordByCode(code)
      .then((result) => {
        if (!active) {
          return
        }

        setState({
          code,
          error: null,
          isLoading: false,
          record: result.record,
          status: result.status,
        })
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }

        setState({
          code,
          error: isOnlineRequiredError(error) ? getOnlineRequiredMessage(locale) : error instanceof Error ? error.message : null,
          isLoading: false,
          record: null,
          status: 'unavailable',
        })
      })

    return () => {
      active = false
    }
  }, [code, locale])

  const dark = theme === 'dark'
  const isStale = state.code !== code
  const visibleRecord = isStale ? null : state.record
  const visibleStatus = isStale ? null : state.status

  return (
    <div className={dark ? 'min-h-screen bg-[var(--ff-surface-base)] text-[var(--ff-text-primary)]' : 'ff-light-record-bg min-h-screen text-[var(--ff-text-primary)]'}>
      <ClinicalTopBar theme={theme} title={locale === 'zh' ? '只读分享' : 'Read-only Share'} />
      <MainShell className={`${topBarOffsetClass} min-h-screen px-4 pb-4 md:px-6 md:pb-6`} theme={theme}>
        <div className={`${shellWideContentClass} t-route-reveal t-stagger mt-5 md:mt-6`}>
          {visibleRecord ? (
            <RecordDossier
              clinicalAnalysisState={{ error: null, isLoading: false, result: null }}
              exportError={null}
              exportFormat={null}
              isEditable={false}
              isExportDisabled
              isExporting={false}
              locale={locale}
              onClinicalAnalyze={undefined}
              onCommitField={undefined}
              onCommitRange={undefined}
              onExport={() => undefined}
              record={visibleRecord}
              recordRef={recordRef}
            />
          ) : (
            <SharedRecordMessage error={isStale ? null : state.error} isLoading={isStale || state.isLoading} locale={locale} status={visibleStatus} />
          )}
        </div>
      </MainShell>
    </div>
  )
}
