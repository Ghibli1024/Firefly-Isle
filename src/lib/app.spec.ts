/**
 * [INPUT]: 依赖 node:fs 的源码合同检查，依赖隐私文案真相源与 PatientRecord 类型工具。
 * [OUTPUT]: 对外提供隐私内容、患者类型判定、认证路由与背景音 Provider 挂载位置的回归测试。
 * [POS]: lib 的应用级合同测试，约束 App 装配层不丢失隐私、路由守卫、OAuth 错误与全局背景音生命周期边界。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  PRIVACY_PAGE_HREF,
  PRIVACY_POLICY_ITEMS,
  PRIVACY_POLICY_SUMMARY,
} from '@/lib/privacy'
import { getPatientArchetype, type PatientRecord } from '@/types/patient'

function readAppSource() {
  return readFileSync(new URL('../App.tsx', import.meta.url), 'utf8')
}

describe('privacy content', () => {
  it('exposes a stable privacy route and shared policy content', () => {
    expect(PRIVACY_PAGE_HREF).toBe('/privacy')
    expect(PRIVACY_POLICY_SUMMARY.length).toBeGreaterThan(0)
    expect(PRIVACY_POLICY_ITEMS).toHaveLength(3)
  })
})

describe('patient archetype detection', () => {
  it('detects the three MVP archetypes', () => {
    const nonAdvanced: PatientRecord = {
      initialOnset: { triggerDate: '2022-03' },
      treatmentLines: [],
    }
    const deNovoAdvanced: PatientRecord = {
      treatmentLines: [{ lineNumber: 1, regimen: '培美曲塞联合卡铂' }],
    }
    const relapsedAdvanced: PatientRecord = {
      initialOnset: { triggerDate: '2022-03' },
      treatmentLines: [{ lineNumber: 1, regimen: '培美曲塞联合卡铂' }],
    }

    expect(getPatientArchetype(nonAdvanced)).toBe('non-advanced')
    expect(getPatientArchetype(deNovoAdvanced)).toBe('de-novo-advanced')
    expect(getPatientArchetype(relapsedAdvanced)).toBe('relapsed-advanced')
  })
})

describe('auth route guard contract', () => {
  it('keeps /login public but redirects authenticated users to /app', () => {
    const source = readAppSource()

    expect(source).toContain('path="/login"')
    expect(source).toContain('isAuthenticated ? <Navigate replace to="/app" /> : <LoginPage authError={loginError} />')
  })

  it('keeps /app protected and sends anonymous users back to /login', () => {
    const source = readAppSource()

    expect(source).toContain('path="/app"')
    expect(source).toContain('<Navigate replace to="/login" />')
  })

  it('keeps OAuth callback on a public route before the /app guard runs', () => {
    const source = readAppSource()

    expect(source).toContain('path="/auth/callback"')
    expect(source).toContain('element={<AuthCallbackPage />}')
  })

  it('surfaces root-level OAuth provider errors instead of discarding them during redirect', () => {
    const source = readAppSource()

    expect(source).toContain('const oauthRedirectError = getOAuthCallbackErrorMessage(location.search)')
    expect(source).toContain('<LoginPage authError={oauthRedirectError} />')
  })

  it('keeps background audio above route changes so navigation does not reset playback state', () => {
    const source = readAppSource()

    expect(source).toContain('BackgroundAudioProvider')
    expect(source).toContain('<BackgroundAudioProvider>{children}</BackgroundAudioProvider>')
    expect(source.indexOf('<BackgroundAudioProvider>')).toBeLessThan(source.indexOf('<AppContent />'))
  })
})
