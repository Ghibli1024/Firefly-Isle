/**
 * [INPUT]: 依赖 vitest 与 llm-provider-settings-panel 的字段可见性纯函数。
 * [OUTPUT]: 对外提供模型设置三种模式的第二行字段显隐与顺序回归测试。
 * [POS]: components/workspace 的 provider 设置 UI 合同测试，约束系统内置、API 自提供与自定义模式的字段边界。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vitest'

import { getLlmProviderVisibleFields } from './llm-provider-settings-panel'

describe('llm provider settings panel field visibility', () => {
  it('hides the settings field row for the built-in system provider', () => {
    expect(getLlmProviderVisibleFields('system')).toEqual([])
  })

  it('shows provider, API key, and model for API self-provided mode without base URL', () => {
    expect(getLlmProviderVisibleFields('preset')).toEqual(['provider', 'apiKey', 'model'])
  })

  it('shows base URL before API key and model for custom mode without provider', () => {
    expect(getLlmProviderVisibleFields('custom')).toEqual(['baseUrl', 'apiKey', 'model'])
  })
})
