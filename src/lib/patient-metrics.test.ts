/**
 * [INPUT]: 依赖 patient-metrics 的身高、体重与 BMI 纯格式化工具。
 * [OUTPUT]: 对外提供患者体格指标显示合同回归测试。
 * [POS]: lib 的患者指标测试，约束工作台和病历页共享同一 BMI 计算与缺失值格式。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vitest'

import { formatBmi, formatHeight, formatWeight } from './patient-metrics'

describe('patient metrics', () => {
  it('formats height, weight and one-decimal BMI when both inputs are usable', () => {
    expect(formatHeight(168)).toBe('168 cm')
    expect(formatWeight(62)).toBe('62 kg')
    expect(formatBmi(168, 62)).toBe('22.0')
  })

  it('keeps missing or invalid BMI as a neutral placeholder', () => {
    expect(formatHeight(undefined)).toBe('--')
    expect(formatWeight(undefined)).toBe('--')
    expect(formatBmi(undefined, 62)).toBe('--')
    expect(formatBmi(0, 62)).toBe('--')
  })
})
