import { describe, expect, it } from 'vitest'

import {
  PRIVACY_PAGE_HREF,
  PRIVACY_POLICY_ITEMS,
  PRIVACY_POLICY_SUMMARY,
} from '@/lib/privacy'
import { getPatientArchetype, type PatientRecord } from '@/types/patient'

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
