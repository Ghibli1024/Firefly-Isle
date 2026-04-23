/**
 * [INPUT]: 依赖 @/components/system/surfaces 的 SectionSurface，依赖 @/components/app-shell 的头像占位图与外部传入的总览元信息。
 * [OUTPUT]: 对外提供 RecordSummaryHeader 组件，统一 record 页面病历总览头部区块。
 * [POS]: components/record 的总览头部，被 record-page 组合，用于让 route 只负责主题分发与章节编排。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { AVATAR_PLACEHOLDER } from '@/components/app-shell'
import { SectionSurface } from '@/components/system/surfaces'
import { getCopy, copy } from '@/lib/copy'
import { useLocale, type Locale } from '@/lib/locale'

type Metric = {
  accent?: boolean
  label: string
  unit?: string
  value: string
}

type MetaField = {
  label: string
  value: string
}

type RecordSummaryHeaderProps = {
  meta: MetaField[]
  metrics: Metric[]
  recordId: string
  theme: 'dark' | 'light'
}

const summaryCopy: Record<Locale, { archiveNode: string; archiveTitle: string; patientName: string; patientSummary: string }> = {
  en: {
    archiveNode: 'Archive Node:',
    archiveTitle: 'Clinical Record Archive',
    patientName: 'Mr. Chen',
    patientSummary: 'MALE / 64 YEARS',
  },
  zh: {
    archiveNode: '档案节点：',
    archiveTitle: '临床病史档案',
    patientName: '陈先生',
    patientSummary: '男性 / 64 岁',
  },
}

export function RecordSummaryHeader({ meta, metrics, recordId, theme }: RecordSummaryHeaderProps) {
  const { locale } = useLocale()
  const content = summaryCopy[locale]

  if (theme === 'dark') {
    return (
      <header className="ff-dark-marker-line mb-12">
        <div className="mb-4 font-['JetBrains_Mono'] text-[12px] uppercase tracking-[0.3em] text-[var(--ff-accent-primary)]">
          {content.archiveNode} {recordId.toUpperCase()}
        </div>
        <h1 className="mb-8 font-['Inter_Tight'] text-8xl font-black uppercase leading-[0.85] tracking-tighter text-[var(--ff-text-primary)]">
          {content.archiveTitle}
        </h1>
        <div className="mb-12 grid grid-cols-4 border-b border-t border-[var(--ff-border-default)]">
          {metrics.map((metric, index) => (
            <div className={`p-6 ${index < metrics.length - 1 ? 'border-r border-[var(--ff-border-default)]' : ''}`} key={metric.label}>
              <label className="mb-4 block font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-text-muted)]">
                {metric.label}
              </label>
              <div className="font-['Inter_Tight'] text-4xl font-black tracking-tighter text-[var(--ff-text-primary)]">{metric.value}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-2 pt-2 font-['JetBrains_Mono'] text-[11px] text-[var(--ff-text-muted)]">
          {meta.map((field) => (
            <div className="flex flex-col" key={field.label}>
              <span className="uppercase">{field.label}</span>
              <span className="font-bold text-[var(--ff-text-primary)]">{field.value}</span>
            </div>
          ))}
        </div>
      </header>
    )
  }

  return (
    <SectionSurface className="ff-light-ink-shadow mb-12 grid grid-cols-12 gap-0" theme="light" tone="panel">
      <div className="col-span-3 flex flex-col items-center justify-center border-r-2 border-[var(--ff-border-default)] bg-[var(--ff-text-primary)] p-6 text-[var(--ff-surface-base)]">
        <div className="mb-4 h-24 w-24 overflow-hidden border-2 border-[var(--ff-surface-base)]">
          <img alt={getCopy(copy.shell.nav.avatarAlt, locale)} className="h-full w-full object-cover grayscale contrast-125" src={AVATAR_PLACEHOLDER} />
        </div>
        <h1 className="text-center font-['Newsreader'] text-3xl font-bold tracking-tight">{content.patientName}</h1>
        <p className="font-['JetBrains_Mono'] text-xs uppercase opacity-80">{content.patientSummary}</p>
      </div>
      <div className="col-span-9 grid grid-cols-4 divide-x-2 divide-[var(--ff-border-default)]">
        {metrics.map((metric) => (
          <div className={`flex flex-col justify-between p-6 ${metric.accent ? 'bg-[var(--ff-surface-soft)]' : ''}`} key={metric.label}>
            <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-[var(--ff-text-muted)]">
              {metric.label}
            </span>
            {metric.unit ? (
              <div className="flex items-baseline gap-1">
                <span className="font-['Newsreader'] text-4xl font-extrabold italic">{metric.value}</span>
                <span className="font-['JetBrains_Mono'] text-xs">{metric.unit}</span>
              </div>
            ) : (
              <span className="font-['Newsreader'] text-4xl font-extrabold italic">{metric.value}</span>
            )}
          </div>
        ))}
      </div>
    </SectionSurface>
  )
}
