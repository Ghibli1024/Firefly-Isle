/**
 * [INPUT]: 依赖 react 的 effect/state，依赖 react-router-dom 的 useLocation/useParams，依赖 @/components/app-shell 的 V3 壳层、@/components/system 的 DemoModeBanner、@/components/analytics 的统计界面、demo lab fixture、./demo-mode.logic 的可选公开分享码 Demo 数据源与 patient-record-storage 的按 id 病历读取。
 * [OUTPUT]: 对外提供 LabAnalyticsPage 组件，对应公开 /demo/analytics 与受保护 /analytics/:id、/analytics/demo，并在 Demo 模式显示提醒。
 * [POS]: routes 的指标管理统计 orchestration 层，负责按 Demo/真实路由 id 读取真实病历或可选 Supabase 公开 Demo 病历，并把 /analytics 收敛为只读指标展示；文件上传入口归 /app 输入区。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useState, type CSSProperties } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { ArchiveSideNav, ClinicalTopBar } from '@/components/app-shell'
import { demoLabAnalyticsRecord } from '@/components/analytics/demo-lab-analytics'
import { LabAnalyticsDashboard } from '@/components/analytics/lab-analytics-dashboard'
import { DemoModeBanner } from '@/components/system/demo-mode-banner'
import { MainShell } from '@/components/system/surfaces'
import { loadPatientRecordById } from '@/lib/patient-record-storage'
import { useTheme } from '@/lib/theme'
import { shellWideContentClass, sidebarOffsetClass, topBarOffsetClass } from '@/lib/theme/tokens'
import type { PatientRecord } from '@/types/patient'

import { loadDemoPatientRecord } from './demo-mode.logic'

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
  const location = useLocation()
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const publicDemoRoute = location.pathname.startsWith('/demo')
  const demoRoute = publicDemoRoute || id.trim() === 'demo'
  const [loadState, setLoadState] = useState<AnalyticsLoadState>(() => createInitialLoadState(id, demoRoute))

  useEffect(() => {
    if (demoRoute) {
      let active = true

      void loadDemoPatientRecord().then(({ record }) => {
        if (!active) {
          return
        }

        setLoadState({
          error: null,
          isLoading: false,
          record,
          recordId: 'demo',
        })
      })

      return () => {
        active = false
      }
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
    ? loadState.recordId === 'demo'
      ? loadState
      : createInitialLoadState(id, true)
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
  const analyticsHref = demoRoute ? (publicDemoRoute ? '/demo/analytics' : '/analytics/demo') : `/analytics/${id}`
  const recordHref = demoRoute ? (publicDemoRoute ? '/demo/record' : '/record/demo') : `/record/${id}`

  return (
    <div className={dark ? 'min-h-screen bg-[var(--ff-surface-base)] text-[var(--ff-text-primary)]' : 'ff-light-record-bg min-h-screen text-[var(--ff-text-primary)]'}>
      <ClinicalTopBar theme={theme} title="指标管理" withRail />
      <ArchiveSideNav
        analyticsHref={analyticsHref}
        dark={dark}
        isSigningOut={isSigningOut}
        onSignOut={onSignOut}
        recordHref={recordHref}
        userIsAnonymous={userIsAnonymous}
        userLabel={userLabel ?? (demoRoute ? 'DEMO_MODE' : undefined)}
      />
      <MainShell className={`${topBarOffsetClass} ${sidebarOffsetClass} min-h-screen px-4 pb-8 md:px-6 md:pb-10`} theme={theme}>
        <div className={`${shellWideContentClass} t-route-reveal t-stagger mt-5 md:mt-6`} style={{ '--t-order': 0 } as CSSProperties}>
          {demoRoute ? <DemoModeBanner /> : null}
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
