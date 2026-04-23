/**
 * [INPUT]: 依赖 @/components/app-shell 的设计复刻壳层与占位图，依赖 @/components/system/surfaces 的壳层 surface 基元，依赖 @/lib/theme 的 useTheme，依赖 react-router-dom 的 useParams。
 * [OUTPUT]: 对外提供 RecordPage 组件，对应 /record/:id。
 * [POS]: routes 的档案详情实现，按 docs/design 中的 dark/light 档案页面复刻病历展示与时间线结构，并消费统一 system shell contract。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import {
  ArchiveSideNav,
  AVATAR_PLACEHOLDER,
  DarkTopBar,
  PATHOLOGY_PLACEHOLDER,
  SCAN_PLACEHOLDER,
} from '@/components/app-shell'
import { ActionSurface, MainShell, PanelSurface, SectionSurface } from '@/components/system/surfaces'
import { useTheme } from '@/lib/theme'
import { sidebarOffsetClass, topBarOffsetClass } from '@/lib/theme/tokens'
import { useParams } from 'react-router-dom'

type RecordPageProps = {
  isSigningOut?: boolean
  onSignOut?: () => void
  userLabel?: string
}

function DarkRecordPage({
  isSigningOut,
  onSignOut,
  recordId,
  userLabel,
}: RecordPageProps & { recordId: string }) {
  return (
    <div className="min-h-screen bg-[var(--ff-surface-base)] font-['Inter'] text-[var(--ff-text-primary)]">
      <DarkTopBar />
      <ArchiveSideNav dark isSigningOut={isSigningOut} onSignOut={onSignOut} userLabel={userLabel} />

      <MainShell className={`${topBarOffsetClass} ${sidebarOffsetClass} min-h-screen p-12`} theme="dark">
        <div className="mx-auto max-w-4xl">
          <header className="ff-dark-marker-line mb-12">
            <div className="mb-4 font-['JetBrains_Mono'] text-[12px] uppercase tracking-[0.3em] text-[var(--ff-accent-primary)]">
              Archive Node: {recordId.toUpperCase()}
            </div>
            <h1 className="mb-8 font-['Inter_Tight'] text-8xl font-black uppercase leading-[0.85] tracking-tighter text-[var(--ff-text-primary)]">
              临床
              <br />
              病史档案
            </h1>
            <div className="mb-12 grid grid-cols-4 border-b border-t border-[var(--ff-border-default)]">
              {[
                ['年龄', '34'],
                ['血型', 'A-'],
                ['身高', '178cm'],
                ['体重', '68kg'],
              ].map(([label, value], index) => (
                <div className={`p-6 ${index < 3 ? 'border-r border-[var(--ff-border-default)]' : ''}`} key={label}>
                  <label className="mb-4 block font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-text-muted)]">
                    {label}
                  </label>
                  <div className="font-['Inter_Tight'] text-4xl font-black tracking-tighter text-[var(--ff-text-primary)]">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-2 pt-2 font-['JetBrains_Mono'] text-[11px] text-[var(--ff-text-muted)]">
              {[
                ['Subject_ID', 'FF-2024-0892'],
                ['Creation_Date', '2024.11.24'],
                ['Security_Protocol', 'LEVEL_A_ENCRYPTED'],
                ['Data_Node', 'HK-CENTRAL-09-B'],
              ].map(([label, value]) => (
                <div className="flex flex-col" key={label}>
                  <span className="uppercase">{label}</span>
                  <span className="font-bold text-[var(--ff-text-primary)]">{value}</span>
                </div>
              ))}
            </div>
          </header>

          <section className="mb-20">
            <div className="mb-10 flex items-baseline gap-4">
              <span className="font-['JetBrains_Mono'] text-4xl font-black text-[var(--ff-accent-primary)]">01</span>
              <h2 className="font-['Inter_Tight'] text-5xl font-black uppercase tracking-tight text-[var(--ff-text-primary)]">
                初发诊断 <span className="ml-2 font-['JetBrains_Mono'] text-lg font-normal text-[var(--ff-text-muted)]">/ INITIAL_ONSET</span>
              </h2>
            </div>
            <div className="grid grid-cols-12 gap-12">
              <div className="col-span-8">
                <h3 className="mb-6 font-['Inter_Tight'] text-3xl font-bold leading-tight text-[var(--ff-text-primary)]">
                  非小细胞肺癌 (NSCLC)
                </h3>
                <p className="mb-8 text-xl leading-relaxed text-[var(--ff-text-subtle)]">
                  患者于 2023 年 4 月因持续性咳嗽及胸痛就诊。CT 检查显示左上肺占位性病变（3.2cm x 2.8cm），伴有纵隔淋巴结肿大。活检病理确认为肺腺癌。
                </p>
              </div>
              <div className="col-span-4 space-y-8">
                {[
                  {
                    title: 'Immunohistochemistry / IHC',
                    items: [
                      ['PD-L1', 'TPS: 45%'],
                      ['TTF-1', '(+)'],
                      ['Napsin A', '(+)'],
                    ],
                  },
                  {
                    title: 'Genetic / 基因检测',
                    items: [
                      ['EGFR', 'L858R (+)'],
                      ['ALK', 'NEG (-)'],
                    ],
                  },
                ].map((section) => (
                  <PanelSurface className="p-6" key={section.title} theme="dark" tone="panel">
                    <div className="mb-4 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-accent-primary)]">
                      {section.title}
                    </div>
                    <ul className="space-y-3 font-['JetBrains_Mono'] text-xs">
                      {section.items.map(([label, value]) => (
                        <li className="flex justify-between border-b border-[color:color-mix(in_srgb,var(--ff-border-default)_50%,transparent)] pb-1" key={label}>
                          <span className="text-[var(--ff-text-muted)]">{label}</span>
                          <span className="font-bold">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </PanelSurface>
                ))}
              </div>
            </div>
          </section>

          <div className="ff-dark-editorial-rule" />

          <section className="mb-20">
            <div className="mb-10 flex items-baseline gap-4">
              <span className="font-['JetBrains_Mono'] text-4xl font-black text-[var(--ff-accent-primary)]">02</span>
              <h2 className="font-['Inter_Tight'] text-5xl font-black uppercase tracking-tight text-[var(--ff-text-primary)]">
                一线治疗 <span className="ml-2 font-['JetBrains_Mono'] text-lg font-normal text-[var(--ff-text-muted)]">/ LINE_01</span>
              </h2>
            </div>
            <div className="mb-8">
              <div className="mb-6 flex items-center gap-4">
                <span className="bg-[var(--ff-accent-primary)] px-3 py-1 font-['JetBrains_Mono'] text-[11px] font-bold uppercase text-[var(--ff-surface-base)]">
                  Phase Completed
                </span>
                <span className="font-['JetBrains_Mono'] text-sm text-[var(--ff-text-muted)]">2023.05 — 2024.02</span>
              </div>
              <h3 className="mb-6 font-['Inter_Tight'] text-4xl font-bold text-[var(--ff-text-primary)]">
                奥希替尼 (Osimertinib) 靶向治疗
              </h3>
              <div className="max-w-2xl">
                <p className="mb-10 text-lg leading-relaxed text-[var(--ff-text-subtle)]">
                  患者开始接受第三代 EGFR-TKI 治疗。初始反应良好，肿瘤体积缩小约 40%。治疗 9 个月后，复查显示左肺病灶增大，并出现微小脑转移灶，判定为疾病进展 (PD)。
                </p>
              </div>
            </div>
            <PanelSurface className="border-l-4 border-l-[var(--ff-accent-primary)] p-8" theme="dark" tone="soft">
              <div className="mb-3 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[var(--ff-accent-primary)]">
                Resistance_Analysis / 耐药分析
              </div>
              <div className="font-['Inter_Tight'] text-2xl font-bold italic text-[var(--ff-text-primary)]">
                检测到 EGFR T790M 突变消失，伴随 MET 基因扩增 (FISH 阳性)。
              </div>
            </PanelSurface>
          </section>

          <div className="ff-dark-editorial-rule" />

          <section className="mb-24">
            <div className="mb-10 flex items-baseline gap-4">
              <span className="font-['JetBrains_Mono'] text-4xl font-black text-[var(--ff-accent-primary)]">03</span>
              <h2 className="font-['Inter_Tight'] text-5xl font-black uppercase tracking-tight text-[var(--ff-text-primary)]">
                二线治疗 <span className="ml-2 font-['JetBrains_Mono'] text-lg font-normal text-[var(--ff-text-muted)]">/ LINE_02</span>
              </h2>
            </div>
            <div className="mb-8">
              <div className="mb-6 flex items-center gap-4">
                <span className="border border-[var(--ff-accent-primary)] px-3 py-1 font-['JetBrains_Mono'] text-[11px] font-bold uppercase text-[var(--ff-accent-primary)]">
                  In Progress
                </span>
                <span className="font-['JetBrains_Mono'] text-sm text-[var(--ff-text-muted)]">2024.03 — PRESENT</span>
              </div>
              <h3 className="mb-6 font-['Inter_Tight'] text-4xl font-bold text-[var(--ff-text-primary)]">
                培美曲塞 + 卡铂 + 赛沃替尼 (Savolitinib)
              </h3>
              <div className="mb-12 max-w-2xl">
                <p className="text-lg leading-relaxed text-[var(--ff-text-subtle)]">
                  针对 MET 扩增，调整方案为化疗联合 MET 抑制剂治疗。目前已完成 4 个周期。患者自述呼吸困难症状缓解，脑部病灶稳定。
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[var(--ff-border-default)]">
              <div className="bg-[var(--ff-surface-base)] p-8">
                <div className="mb-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-[var(--ff-text-muted)]">
                  AI_Confidence_Log
                </div>
                <div className="font-['Inter_Tight'] text-xl font-bold text-[var(--ff-text-primary)]">方案匹配度: 94.2%</div>
                <div className="mt-1 font-['JetBrains_Mono'] text-[11px] uppercase text-[var(--ff-text-muted)]">
                  MET_TARGETED_PATHWAY
                </div>
              </div>
              <div className="bg-[var(--ff-surface-base)] p-8 text-right">
                <div className="mb-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-[var(--ff-text-muted)]">
                  Stability_Index
                </div>
                <div className="font-['Inter_Tight'] text-xl font-bold text-[var(--ff-accent-primary)]">STABLE_PREDICTED</div>
                <div className="mt-1 font-['JetBrains_Mono'] text-[11px] uppercase text-[var(--ff-text-muted)]">
                  PROGNOSIS_OPTIMISTIC
                </div>
              </div>
            </div>
          </section>

          <footer className="flex items-start justify-between border-t border-[var(--ff-border-default)] pt-12 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-text-muted)]">
            <div className="max-w-xs leading-relaxed">
              Verification_Stamp:
              <br />
              此档案由萤岛临床 AI 自动提取并结构化。所有数据点均经过病理报告与影像诊断交叉验证。
            </div>
            <div className="text-right">
              Authorized_System
              <br />
              <span className="font-bold text-[var(--ff-text-primary)]">FIREFLY_ISLE_CORE_V1.0</span>
            </div>
          </footer>
        </div>

        <div className="fixed right-6 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-4">
          <div className="relative h-32 w-px bg-[var(--ff-border-default)]">
            <div className="absolute -left-[0.5px] top-1/3 h-8 w-[2px] bg-[var(--ff-accent-primary)]" />
          </div>
          <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-text-muted)] opacity-40 [writing-mode:vertical-lr]">
            SCROLL_TO_AUDIT
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
  return (
    <div className="ff-light-record-bg min-h-screen text-[var(--ff-text-primary)]">
      <div className="flex min-h-screen">
        <ArchiveSideNav dark={false} isSigningOut={isSigningOut} onSignOut={onSignOut} userLabel={userLabel} />

        <MainShell className="mx-auto max-w-6xl flex-grow p-8" theme="light">
          <header className="mb-12">
            <div className="flex items-end justify-between border-b-4 border-[var(--ff-border-default)] pb-2">
              <div className="font-['Playfair_Display'] text-7xl font-black leading-none tracking-tighter">THE ARCHIVE</div>
              <div className="font-['JetBrains_Mono'] text-right text-xs">
                <p>RECORD_ID: {recordId.toUpperCase()}</p>
                <p>LAST_UPDATED: 2023.10.15</p>
              </div>
            </div>
            <div className="mt-1 h-px bg-[var(--ff-border-default)]" />
          </header>

          <SectionSurface className="ff-light-ink-shadow mb-12 grid grid-cols-12 gap-0" theme="light" tone="panel">
            <div className="col-span-3 flex flex-col items-center justify-center border-r-2 border-[var(--ff-border-default)] bg-[var(--ff-text-primary)] p-6 text-[var(--ff-surface-base)]">
              <div className="mb-4 h-24 w-24 overflow-hidden border-2 border-[var(--ff-surface-base)]">
                <img alt="Patient portrait" className="h-full w-full object-cover grayscale contrast-125" src={AVATAR_PLACEHOLDER} />
              </div>
              <h1 className="text-center font-['Newsreader'] text-3xl font-bold tracking-tight">陈先生</h1>
              <p className="font-['JetBrains_Mono'] text-xs uppercase opacity-80">MALE / 64 YEARS</p>
            </div>
            <div className="col-span-9 grid grid-cols-4 divide-x-2 divide-[var(--ff-border-default)]">
              {[
                ['年龄', '64', ''],
                ['血型', 'A+', 'bg-[var(--ff-surface-soft)]'],
                ['身高', '178', ''],
                ['体重', '72', 'bg-[var(--ff-surface-soft)]'],
              ].map(([label, value, extra]) => (
                <div className={`flex flex-col justify-between p-6 ${extra}`} key={label}>
                  <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-[var(--ff-text-muted)]">
                    {label}
                  </span>
                  {label === '身高' || label === '体重' ? (
                    <div className="flex items-baseline gap-1">
                      <span className="font-['Newsreader'] text-4xl font-extrabold italic">{value}</span>
                      <span className="font-['JetBrains_Mono'] text-xs">{label === '身高' ? 'CM' : 'KG'}</span>
                    </div>
                  ) : (
                    <span className="font-['Newsreader'] text-4xl font-extrabold italic">{value}</span>
                  )}
                </div>
              ))}
            </div>
          </SectionSurface>

          <div className="relative flex gap-12">
            <div className="hidden w-16 shrink-0 lg:block">
              <div className="sticky top-12 flex flex-col items-center">
                <div className="ff-light-vertical-text mb-4 border-y-2 border-[var(--ff-border-default)] py-4 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest">
                  CHRONOLOGICAL REPORT
                </div>
                <div className="h-64 w-px bg-[var(--ff-border-muted)]" />
              </div>
            </div>

            <div className="flex-grow space-y-16">
              <article>
                <div className="mb-6 flex items-baseline gap-4">
                  <span className="font-['Playfair_Display'] text-6xl font-black text-[color:color-mix(in_srgb,var(--ff-text-primary)_10%,transparent)]">01</span>
                  <h2 className="border-b-2 border-[var(--ff-border-default)] pb-2 pr-8 font-['Newsreader'] text-4xl font-bold">
                    初发诊断
                  </h2>
                  <span className="ml-auto bg-[var(--ff-text-primary)] px-2 font-['JetBrains_Mono'] text-sm text-[var(--ff-surface-base)]">OCT 2021</span>
                </div>
                <div className="grid grid-cols-7 gap-8">
                  <div className="col-span-5">
                    <p className="text-justify text-xl leading-relaxed first-letter:float-left first-letter:mr-3 first-letter:font-['Playfair_Display'] first-letter:text-7xl first-letter:font-black first-letter:leading-[0.8]">
                      患者于2021年10月因持续性干咳就诊。胸部CT显示左肺下叶占位，大小约 3.2 x 2.8 cm，伴纵隔淋巴结肿大。纤维支气管镜活检确诊为肺腺癌。病理分期定为 T2aN2M0 (IIIA期)。
                    </p>
                    <div className="mt-8 border-l-4 border-[var(--ff-border-default)] py-2 pl-6 italic text-[var(--ff-text-muted)]">
                      "诊断过程伴随显著体重减轻，患者自述伴有阵发性胸痛。"
                    </div>
                  </div>
                  <PanelSurface className="ff-light-ink-shadow h-fit col-span-2 p-4" theme="light" tone="panel">
                    <div className="mb-3 border-b border-[var(--ff-border-default)] pb-1 font-['Inter'] text-[10px] font-bold uppercase">
                      IHC Markers
                    </div>
                    <ul className="space-y-2 font-['JetBrains_Mono'] text-xs">
                      {[
                        ['TTF-1', '(+)'],
                        ['Napsin A', '(+)'],
                        ['P40', '(-)'],
                        ['CK7', '(+)'],
                        ['Ki-67', '25%'],
                      ].map(([label, value]) => (
                        <li className="flex justify-between" key={label}>
                          <span>{label}</span>
                          <span className={value === '(-)' ? '' : 'font-bold text-[var(--ff-accent-warning)]'}>{value}</span>
                        </li>
                      ))}
                    </ul>
                  </PanelSurface>
                </div>
              </article>

              <div className="ff-light-ink-double-rule" />

              <article>
                <div className="mb-6 flex items-baseline gap-4">
                  <span className="font-['Playfair_Display'] text-6xl font-black text-[color:color-mix(in_srgb,var(--ff-text-primary)_10%,transparent)]">02</span>
                  <h2 className="border-b-2 border-[var(--ff-border-default)] pb-2 pr-8 font-['Newsreader'] text-4xl font-bold">
                    一线治疗
                  </h2>
                  <span className="ml-auto bg-[var(--ff-text-primary)] px-2 font-['JetBrains_Mono'] text-sm text-[var(--ff-surface-base)]">NOV 2021 - JUN 2022</span>
                </div>
                <div className="grid grid-cols-7 gap-8">
                  <div className="col-span-2 space-y-4">
                    <ActionSurface className="p-4 text-[var(--ff-surface-base)]" theme="light" tone="base">
                      <div className="mb-3 border-b border-white/30 pb-1 font-['Inter'] text-[10px] font-bold uppercase">
                        Genetic Data
                      </div>
                      <div className="font-['Newsreader'] text-2xl font-bold">EGFR 19-del</div>
                      <p className="mt-1 font-['JetBrains_Mono'] text-[10px] opacity-70">Exon 19 Deletion Detected</p>
                    </ActionSurface>
                    <PanelSurface className="p-4" theme="light" tone="panel">
                      <div className="mb-2 font-['Inter'] text-[10px] font-bold uppercase">Protocol</div>
                      <p className="text-sm font-bold">奥希替尼 (Osimertinib)</p>
                      <p className="mt-1 font-['JetBrains_Mono'] text-xs">80mg qd, Oral</p>
                    </PanelSurface>
                  </div>
                  <div className="col-span-5">
                    <p className="text-justify text-xl leading-relaxed">
                      基因检测提示EGFR 19号外显子缺失。患者开始接受第三代TKI奥希替尼治疗。初期疗效评价为PR（部分缓解），肿瘤缩小40%以上。治疗期间耐受良好，主要副作用为I级皮疹及偶发腹泻，均在可控范围内。
                    </p>
                    <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
                      <div className="aspect-square min-w-[140px] overflow-hidden border-2 border-[var(--ff-border-default)] grayscale transition-all duration-300 hover:grayscale-0">
                        <img alt="CT Scan early" className="h-full w-full object-cover" src={SCAN_PLACEHOLDER} />
                      </div>
                      <div className="aspect-square min-w-[140px] overflow-hidden border-2 border-[var(--ff-border-default)] grayscale transition-all duration-300 hover:grayscale-0">
                        <img alt="Pathology slide" className="h-full w-full object-cover" src={PATHOLOGY_PLACEHOLDER} />
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <div className="ff-light-ink-double-rule" />

              <article className="pb-24">
                <div className="mb-6 flex items-baseline gap-4">
                  <span className="font-['Playfair_Display'] text-6xl font-black text-[color:color-mix(in_srgb,var(--ff-text-primary)_10%,transparent)]">03</span>
                  <h2 className="border-b-2 border-[var(--ff-border-default)] pb-2 pr-8 font-['Newsreader'] text-4xl font-bold text-[var(--ff-accent-warning)]">
                    二线治疗
                  </h2>
                  <span className="ml-auto bg-[var(--ff-accent-warning)] px-2 font-['JetBrains_Mono'] text-sm text-white">JUL 2023 - PRESENT</span>
                </div>
                <ActionSurface className="relative p-8" theme="light" tone="warning">
                  <div className="absolute -top-4 right-8 bg-[var(--ff-accent-warning)] px-3 py-1 font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-widest text-white">
                    Resistance Detected
                  </div>
                  <p className="mb-6 text-justify text-xl leading-relaxed">
                    2023年7月随访发现疾病进展（PD），左肺原发灶增大，并出现多发骨转移（肋骨、椎体）。进行二次活检及液体活检，未发现T790M突变，提示复杂的耐药机制，可能涉及c-MET扩增。
                  </p>
                  <div className="grid grid-cols-2 gap-8 border-t border-[color:color-mix(in_srgb,var(--ff-border-default)_30%,transparent)] pt-6">
                    <div>
                      <span className="mb-2 block font-['Inter'] text-[10px] font-bold uppercase text-[var(--ff-text-muted)]">
                        新方案拟定
                      </span>
                      <p className="font-['Newsreader'] text-2xl font-bold">培美曲塞 + 顺铂 + 贝伐珠单抗</p>
                      <p className="mt-1 text-sm">联合抗血管生成治疗以应对骨转移风险。</p>
                    </div>
                    <PanelSurface className="p-4" theme="light" tone="panel">
                      <span className="mb-2 block font-['Inter'] text-[10px] font-bold uppercase text-[var(--ff-text-muted)]">
                        风险提示
                      </span>
                      <div className="flex items-center gap-2 text-[var(--ff-accent-warning)]">
                        <span className="material-symbols-outlined text-lg">warning</span>
                        <span className="font-['JetBrains_Mono'] text-xs font-bold tracking-tighter">
                          BONE METASTASIS: HIGH SKELETAL EVENT RISK
                        </span>
                      </div>
                    </PanelSurface>
                  </div>
                </ActionSurface>
              </article>
            </div>
          </div>

          <footer className="flex items-start justify-between border-t-4 border-[var(--ff-border-default)] pt-8">
            <div className="max-w-md">
              <p className="mb-2 font-['Playfair_Display'] text-2xl font-black italic tracking-tighter">Verification</p>
              <p className="text-xs leading-relaxed text-[var(--ff-text-muted)]">
                此报告由一页萤岛临床AI系统根据原始病历扫描件及病理报告自动生成。结构化数据已通过三级审核。所有临床决策须由主治医师最终确认。
              </p>
            </div>
            <div className="text-right">
              <div className="mb-4 flex justify-end gap-4">
                <button className="border-2 border-[var(--ff-border-default)] px-4 py-1 font-['Inter'] text-xs font-bold transition-colors hover:bg-[var(--ff-text-primary)] hover:text-white">
                  导出 PDF
                </button>
                <button className="border-2 border-[var(--ff-border-default)] px-4 py-1 font-['Inter'] text-xs font-bold transition-colors hover:bg-[var(--ff-text-primary)] hover:text-white">
                  修正数据
                </button>
              </div>
              <p className="font-['JetBrains_Mono'] text-[10px] uppercase text-[var(--ff-text-secondary)]">
                © 2024 CLINICAL INTELLIGENCE ARCHIVE. ALL RIGHTS RESERVED.
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
