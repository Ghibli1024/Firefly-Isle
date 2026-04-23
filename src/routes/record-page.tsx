/**
 * [INPUT]: 依赖 @/components/app-shell 的设计复刻壳层与档案素材，依赖 @/components/record 的总览头部、章节框架与侧栏信息卡 feature 组件，依赖 @/lib/theme 的 useTheme，依赖 react-router-dom 的 useParams。
 * [OUTPUT]: 对外提供 RecordPage 组件，对应 /record/:id。
 * [POS]: routes 的档案详情 orchestration 层，保留 dark/light 顶层主题分发与路由参数处理，并编排统一 system shell 与 record feature 组件。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { ArchiveSideNav, DarkTopBar, PATHOLOGY_PLACEHOLDER, SCAN_PLACEHOLDER } from '@/components/app-shell'
import { RecordSectionFrame } from '@/components/record/record-section-frame'
import { RecordSideCard } from '@/components/record/record-side-card'
import { RecordSummaryHeader } from '@/components/record/record-summary-header'
import { ActionSurface, MainShell, PanelSurface } from '@/components/system/surfaces'
import { getCopy, copy } from '@/lib/copy'
import { useLocale } from '@/lib/locale'
import { useTheme } from '@/lib/theme'
import { sidebarOffsetClass, topBarOffsetClass } from '@/lib/theme/tokens'
import { useParams } from 'react-router-dom'

type RecordPageProps = {
  isSigningOut?: boolean
  onSignOut?: () => void
  userLabel?: string
}

const recordMetricLabels = {
  en: {
    age: 'Age',
    bloodType: 'Blood Type',
    height: 'Height',
    weight: 'Weight',
  },
  zh: {
    age: '年龄',
    bloodType: '血型',
    height: '身高',
    weight: '体重',
  },
} as const

function DarkRecordPage({
  isSigningOut,
  onSignOut,
  recordId,
  userLabel,
}: RecordPageProps & { recordId: string }) {
  const { locale } = useLocale()
  const metricLabels = recordMetricLabels[locale]

  return (
    <div className="min-h-screen bg-[var(--ff-surface-base)] font-['Inter'] text-[var(--ff-text-primary)]">
      <DarkTopBar />
      <ArchiveSideNav dark isSigningOut={isSigningOut} onSignOut={onSignOut} userLabel={userLabel} />

      <MainShell className={`${topBarOffsetClass} ${sidebarOffsetClass} min-h-screen p-12`} theme="dark">
        <div className="mx-auto max-w-4xl">
          <RecordSummaryHeader
            meta={[
              ['Subject_ID', 'FF-2024-0892'],
              ['Creation_Date', '2024.11.24'],
              ['Security_Protocol', 'LEVEL_A_ENCRYPTED'],
              ['Data_Node', 'HK-CENTRAL-09-B'],
            ].map(([label, value]) => ({ label, value }))}
            metrics={[
              [metricLabels.age, '34'],
              [metricLabels.bloodType, 'A-'],
              [metricLabels.height, '178cm'],
              [metricLabels.weight, '68kg'],
            ].map(([label, value]) => ({ label, value }))}
            recordId={recordId}
            theme="dark"
          />

          <RecordSectionFrame
            className="mb-20"
            index="01"
            subtitle={locale === 'zh' ? '初发' : 'Initial Onset'}
            theme="dark"
            title={getCopy(copy.recordPage.dark.initialOnsetTitle, locale)}
            body={
              <div className="grid grid-cols-12 gap-12">
                <div className="col-span-8">
                  <h3 className="mb-6 font-['Inter_Tight'] text-3xl font-bold leading-tight text-[var(--ff-text-primary)]">
                    {getCopy(copy.recordPage.dark.initialOnsetDiagnosis, locale)} (NSCLC)
                  </h3>
                  <p className="mb-8 text-xl leading-relaxed text-[var(--ff-text-subtle)]">
                    {getCopy(copy.recordPage.dark.initialOnsetSummary, locale)}
                  </p>
                </div>
                <div className="col-span-4 space-y-8">
                  <RecordSideCard
                    items={[
                      ['PD-L1', 'TPS: 45%'],
                      ['TTF-1', '(+)'],
                      ['Napsin A', '(+)'],
                    ].map(([label, value]) => ({ label, value }))}
                    theme="dark"
                    title={getCopy(copy.recordPage.dark.immunohistochemistry, locale)}
                  />
                  <RecordSideCard
                    items={[
                      ['EGFR', 'L858R (+)'],
                      ['ALK', 'NEG (-)'],
                    ].map(([label, value]) => ({ label, value }))}
                    theme="dark"
                    title={getCopy(copy.recordPage.dark.geneticAnalysis, locale)}
                  />
                </div>
              </div>
            }
          />

          <div className="ff-dark-editorial-rule" />

          <RecordSectionFrame
            badge={{ label: getCopy(copy.recordPage.dark.line1Badge, locale) }}
            body={
              <>
                <div className="mb-8">
                  <h3 className="mb-6 font-['Inter_Tight'] text-4xl font-bold text-[var(--ff-text-primary)]">
                    {getCopy(copy.recordPage.dark.line1Therapy, locale)} (Osimertinib)
                  </h3>
                  <div className="max-w-2xl">
                    <p className="mb-10 text-lg leading-relaxed text-[var(--ff-text-subtle)]">
                      {getCopy(copy.recordPage.dark.line1Summary, locale)}
                    </p>
                  </div>
                </div>
                <PanelSurface className="border-l-4 border-l-[var(--ff-accent-primary)] p-8" theme="dark" tone="soft">
                  <div className="mb-3 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[var(--ff-accent-primary)]">
                    {getCopy(copy.recordPage.dark.resistanceAnalysis, locale)}
                  </div>
                  <div className="font-['Inter_Tight'] text-2xl font-bold italic text-[var(--ff-text-primary)]">
                    {getCopy(copy.recordPage.dark.resistanceBody, locale)}
                  </div>
                </PanelSurface>
              </>
            }
            className="mb-20"
            index="02"
            subtitle={locale === 'zh' ? '治疗线 1' : 'Line 01'}
            theme="dark"
            timeframe="2023.05 — 2024.02"
            title={getCopy(copy.recordPage.dark.line1Title, locale)}
          />

          <div className="ff-dark-editorial-rule" />

          <RecordSectionFrame
            badge={{ label: getCopy(copy.recordPage.dark.line2Badge, locale), variant: 'outline' }}
            body={
              <>
                <div className="mb-8">
                  <h3 className="mb-6 font-['Inter_Tight'] text-4xl font-bold text-[var(--ff-text-primary)]">
                    {getCopy(copy.recordPage.dark.line2Therapy, locale)} (Savolitinib)
                  </h3>
                  <div className="mb-12 max-w-2xl">
                    <p className="text-lg leading-relaxed text-[var(--ff-text-subtle)]">
                      {getCopy(copy.recordPage.dark.line2Summary, locale)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-px bg-[var(--ff-border-default)]">
                  <div className="bg-[var(--ff-surface-base)] p-8">
                    <div className="mb-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-[var(--ff-text-muted)]">
                      {getCopy(copy.recordPage.dark.aiConfidenceLog, locale)}
                    </div>
                    <div className="font-['Inter_Tight'] text-xl font-bold text-[var(--ff-text-primary)]">{getCopy(copy.recordPage.dark.matchScore, locale)}</div>
                    <div className="mt-1 font-['JetBrains_Mono'] text-[11px] uppercase text-[var(--ff-text-muted)]">
                      {locale === 'zh' ? 'MET 靶向通路' : 'MET Targeted Pathway'}
                    </div>
                  </div>
                  <div className="bg-[var(--ff-surface-base)] p-8 text-right">
                    <div className="mb-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-[var(--ff-text-muted)]">
                      {getCopy(copy.recordPage.dark.stabilityIndex, locale)}
                    </div>
                    <div className="font-['Inter_Tight'] text-xl font-bold text-[var(--ff-accent-primary)]">{getCopy(copy.recordPage.dark.stabilityValue, locale)}</div>
                    <div className="mt-1 font-['JetBrains_Mono'] text-[11px] uppercase text-[var(--ff-text-muted)]">
                      {getCopy(copy.recordPage.dark.prognosisValue, locale).toUpperCase().replace(/ /g, '_')}
                    </div>
                  </div>
                </div>
              </>
            }
            className="mb-24"
            index="03"
            subtitle={locale === 'zh' ? '治疗线 2' : 'Line 02'}
            theme="dark"
            timeframe="{locale === 'zh' ? '2024.03 — 至今' : '2024.03 — Present'}"
            title={getCopy(copy.recordPage.dark.line2Title, locale)}
          />

          <footer className="flex items-start justify-between border-t border-[var(--ff-border-default)] pt-12 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-text-muted)]">
            <div className="max-w-xs leading-relaxed">
              {getCopy(copy.recordPage.dark.verificationStamp, locale)}:
              <br />
              {getCopy(copy.recordPage.dark.verificationBody, locale)}
            </div>
            <div className="text-right">
              {getCopy(copy.recordPage.dark.authorizedSystem, locale)}
              <br />
              <span className="font-bold text-[var(--ff-text-primary)]">{locale === 'zh' ? '萤岛核心系统 V1.0' : 'Firefly Isle Core V1.0'}</span>
            </div>
          </footer>
        </div>

        <div className="fixed right-6 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-4">
          <div className="relative h-32 w-px bg-[var(--ff-border-default)]">
            <div className="absolute -left-[0.5px] top-1/3 h-8 w-[2px] bg-[var(--ff-accent-primary)]" />
          </div>
          <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-text-muted)] opacity-40 [writing-mode:vertical-lr]">
            {getCopy(copy.recordPage.dark.scrollAudit, locale).toUpperCase().replace(/ /g, '_')}
          </div>
        </div>
      </MainShell>
    </div>
  )
}

function LightRecordPage({
  isSigningOut,
  onSignOut,
  recordId,
  userLabel,
}: RecordPageProps & { recordId: string }) {
  const { locale } = useLocale()
  const metricLabels = recordMetricLabels[locale]

  return (
    <div className="ff-light-record-bg min-h-screen text-[var(--ff-text-primary)]">
      <div className="flex min-h-screen">
        <ArchiveSideNav dark={false} isSigningOut={isSigningOut} onSignOut={onSignOut} userLabel={userLabel} />

        <MainShell className="mx-auto max-w-6xl flex-grow p-8" theme="light">
          <header className="mb-12">
            <div className="flex items-end justify-between border-b-4 border-[var(--ff-border-default)] pb-2">
              <div className="font-['Playfair_Display'] text-7xl font-black leading-none tracking-tighter">{getCopy(copy.recordPage.light.archive, locale)}</div>
              <div className="font-['JetBrains_Mono'] text-right text-xs">
                <p>{getCopy(copy.recordPage.light.recordId, locale)}: {recordId.toUpperCase()}</p>
                <p>{getCopy(copy.recordPage.light.lastUpdated, locale)}</p>
              </div>
            </div>
            <div className="mt-1 h-px bg-[var(--ff-border-default)]" />
          </header>

          <RecordSummaryHeader
            meta={[]}
            metrics={[
              { label: metricLabels.age, value: '64' },
              { accent: true, label: metricLabels.bloodType, value: 'A+' },
              { label: metricLabels.height, unit: 'CM', value: '178' },
              { accent: true, label: metricLabels.weight, unit: 'KG', value: '72' },
            ]}
            recordId={recordId}
            theme="light"
          />

          <div className="relative flex gap-12">
            <div className="hidden w-16 shrink-0 lg:block">
              <div className="sticky top-12 flex flex-col items-center">
                <div className="ff-light-vertical-text mb-4 border-y-2 border-[var(--ff-border-default)] py-4 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest">
                  {getCopy(copy.recordPage.light.reportRail, locale)}
                </div>
                <div className="h-64 w-px bg-[var(--ff-border-muted)]" />
              </div>
            </div>

            <div className="flex-grow space-y-16">
              <RecordSectionFrame
                body={
                  <div className="grid grid-cols-7 gap-8">
                    <div className="col-span-5">
                      <p className="text-justify text-xl leading-relaxed first-letter:float-left first-letter:mr-3 first-letter:font-['Playfair_Display'] first-letter:text-7xl first-letter:font-black first-letter:leading-[0.8]">
                        {getCopy(copy.recordPage.light.initialOnsetBody, locale)}
                      </p>
                      <div className="mt-8 border-l-4 border-[var(--ff-border-default)] py-2 pl-6 italic text-[var(--ff-text-muted)]">
                        {getCopy(copy.recordPage.light.initialOnsetQuote, locale)}
                      </div>
                    </div>
                    <RecordSideCard
                      className="ff-light-ink-shadow h-fit col-span-2"
                      items={[
                        ['TTF-1', '(+)'],
                        ['Napsin A', '(+)'],
                        ['P40', '(-)'],
                        ['CK7', '(+)'],
                        ['Ki-67', '25%'],
                      ].map(([label, value]) => ({ accent: value !== '(-)', label, value }))}
                      theme="light"
                      title={getCopy(copy.recordPage.light.ihcMarkers, locale)}
                    />
                  </div>
                }
                index="01"
                theme="light"
                timeframe="{locale === 'zh' ? '2021.10' : 'Oct 2021'}"
                title={getCopy(copy.recordPage.light.initialOnsetTitle, locale)}
              />

              <div className="ff-light-ink-double-rule" />

              <RecordSectionFrame
                body={
                  <div className="grid grid-cols-7 gap-8">
                    <div className="col-span-2 space-y-4">
                      <RecordSideCard
                        body="EGFR 19-del"
                        subtitle={getCopy(copy.recordPage.light.geneticSubtitle, locale)}
                        theme="light"
                        title={getCopy(copy.recordPage.light.geneticData, locale)}
                        tone="action"
                      />
                      <RecordSideCard
                        body={`${getCopy(copy.recordPage.dark.line1Therapy, locale)} (Osimertinib)`}
                        subtitle={getCopy(copy.recordPage.light.protocolSubtitle, locale)}
                        theme="light"
                        title={getCopy(copy.recordPage.light.protocol, locale)}
                      />
                    </div>
                    <div className="col-span-5">
                      <p className="text-justify text-xl leading-relaxed">
                        {getCopy(copy.recordPage.light.line1Body, locale)}
                      </p>
                      <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
                        <div className="aspect-square min-w-[140px] overflow-hidden border-2 border-[var(--ff-border-default)] grayscale transition-all duration-300 hover:grayscale-0">
                          <img alt="{locale === 'zh' ? '早期 CT 扫描' : 'Early CT scan'}" className="h-full w-full object-cover" src={SCAN_PLACEHOLDER} />
                        </div>
                        <div className="aspect-square min-w-[140px] overflow-hidden border-2 border-[var(--ff-border-default)] grayscale transition-all duration-300 hover:grayscale-0">
                          <img alt="{locale === 'zh' ? '病理切片' : 'Pathology slide'}" className="h-full w-full object-cover" src={PATHOLOGY_PLACEHOLDER} />
                        </div>
                      </div>
                    </div>
                  </div>
                }
                index="02"
                theme="light"
                timeframe="{locale === 'zh' ? '2021.11 — 2022.06' : 'Nov 2021 — Jun 2022'}"
                title={getCopy(copy.recordPage.light.line1Title, locale)}
              />

              <div className="ff-light-ink-double-rule" />

              <RecordSectionFrame
                body={
                  <ActionSurface className="relative p-8" theme="light" tone="warning">
                    <div className="absolute -top-4 right-8 bg-[var(--ff-accent-warning)] px-3 py-1 font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-widest text-white">
                      {getCopy(copy.recordPage.light.resistanceDetected, locale)}
                    </div>
                    <p className="mb-6 text-justify text-xl leading-relaxed">
                      {getCopy(copy.recordPage.light.line2Body, locale)}
                    </p>
                    <div className="grid grid-cols-2 gap-8 border-t border-[color:color-mix(in_srgb,var(--ff-border-default)_30%,transparent)] pt-6">
                      <div>
                        <span className="mb-2 block font-['Inter'] text-[10px] font-bold uppercase text-[var(--ff-text-muted)]">
                          {getCopy(copy.recordPage.light.newPlan, locale)}
                        </span>
                        <p className="font-['Newsreader'] text-2xl font-bold">培美曲塞 + 顺铂 + 贝伐珠单抗</p>
                        <p className="mt-1 text-sm">{getCopy(copy.recordPage.light.newPlanBody, locale)}</p>
                      </div>
                      <RecordSideCard
                        items={[
                          {
                            label: 'BONE METASTASIS',
                            value: 'HIGH SKELETAL EVENT RISK',
                          },
                        ]}
                        theme="light"
                        title={getCopy(copy.recordPage.light.riskWarning, locale)}
                      />
                    </div>
                  </ActionSurface>
                }
                className="pb-24"
                index="03"
                theme="light"
                timeframe="{locale === 'zh' ? '2023.07 — 至今' : 'Jul 2023 — Present'}"
                title={getCopy(copy.recordPage.light.line2Title, locale)}
              />
            </div>
          </div>

          <footer className="flex items-start justify-between border-t-4 border-[var(--ff-border-default)] pt-8">
            <div className="max-w-md">
              <p className="mb-2 font-['Playfair_Display'] text-2xl font-black italic tracking-tighter">{getCopy(copy.recordPage.light.verification, locale)}</p>
              <p className="text-xs leading-relaxed text-[var(--ff-text-muted)]">
                {getCopy(copy.recordPage.light.verificationBody, locale)}
              </p>
            </div>
            <div className="text-right">
              <div className="mb-4 flex justify-end gap-4">
                <button className="border-2 border-[var(--ff-border-default)] px-4 py-1 font-['Inter'] text-xs font-bold transition-colors hover:bg-[var(--ff-text-primary)] hover:text-white">
                  {getCopy(copy.recordPage.light.exportPdf, locale)}
                </button>
                <button className="border-2 border-[var(--ff-border-default)] px-4 py-1 font-['Inter'] text-xs font-bold transition-colors hover:bg-[var(--ff-text-primary)] hover:text-white">
                  {getCopy(copy.recordPage.light.editData, locale)}
                </button>
              </div>
              <p className="font-['JetBrains_Mono'] text-[10px] uppercase text-[var(--ff-text-secondary)]">
                {getCopy(copy.recordPage.light.copyright, locale)}
              </p>
            </div>
          </footer>
        </MainShell>
      </div>
    </div>
  )
}

export function RecordPage({ isSigningOut, onSignOut, userLabel }: RecordPageProps) {
  const { id = '2024-OX-0912' } = useParams()
  const { theme } = useTheme()

  return theme === 'dark' ? (
    <DarkRecordPage isSigningOut={isSigningOut} onSignOut={onSignOut} recordId={id} userLabel={userLabel} />
  ) : (
    <LightRecordPage isSigningOut={isSigningOut} onSignOut={onSignOut} recordId={id} userLabel={userLabel} />
  )
}
