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
})
