/**
 * [INPUT]: 依赖 react 的 effect/state，依赖 react-router-dom 的 useParams，依赖 @/components/app-shell 的 V3 壳层、@/components/analytics 的统计界面、demo lab fixture 与 patient-record-storage 的按 id 病历读取。
 * [OUTPUT]: 对外提供 LabAnalyticsPage 组件，对应 /analytics/:id 与 /analytics/demo。
 * [POS]: routes 的指标管理统计 orchestration 层，负责按路由 id 读取真实病历或 demo 病例，并把 /analytics 收敛为只读指标展示；文件上传入口归 /app 输入区。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useState, type CSSProperties } from 'react'
import { useParams } from 'react-router-dom'

import { ArchiveSideNav, ClinicalTopBar } from '@/components/app-shell'
import { demoLabAnalyticsRecord } from '@/components/analytics/demo-lab-analytics'
import { LabAnalyticsDashboard } from '@/components/analytics/lab-analytics-dashboard'
import { MainShell } from '@/components/system/surfaces'
import { loadPatientRecordById } from '@/lib/patient-record-storage'
import { useTheme } from '@/lib/theme'
import { shellWideContentClass, sidebarOffsetClass, topBarOffsetClass } from '@/lib/theme/tokens'
import type { PatientRecord } from '@/types/patient'

type LabAnalyticsPageProps = {
  isSigningOut?: boolean
  onSignOut?: () => void
  userIsAnonymous?: boolean
  userLabel?: string
}

type AnalyticsLoadState = {
  error: string | null
  isLoading: boolean
  record: PatientRecord | null
  recordId: string | null
}

function createInitialLoadState(id: string, demoRoute: boolean): AnalyticsLoadState {
  return {
    error: null,
    isLoading: !demoRoute,
    record: demoRoute ? demoLabAnalyticsRecord : null,
    recordId: demoRoute ? 'demo' : id,
  }
}

export function LabAnalyticsPage({ isSigningOut, onSignOut, userIsAnonymous, userLabel }: LabAnalyticsPageProps) {
  const { id = 'demo' } = useParams()
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const demoRoute = id.trim() === 'demo'
  const [loadState, setLoadState] = useState<AnalyticsLoadState>(() => createInitialLoadState(id, demoRoute))

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

        setLoadState({
          error: record ? null : '没有找到这份病历的指标数据。',
          isLoading: false,
          record,
          recordId: id,
        })
      })
      .catch(() => {
        if (!active) {
          return
        }

        setLoadState({
          error: '无法读取这份病历的指标数据，请稍后重试。',
          isLoading: false,
          record: null,
          recordId: id,
        })
      })

    return () => {
      active = false
    }
  }, [demoRoute, id])

  const activeLoadState = demoRoute
    ? createInitialLoadState(id, true)
    : loadState.recordId === id
      ? loadState
      : {
          error: null,
          isLoading: true,
          record: null,
          recordId: id,
        }
  const record = activeLoadState.record
  const labResults = record?.labResults ?? []
  const analyticsHref = demoRoute ? '/analytics/demo' : `/analytics/${id}`

  return (
    <div className={dark ? 'min-h-screen bg-[var(--ff-surface-base)] text-[var(--ff-text-primary)]' : 'ff-light-record-bg min-h-screen text-[var(--ff-text-primary)]'}>
      <ClinicalTopBar theme={theme} title="指标管理" withRail />
      <ArchiveSideNav
        analyticsHref={analyticsHref}
        dark={dark}
        isSigningOut={isSigningOut}
        onSignOut={onSignOut}
        recordHref={demoRoute ? undefined : `/record/${id}`}
        userIsAnonymous={userIsAnonymous}
        userLabel={userLabel}
      />
      <MainShell className={`${topBarOffsetClass} ${sidebarOffsetClass} min-h-screen px-4 pb-8 md:px-6 md:pb-10`} theme={theme}>
        <div className={`${shellWideContentClass} t-route-reveal t-stagger mt-5 md:mt-6`} style={{ '--t-order': 0 } as CSSProperties}>
          <LabAnalyticsDashboard
            isDemo={demoRoute}
            isLoading={activeLoadState.isLoading}
            labResults={labResults}
            loadError={activeLoadState.error}
            record={record}
            theme={theme}
          />
        </div>
      </MainShell>
    </div>
  )
}
