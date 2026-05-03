/**
 * [INPUT]: 依赖 react 的 CSSProperties/useMemo/useState，依赖 BrandLockup 及其候选元数据，依赖 themeTokens 固定预览页夜间底色。
 * [OUTPUT]: 对外提供 BrandLockupPreviewPage 路由组件，渲染 /brand-lockup-preview 的 6 组侧栏品牌锁定组合设计看板。
 * [POS]: routes 的设计预览页，只服务品牌区候选选择，不接入认证工作流、不替换 /app 或 /record/:id 的生产侧栏。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useMemo, useState, type CSSProperties } from 'react'

import {
  BRAND_LOCKUP_VARIANT_META,
  BrandLockup,
  brandLockupVariants,
  type BrandLockupVariant,
} from '@/components/system/brand-lockup'
import { themeTokens } from '@/lib/theme/tokens'
import { cn } from '@/lib/utils'

type PreviewTone = 'dark' | 'light'

const toneLabels = {
  dark: 'Dark sidebar',
  light: 'Light sidebar',
} satisfies Record<PreviewTone, string>

const previewTokens = themeTokens.dark

const previewPageStyle = {
  '--ff-accent-primary': previewTokens.accent.primary,
  '--ff-accent-strong': previewTokens.accent.strong,
  '--ff-border-default': previewTokens.border.default,
  '--ff-surface-base': previewTokens.surface.base,
  '--ff-surface-panel': previewTokens.surface.panel,
  '--ff-surface-inset': previewTokens.surface.inset,
  '--ff-text-muted': previewTokens.text.muted,
  '--ff-text-primary': previewTokens.text.primary,
  '--ff-text-secondary': previewTokens.text.secondary,
} as CSSProperties

function PreviewSky() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute left-[7%] top-[7%] h-[3px] w-[3px] rounded-[var(--ff-radius-full)] bg-[var(--ff-accent-primary)]" />
      <span className="absolute left-[18%] top-[18%] h-[2px] w-[2px] rounded-[var(--ff-radius-full)] bg-[var(--ff-text-muted)]/40" />
      <span className="absolute left-[42%] top-[8%] h-[2px] w-[2px] rounded-[var(--ff-radius-full)] bg-[var(--ff-text-muted)]/35" />
      <span className="absolute left-[68%] top-[14%] h-[3px] w-[3px] rounded-[var(--ff-radius-full)] bg-[var(--ff-accent-primary)]" />
      <span className="absolute left-[87%] top-[10%] h-[2px] w-[2px] rounded-[var(--ff-radius-full)] bg-[var(--ff-text-muted)]/45" />
      <span className="absolute left-[92%] top-[34%] h-[3px] w-[3px] rounded-[var(--ff-radius-full)] bg-[var(--ff-text-muted)]/30" />
    </div>
  )
}

function VariantCard({
  selected,
  variant,
  onSelect,
}: {
  onSelect: (variant: BrandLockupVariant) => void
  selected: boolean
  variant: BrandLockupVariant
}) {
  const meta = BRAND_LOCKUP_VARIANT_META[variant]

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-[var(--ff-radius-md)] border bg-[var(--ff-surface-panel)] transition-[border-color,box-shadow,transform] duration-200',
        selected
          ? 'border-[var(--ff-accent-primary)]'
          : 'border-[var(--ff-border-default)] hover:border-[var(--ff-accent-primary)]',
      )}
      data-brand-lockup-variant={variant}
    >
      <button className="block w-full text-left" onClick={() => onSelect(variant)} type="button">
        <div className="flex min-h-[118px] items-start justify-between gap-4 border-b border-[var(--ff-border-default)] px-5 py-4">
          <div className="min-w-0">
            <div className="font-[var(--ff-font-mono)] text-[10px] uppercase tracking-[0.22em] text-[var(--ff-accent-primary)]">
              {meta.eyebrow}
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-normal text-[var(--ff-text-primary)]">{meta.name}</h2>
            <p className="mt-2 max-w-[33ch] text-sm leading-6 text-[var(--ff-text-secondary)]">{meta.note}</p>
          </div>
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--ff-radius-full)] border font-[var(--ff-font-mono)] text-[11px]',
              selected
                ? 'border-[var(--ff-accent-primary)] bg-[var(--ff-accent-primary)] text-white'
                : 'border-[var(--ff-border-default)] text-[var(--ff-text-muted)]',
            )}
          >
            {selected ? 'SET' : 'TRY'}
          </span>
        </div>
      </button>

      <div className="grid gap-px bg-[var(--ff-border-default)] md:grid-cols-2">
        {(['light', 'dark'] as const).map((theme) => (
          <div className="bg-[var(--ff-surface-panel)] p-4" key={theme}>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-[var(--ff-font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--ff-text-muted)]">
                {toneLabels[theme]}
              </span>
              <span className="text-xs text-[var(--ff-text-muted)]">148 / 72</span>
            </div>
            <div className="grid gap-3">
              <BrandLockup mode="expanded" theme={theme} variant={variant} />
              <BrandLockup mode="icon" theme={theme} variant={variant} />
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

function SelectedPanel({ variant }: { variant: BrandLockupVariant }) {
  const meta = BRAND_LOCKUP_VARIANT_META[variant]

  return (
    <aside className="sticky top-6 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-5">
      <div className="font-[var(--ff-font-mono)] text-[10px] uppercase tracking-[0.22em] text-[var(--ff-accent-primary)]">
        Current pick
      </div>
      <h2 className="mt-2 text-3xl font-black tracking-normal">{meta.title}</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--ff-text-secondary)]">{meta.note}</p>

      <div className="mt-6 grid gap-4">
        <div>
          <div className="mb-2 text-xs font-semibold text-[var(--ff-text-muted)]">Light / full-label</div>
          <BrandLockup mode="expanded" theme="light" variant={variant} />
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold text-[var(--ff-text-muted)]">Dark / full-label</div>
          <BrandLockup mode="expanded" theme="dark" variant={variant} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-2 text-xs font-semibold text-[var(--ff-text-muted)]">Light / icon</div>
            <BrandLockup mode="icon" theme="light" variant={variant} />
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold text-[var(--ff-text-muted)]">Dark / icon</div>
            <BrandLockup mode="icon" theme="dark" variant={variant} />
          </div>
        </div>
      </div>
    </aside>
  )
}

export function BrandLockupPreviewPage() {
  const [selectedVariant, setSelectedVariant] = useState<BrandLockupVariant>('data-wing')
  const selectedIndex = useMemo(() => brandLockupVariants.indexOf(selectedVariant) + 1, [selectedVariant])

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[var(--ff-surface-base)] px-5 py-6 text-[var(--ff-text-primary)] md:px-8"
      style={previewPageStyle}
    >
      <PreviewSky />
      <div className="relative z-10 mx-auto grid max-w-[1760px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0">
          <div className="mb-6 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-5 md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="font-[var(--ff-font-mono)] text-[10px] uppercase tracking-[0.28em] text-[var(--ff-accent-primary)]">
                  Brand lockup preview
                </div>
                <h1 className="mt-3 text-4xl font-black tracking-normal md:text-5xl">侧栏品牌标识区</h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--ff-text-secondary)]">
                  这里比较的是 mark + “一页萤屿”字标在侧栏顶部的组合。每个候选都同时显示 full-label、icon-only、light、dark 四种状态，方便直接挑一个进入真实侧栏。
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] px-4 py-3">
                <span className="font-[var(--ff-font-mono)] text-[10px] uppercase tracking-[0.22em] text-[var(--ff-text-muted)]">Selected</span>
                <span className="text-2xl font-black text-[var(--ff-accent-primary)]">{String(selectedIndex).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-5 2xl:grid-cols-2">
            {brandLockupVariants.map((variant) => (
              <VariantCard
                key={variant}
                onSelect={setSelectedVariant}
                selected={variant === selectedVariant}
                variant={variant}
              />
            ))}
          </div>
        </section>

        <SelectedPanel variant={selectedVariant} />
      </div>
    </main>
  )
}
