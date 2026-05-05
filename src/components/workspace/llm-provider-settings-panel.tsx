/**
 * [INPUT]: 依赖 react 的本地表单状态、@/lib/locale 的语言状态、@/lib/llm/provider-settings 的设置 API 与 system ActionSurface。
 * [OUTPUT]: 对外提供 LlmProviderSettingsPanel 组件，渲染可收起的系统内置 DeepSeekV4、API 自提供与自定义设置入口。
 * [POS]: components/workspace 的 provider 设置区块，被 ExtractionComposer 嵌入，负责紧凑入口、展开表单与保存动作但不参与 chat 请求。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useState } from 'react'

import { ActionSurface } from '@/components/system/surfaces'
import { useLocale } from '@/lib/locale'
import {
  getLlmProviderSetting,
  resetLlmProviderSetting,
  saveLlmProviderSetting,
  type LlmProviderId,
} from '@/lib/llm/provider-settings'

type LlmProviderSettingsPanelProps = {
  disabled?: boolean
  theme: 'dark' | 'light'
}

const presetProviders: Array<{ label: string; value: Exclude<LlmProviderId, 'custom_openai'> }> = [
  { label: 'Gemini', value: 'gemini' },
  { label: 'Claude', value: 'claude' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'GLM', value: 'glm' },
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'Kimi', value: 'kimi' },
]

export function LlmProviderSettingsPanel({ disabled = false, theme }: LlmProviderSettingsPanelProps) {
  const { locale } = useLocale()
  const [expanded, setExpanded] = useState(false)
  const [mode, setMode] = useState<'preset' | 'custom' | 'system'>('system')
  const [provider, setProvider] = useState<Exclude<LlmProviderId, 'custom_openai'>>('openai')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [model, setModel] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true

    void getLlmProviderSetting()
      .then((setting) => {
        if (!active || setting.mode === 'system') return

        if (setting.provider === 'custom_openai') {
          setMode('custom')
          setBaseUrl(setting.baseUrl ?? '')
          setModel(setting.model ?? '')
          return
        }

        setMode('preset')
        setProvider(setting.provider)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [])

  async function saveSetting() {
    setSaving(true)
    setMessage(null)

    try {
      if (mode === 'system') {
        await resetLlmProviderSetting()
      } else if (mode === 'custom') {
        await saveLlmProviderSetting({
          apiKey,
          baseUrl,
          model,
          provider: 'custom_openai',
        })
      } else {
        await saveLlmProviderSetting({
          apiKey,
          provider,
        })
      }

      setApiKey('')
      setMessage(locale === 'zh' ? '模型设置已保存' : 'Provider settings saved')
    } catch {
      setMessage(locale === 'zh' ? '模型设置保存失败，请检查 API key 或自定义地址' : 'Could not save provider settings')
    } finally {
      setSaving(false)
    }
  }

  const copy = locale === 'zh'
    ? {
        apiKey: 'API Key',
        baseUrl: 'Base URL',
        collapse: '收起模型设置',
        custom: '自定义',
        disclosure: '医疗记录内容会发送到你选择的第三方模型服务商。',
        expand: '展开模型设置',
        model: '模型名',
        preset: 'API 自提供',
        provider: 'Provider',
        save: saving ? '保存中...' : '保存模型设置',
        system: '系统内置（DeepSeekV4）',
        title: '模型设置',
      }
    : {
        apiKey: 'API Key',
        baseUrl: 'Base URL',
        collapse: 'Collapse model settings',
        custom: 'Custom',
        disclosure: 'Medical record content is sent to the third-party model provider you choose.',
        expand: 'Expand model settings',
        model: 'Model',
        preset: 'Bring your API',
        provider: 'Provider',
        save: saving ? 'Saving...' : 'Save Provider Settings',
        system: 'Built-in system (DeepSeek V4)',
        title: 'Model Settings',
      }
  const providerLabel = presetProviders.find((option) => option.value === provider)?.label ?? provider
  const selectedModeLabel = mode === 'system' ? copy.system : mode === 'custom' ? copy.custom : `${copy.preset} · ${providerLabel}`
  const toggleLabel = expanded ? copy.collapse : copy.expand

  return (
    <div data-llm-provider-settings="true">
      <ActionSurface className="mt-4 px-3 py-3 sm:px-4" theme={theme} tone="panel">
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="material-symbols-outlined text-xl text-[var(--ff-text-primary)]">model_training</span>
              <div className="min-w-0">
                <h3 className="font-[var(--ff-font-display)] text-base font-bold tracking-normal text-[var(--ff-text-primary)] sm:text-lg">{copy.title}</h3>
                <p className="truncate text-xs font-semibold text-[var(--ff-text-secondary)] sm:text-sm">{selectedModeLabel}</p>
              </div>
            </div>
            <button
              aria-controls="llm-provider-settings-body"
              aria-expanded={expanded}
              aria-label={toggleLabel}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] text-[var(--ff-text-secondary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)]"
              data-llm-provider-settings-toggle="true"
              onClick={() => setExpanded((value) => !value)}
              title={toggleLabel}
              type="button"
            >
              <span className="material-symbols-outlined text-xl">{expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
            </button>
          </div>

          <div aria-hidden={!expanded} className="mt-4 grid gap-4" hidden={!expanded} id="llm-provider-settings-body">
            <div className="grid gap-2 text-sm text-[var(--ff-text-secondary)] md:grid-cols-3">
              <label className="flex min-h-11 items-center gap-2 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] px-3">
                <input checked={mode === 'system'} disabled={disabled || saving} name="llm-provider-mode" onChange={() => setMode('system')} type="radio" />
                {copy.system}
              </label>
              <label className="flex min-h-11 items-center gap-2 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] px-3">
                <input checked={mode === 'preset'} disabled={disabled || saving} name="llm-provider-mode" onChange={() => setMode('preset')} type="radio" />
                {copy.preset}
              </label>
              <label className="flex min-h-11 items-center gap-2 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] px-3">
                <input checked={mode === 'custom'} disabled={disabled || saving} name="llm-provider-mode" onChange={() => setMode('custom')} type="radio" />
                {copy.custom}
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <label className="grid gap-1 text-xs font-semibold text-[var(--ff-text-muted)]">
                {copy.provider}
                <select
                  className="h-11 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-3 text-sm text-[var(--ff-text-primary)]"
                  disabled={disabled || saving || mode !== 'preset'}
                  name="llm-provider-provider"
                  onChange={(event) => setProvider(event.target.value as Exclude<LlmProviderId, 'custom_openai'>)}
                  value={provider}
                >
                  {presetProviders.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-semibold text-[var(--ff-text-muted)]">
                {copy.apiKey}
                <input
                  autoComplete="off"
                  className="h-11 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-3 text-sm text-[var(--ff-text-primary)]"
                  disabled={disabled || saving || mode === 'system'}
                  name="llm-provider-api-key"
                  onChange={(event) => setApiKey(event.target.value)}
                  type="password"
                  value={apiKey}
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-[var(--ff-text-muted)]">
                {copy.baseUrl}
                <input
                  className="h-11 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-3 text-sm text-[var(--ff-text-primary)]"
                  disabled={disabled || saving || mode !== 'custom'}
                  name="llm-provider-base-url"
                  onChange={(event) => setBaseUrl(event.target.value)}
                  placeholder="https://api.example.com/v1"
                  type="url"
                  value={baseUrl}
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-[var(--ff-text-muted)]">
                {copy.model}
                <input
                  className="h-11 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-3 text-sm text-[var(--ff-text-primary)]"
                  disabled={disabled || saving || mode !== 'custom'}
                  name="llm-provider-model"
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="model-name"
                  value={model}
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold leading-5 text-[var(--ff-accent-warning)]">{copy.disclosure}</p>
              <button
                className="inline-flex h-10 items-center justify-center rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] px-4 text-sm font-semibold text-[var(--ff-text-secondary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={disabled || saving}
                onClick={() => void saveSetting()}
                type="button"
              >
                {copy.save}
              </button>
            </div>

            {message ? <div className="text-sm font-semibold text-[var(--ff-text-secondary)]" role="status">{message}</div> : null}
          </div>
        </div>
      </ActionSurface>
    </div>
  )
}
