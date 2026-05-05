/**
 * [INPUT]: 依赖 @/components/app-shell 的 V3 可变侧栏与顶部状态条，依赖 @/components/system/surfaces 的 MainShell，依赖 ./record-page.view 的档案/Gantt 内容组合，点击正式导出时动态加载 @/lib/export-record，依赖 react-router-dom 的 useParams 与 transitions-dev.css 的 route/stagger 动效合同。
 * [OUTPUT]: 对外提供 RecordPage 组件，对应 /record/:id，并挂载详情页主画布入场动效。
 * [POS]: routes 的档案详情 orchestration 层，只负责路由参数、加载状态、视图状态、导出状态、动效挂载与壳层组合；展示和数据映射下沉到 record-page.view、components/record 与 record-page.logic。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useParams } from 'react-router-dom'

import { ArchiveSideNav, ClinicalTopBar } from '@/components/app-shell'
import { labels } from '@/components/record/record-copy'
import type { ExportFormat } from '@/components/record/types'
import { MainShell } from '@/components/system/surfaces'
import { useLocale } from '@/lib/locale'
import { useTheme } from '@/lib/theme'
import { shellWideContentClass, sidebarOffsetClass, topBarOffsetClass } from '@/lib/theme/tokens'

import { getActiveRecordLoadState, loadPatientRecordById, type RecordLoadState } from './record-page.logic'
import { RecordPageContent, type RecordExportState, type RecordViewMode } from './record-page.view'

type RecordPageProps = {
  isSigningOut?: boolean
  onSignOut?: () => void
  userIsAnonymous?: boolean
  userLabel?: string
}

export function RecordPage({ isSigningOut, onSignOut, userIsAnonymous, userLabel }: RecordPageProps) {
  const { id = 'demo' } = useParams()
  const { locale } = useLocale()
  const { theme } = useTheme()
  const recordRef = useRef<HTMLDivElement>(null)
  const demoRoute = id.trim() === 'demo'
  const [recordLoadState, setRecordLoadState] = useState<RecordLoadState>(() => ({
    error: null,
    isLoading: !demoRoute,
    record: null,
    recordId: demoRoute ? null : id,
  }))
  const [exportState, setExportState] = useState<RecordExportState>({
    error: null,
    format: null,
    isExporting: false,
  })
  const [recordViewMode, setRecordViewMode] = useState<RecordViewMode>('dossier')
  const dark = theme === 'dark'

  useEffect(() => {
    if (demoRoute) {
      return undefined
    }

    let active = true

    void loadPatientRecordById(id)
      .then((record) => {
        if (!active) {
          return
        }

        setRecordLoadState({
          error: null,
          isLoading: false,
          record,
          recordId: id,
        })
      })
      .catch(() => {
        if (!active) {
          return
        }

        setRecordLoadState({
          error: labels[locale].loadRecordError,
          isLoading: false,
          record: null,
          recordId: id,
        })
      })

    return () => {
      active = false
    }
  }, [demoRoute, id, locale])

  const activeRecordLoadState = getActiveRecordLoadState({ demoRoute, id, recordLoadState })

  async function handleExport(format: ExportFormat) {
    if (!recordRef.current || demoRoute || !activeRecordLoadState.record || exportState.isExporting) {
      return
    }

    setExportState({
      error: null,
      format,
      isExporting: true,
    })

    try {
      const { exportElementAsPdf, exportElementAsPng } = await import('@/lib/export-record')

      if (format === 'pdf') {
        await exportElementAsPdf(recordRef.current)
      } else {
        await exportElementAsPng(recordRef.current)
      }

      setExportState({
        error: null,
        format: null,
        isExporting: false,
      })
    } catch (error) {
      console.error(error)
      setExportState({
        error: labels[locale].exportError,
        format: null,
        isExporting: false,
      })
    }
  }

  return (
    <div className={dark ? 'min-h-screen bg-[var(--ff-surface-base)] text-[var(--ff-text-primary)]' : 'ff-light-record-bg min-h-screen text-[var(--ff-text-primary)]'}>
      <ClinicalTopBar theme={theme} title={locale === 'zh' ? '病历详情' : 'Record Detail'} withRail />
      <ArchiveSideNav
        dark={dark}
        isSigningOut={isSigningOut}
        onSignOut={onSignOut}
        recordHref={demoRoute ? undefined : `/record/${id}`}
        userIsAnonymous={userIsAnonymous}
        userLabel={userLabel ?? id}
      />
      <MainShell className={`${topBarOffsetClass} ${sidebarOffsetClass} min-h-screen px-4 pb-4 md:px-6 md:pb-6`} theme={theme}>
        <div
          className={`${shellWideContentClass} t-route-reveal t-stagger mt-5 md:mt-6`}
          data-testid="record-responsive-canvas"
          style={{ '--t-order': 0 } as CSSProperties}
        >
          <RecordPageContent
            activeRecordLoadState={activeRecordLoadState}
            demoRoute={demoRoute}
            exportState={exportState}
            locale={locale}
            onExport={(format) => void handleExport(format)}
            onViewModeChange={setRecordViewMode}
            recordRef={recordRef}
            viewMode={recordViewMode}
          />
        </div>
      </MainShell>
    </div>
  )
}
