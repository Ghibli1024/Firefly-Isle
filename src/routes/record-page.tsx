/**
 * [INPUT]: 依赖 @/components/app-shell 的设计复刻壳层与占位图，依赖 @/lib/theme 的 useTheme，依赖 react-router-dom 的 useParams。
 * [OUTPUT]: 对外提供 RecordPage 组件，对应 /record/:id。
 * [POS]: routes 的档案详情实现，按 docs/design 中的 dark/light 档案页面复刻病历展示与时间线结构，并暴露退出登录入口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import {
  ArchiveSideNav,
  AVATAR_PLACEHOLDER,
  DarkTopBar,
  PATHOLOGY_PLACEHOLDER,
  SCAN_PLACEHOLDER,
} from '@/components/app-shell'
import { useTheme } from '@/lib/theme'
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
    <div className="min-h-screen bg-[#0A0A0A] font-['Inter'] text-[#FAFAFA]">
      <DarkTopBar />
      <ArchiveSideNav dark isSigningOut={isSigningOut} onSignOut={onSignOut} userLabel={userLabel} />

      <main className="min-h-screen bg-[#0A0A0A] p-12 pt-28 md:ml-[15%]">
        <div className="mx-auto max-w-4xl">
          <header className="ff-dark-marker-line mb-12">
            <div className="mb-4 font-['JetBrains_Mono'] text-[12px] uppercase tracking-[0.3em] text-[#FF3D00]">
              Archive Node: {recordId.toUpperCase()}
            </div>
            <h1 className="mb-8 font-['Inter_Tight'] text-8xl font-black uppercase leading-[0.85] tracking-tighter text-[#FAFAFA]">
              临床
              <br />
              病史档案
            </h1>
            <div className="mb-12 grid grid-cols-4 border-b border-t border-[#262626]">
              {[
                ['年龄', '34'],
                ['血型', 'A-'],
                ['身高', '178cm'],
                ['体重', '68kg'],
              ].map(([label, value], index) => (
                <div className={`p-6 ${index < 3 ? 'border-r border-[#262626]' : ''}`} key={label}>
                  <label className="mb-4 block font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#666666]">
                    {label}
                  </label>
                  <div className="font-['Inter_Tight'] text-4xl font-black tracking-tighter text-[#FAFAFA]">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-2 pt-2 font-['JetBrains_Mono'] text-[11px] text-[#666666]">
              {[
                ['Subject_ID', 'FF-2024-0892'],
                ['Creation_Date', '2024.11.24'],
                ['Security_Protocol', 'LEVEL_A_ENCRYPTED'],
                ['Data_Node', 'HK-CENTRAL-09-B'],
              ].map(([label, value]) => (
                <div className="flex flex-col" key={label}>
                  <span className="uppercase">{label}</span>
                  <span className="font-bold text-[#FAFAFA]">{value}</span>
                </div>
              ))}
            </div>
          </header>

          <section className="mb-20">
            <div className="mb-10 flex items-baseline gap-4">
              <span className="font-['JetBrains_Mono'] text-4xl font-black text-[#FF3D00]">01</span>
              <h2 className="font-['Inter_Tight'] text-5xl font-black uppercase tracking-tight text-[#FAFAFA]">
                初发诊断 <span className="ml-2 font-['JetBrains_Mono'] text-lg font-normal opacity-30">/ INITIAL_ONSET</span>
              </h2>
            </div>
            <div className="grid grid-cols-12 gap-12">
              <div className="col-span-8">
                <h3 className="mb-6 font-['Inter_Tight'] text-3xl font-bold leading-tight text-[#FAFAFA]">
                  非小细胞肺癌 (NSCLC)
                </h3>
                <p className="mb-8 text-xl leading-relaxed text-[#FAFAFA] opacity-90">
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
                  <div className="border border-[#262626] bg-[#131313] p-6" key={section.title}>
                    <div className="mb-4 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#FF3D00]">
                      {section.title}
                    </div>
                    <ul className="space-y-3 font-['JetBrains_Mono'] text-xs">
                      {section.items.map(([label, value]) => (
                        <li className="flex justify-between border-b border-[#262626]/50 pb-1" key={label}>
                          <span className="opacity-50">{label}</span>
                          <span className="font-bold">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="ff-dark-editorial-rule" />

          <section className="mb-20">
            <div className="mb-10 flex items-baseline gap-4">
              <span className="font-['JetBrains_Mono'] text-4xl font-black text-[#FF3D00]">02</span>
              <h2 className="font-['Inter_Tight'] text-5xl font-black uppercase tracking-tight text-[#FAFAFA]">
                一线治疗 <span className="ml-2 font-['JetBrains_Mono'] text-lg font-normal opacity-30">/ LINE_01</span>
              </h2>
            </div>
            <div className="mb-8">
              <div className="mb-6 flex items-center gap-4">
                <span className="bg-[#FF3D00] px-3 py-1 font-['JetBrains_Mono'] text-[11px] font-bold uppercase text-[#0A0A0A]">
                  Phase Completed
                </span>
                <span className="font-['JetBrains_Mono'] text-sm text-[#666666]">2023.05 — 2024.02</span>
              </div>
              <h3 className="mb-6 font-['Inter_Tight'] text-4xl font-bold text-[#FAFAFA]">
                奥希替尼 (Osimertinib) 靶向治疗
              </h3>
              <div className="max-w-2xl">
                <p className="mb-10 text-lg leading-relaxed text-[#FAFAFA] opacity-80">
                  患者开始接受第三代 EGFR-TKI 治疗。初始反应良好，肿瘤体积缩小约 40%。治疗 9 个月后，复查显示左肺病灶增大，并出现微小脑转移灶，判定为疾病进展 (PD)。
                </p>
              </div>
            </div>
            <div className="border-l-4 border-[#FF3D00] bg-[#262626]/30 p-8">
              <div className="mb-3 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[#FF3D00]">
                Resistance_Analysis / 耐药分析
              </div>
              <div className="font-['Inter_Tight'] text-2xl font-bold italic text-[#FAFAFA]">
                检测到 EGFR T790M 突变消失，伴随 MET 基因扩增 (FISH 阳性)。
              </div>
            </div>
          </section>

          <div className="ff-dark-editorial-rule" />

          <section className="mb-24">
            <div className="mb-10 flex items-baseline gap-4">
              <span className="font-['JetBrains_Mono'] text-4xl font-black text-[#FF3D00]">03</span>
              <h2 className="font-['Inter_Tight'] text-5xl font-black uppercase tracking-tight text-[#FAFAFA]">
                二线治疗 <span className="ml-2 font-['JetBrains_Mono'] text-lg font-normal opacity-30">/ LINE_02</span>
              </h2>
            </div>
            <div className="mb-8">
              <div className="mb-6 flex items-center gap-4">
                <span className="border border-[#FF3D00] px-3 py-1 font-['JetBrains_Mono'] text-[11px] font-bold uppercase text-[#FF3D00]">
                  In Progress
                </span>
                <span className="font-['JetBrains_Mono'] text-sm text-[#666666]">2024.03 — PRESENT</span>
              </div>
              <h3 className="mb-6 font-['Inter_Tight'] text-4xl font-bold text-[#FAFAFA]">
                培美曲塞 + 卡铂 + 赛沃替尼 (Savolitinib)
              </h3>
              <div className="mb-12 max-w-2xl">
                <p className="text-lg leading-relaxed text-[#FAFAFA] opacity-80">
                  针对 MET 扩增，调整方案为化疗联合 MET 抑制剂治疗。目前已完成 4 个周期。患者自述呼吸困难症状缓解，脑部病灶稳定。
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#262626]">
              <div className="bg-[#0A0A0A] p-8">
                <div className="mb-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-[#666666]">
                  AI_Confidence_Log
                </div>
                <div className="font-['Inter_Tight'] text-xl font-bold text-[#FAFAFA]">方案匹配度: 94.2%</div>
                <div className="mt-1 font-['JetBrains_Mono'] text-[11px] uppercase opacity-40">
                  MET_TARGETED_PATHWAY
                </div>
              </div>
              <div className="bg-[#0A0A0A] p-8 text-right">
                <div className="mb-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-[#666666]">
                  Stability_Index
                </div>
                <div className="font-['Inter_Tight'] text-xl font-bold text-[#FF3D00]">STABLE_PREDICTED</div>
                <div className="mt-1 font-['JetBrains_Mono'] text-[11px] uppercase opacity-40">
                  PROGNOSIS_OPTIMISTIC
                </div>
              </div>
            </div>
          </section>

          <footer className="flex items-start justify-between border-t border-[#262626] pt-12 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#666666]">
            <div className="max-w-xs leading-relaxed">
              Verification_Stamp:
              <br />
              此档案由萤岛临床 AI 自动提取并结构化。所有数据点均经过病理报告与影像诊断交叉验证。
            </div>
            <div className="text-right">
              Authorized_System
              <br />
              <span className="font-bold text-[#FAFAFA]">FIREFLY_ISLE_CORE_V1.0</span>
            </div>
          </footer>
        </div>

        <div className="fixed right-6 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-4">
          <div className="relative h-32 w-px bg-[#262626]">
            <div className="absolute -left-[0.5px] top-1/3 h-8 w-[2px] bg-[#FF3D00]" />
          </div>
          <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#666666] opacity-40 [writing-mode:vertical-lr]">
            SCROLL_TO_AUDIT
          </div>
        </div>
      </main>
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
    <div className="ff-light-record-bg min-h-screen text-[#111111]">
      <div className="flex min-h-screen">
        <ArchiveSideNav dark={false} isSigningOut={isSigningOut} onSignOut={onSignOut} userLabel={userLabel} />

        <main className="mx-auto max-w-6xl flex-grow p-8">
          <header className="mb-12">
            <div className="flex items-end justify-between border-b-4 border-[#111111] pb-2">
              <div className="font-['Playfair_Display'] text-7xl font-black leading-none tracking-tighter">
                THE ARCHIVE
              </div>
              <div className="font-['JetBrains_Mono'] text-right text-xs">
                <p>RECORD_ID: {recordId.toUpperCase()}</p>
                <p>LAST_UPDATED: 2023.10.15</p>
              </div>
            </div>
            <div className="mt-1 h-px bg-[#111111]" />
          </header>

          <section className="ff-light-ink-shadow mb-12 grid grid-cols-12 gap-0 border-2 border-[#111111] bg-white">
            <div className="col-span-3 flex flex-col items-center justify-center border-r-2 border-[#111111] bg-[#111111] p-6 text-white">
              <div className="mb-4 h-24 w-24 overflow-hidden border-2 border-white">
                <img alt="Patient portrait" className="h-full w-full object-cover grayscale contrast-125" src={AVATAR_PLACEHOLDER} />
              </div>
              <h1 className="text-center font-['Newsreader'] text-3xl font-bold tracking-tight">陈先生</h1>
              <p className="font-['JetBrains_Mono'] text-xs uppercase opacity-80">MALE / 64 YEARS</p>
            </div>
            <div className="col-span-9 grid grid-cols-4 divide-x-2 divide-[#111111]">
              {[
                ['年龄', '64', ''],
                ['血型', 'A+', 'bg-[#eeeeec]'],
                ['身高', '178', ''],
                ['体重', '72', 'bg-[#eeeeec]'],
              ].map(([label, value, extra]) => (
                <div className={`flex flex-col justify-between p-6 ${extra}`} key={label}>
                  <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-[#5d5f5b]">
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
          </section>

          <div className="relative flex gap-12">
            <div className="hidden w-16 shrink-0 lg:block">
              <div className="sticky top-12 flex flex-col items-center">
                <div className="ff-light-vertical-text mb-4 border-y-2 border-[#111111] py-4 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest">
                  CHRONOLOGICAL REPORT
                </div>
                <div className="h-64 w-px bg-[#111111]/20" />
              </div>
            </div>

            <div className="flex-grow space-y-16">
              <article>
                <div className="mb-6 flex items-baseline gap-4">
                  <span className="font-['Playfair_Display'] text-6xl font-black text-[#111111]/10">01</span>
                  <h2 className="border-b-2 border-[#111111] pb-2 pr-8 font-['Newsreader'] text-4xl font-bold">
                    初发诊断
                  </h2>
                  <span className="ml-auto bg-[#111111] px-2 font-['JetBrains_Mono'] text-sm text-white">OCT 2021</span>
                </div>
                <div className="grid grid-cols-7 gap-8">
                  <div className="col-span-5">
                    <p className="text-justify text-xl leading-relaxed first-letter:float-left first-letter:mr-3 first-letter:font-['Playfair_Display'] first-letter:text-7xl first-letter:font-black first-letter:leading-[0.8]">
                      患者于2021年10月因持续性干咳就诊。胸部CT显示左肺下叶占位，大小约 3.2 x 2.8 cm，伴纵隔淋巴结肿大。纤维支气管镜活检确诊为肺腺癌。病理分期定为 T2aN2M0 (IIIA期)。
                    </p>
                    <div className="mt-8 border-l-4 border-[#111111] py-2 pl-6 italic text-[#5d5f5b]">
                      "诊断过程伴随显著体重减轻，患者自述伴有阵发性胸痛。"
                    </div>
                  </div>
                  <div className="ff-light-ink-shadow h-fit col-span-2 border-2 border-[#111111] bg-white p-4">
                    <div className="mb-3 border-b border-[#111111] pb-1 font-['Inter'] text-[10px] font-bold uppercase">
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
                          <span className={value === '(-)' ? '' : 'font-bold text-[#ba1a1a]'}>{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>

              <div className="ff-light-ink-double-rule" />

              <article>
                <div className="mb-6 flex items-baseline gap-4">
                  <span className="font-['Playfair_Display'] text-6xl font-black text-[#111111]/10">02</span>
                  <h2 className="border-b-2 border-[#111111] pb-2 pr-8 font-['Newsreader'] text-4xl font-bold">
                    一线治疗
                  </h2>
                  <span className="ml-auto bg-[#111111] px-2 font-['JetBrains_Mono'] text-sm text-white">NOV 2021 - JUN 2022</span>
                </div>
                <div className="grid grid-cols-7 gap-8">
                  <div className="col-span-2 space-y-4">
                    <div className="border-2 border-[#111111] bg-[#111111] p-4 text-white">
                      <div className="mb-3 border-b border-white/30 pb-1 font-['Inter'] text-[10px] font-bold uppercase">
                        Genetic Data
                      </div>
                      <div className="font-['Newsreader'] text-2xl font-bold">EGFR 19-del</div>
                      <p className="mt-1 font-['JetBrains_Mono'] text-[10px] opacity-70">Exon 19 Deletion Detected</p>
                    </div>
                    <div className="border-2 border-[#111111] bg-white p-4">
                      <div className="mb-2 font-['Inter'] text-[10px] font-bold uppercase">Protocol</div>
                      <p className="text-sm font-bold">奥希替尼 (Osimertinib)</p>
                      <p className="mt-1 font-['JetBrains_Mono'] text-xs">80mg qd, Oral</p>
                    </div>
                  </div>
                  <div className="col-span-5">
                    <p className="text-justify text-xl leading-relaxed">
                      基因检测提示EGFR 19号外显子缺失。患者开始接受第三代TKI奥希替尼治疗。初期疗效评价为PR（部分缓解），肿瘤缩小40%以上。治疗期间耐受良好，主要副作用为I级皮疹及偶发腹泻，均在可控范围内。
                    </p>
                    <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
                      <div className="aspect-square min-w-[140px] overflow-hidden border-2 border-[#111111] grayscale transition-all duration-300 hover:grayscale-0">
                        <img alt="CT Scan early" className="h-full w-full object-cover" src={SCAN_PLACEHOLDER} />
                      </div>
                      <div className="aspect-square min-w-[140px] overflow-hidden border-2 border-[#111111] grayscale transition-all duration-300 hover:grayscale-0">
                        <img alt="Pathology slide" className="h-full w-full object-cover" src={PATHOLOGY_PLACEHOLDER} />
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <div className="ff-light-ink-double-rule" />

              <article className="pb-24">
                <div className="mb-6 flex items-baseline gap-4">
                  <span className="font-['Playfair_Display'] text-6xl font-black text-[#111111]/10">03</span>
                  <h2 className="border-b-2 border-[#111111] pb-2 pr-8 font-['Newsreader'] text-4xl font-bold text-[#ba1a1a]">
                    二线治疗
                  </h2>
                  <span className="ml-auto bg-[#ba1a1a] px-2 font-['JetBrains_Mono'] text-sm text-white">JUL 2023 - PRESENT</span>
                </div>
                <div className="relative border-2 border-[#111111] bg-[#e0e0db] p-8">
                  <div className="absolute -top-4 right-8 bg-[#ba1a1a] px-3 py-1 font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-widest text-white">
                    Resistance Detected
                  </div>
                  <p className="mb-6 text-justify text-xl leading-relaxed">
                    2023年7月随访发现疾病进展（PD），左肺原发灶增大，并出现多发骨转移（肋骨、椎体）。进行二次活检及液体活检，未发现T790M突变，提示复杂的耐药机制，可能涉及c-MET扩增。
                  </p>
                  <div className="grid grid-cols-2 gap-8 border-t border-[#111111]/30 pt-6">
                    <div>
                      <span className="mb-2 block font-['Inter'] text-[10px] font-bold uppercase text-[#5d5f5b]">
                        新方案拟定
                      </span>
                      <p className="font-['Newsreader'] text-2xl font-bold">
                        培美曲塞 + 顺铂 + 贝伐珠单抗
                      </p>
                      <p className="mt-1 text-sm">联合抗血管生成治疗以应对骨转移风险。</p>
                    </div>
                    <div className="border border-[#111111] bg-white p-4">
                      <span className="mb-2 block font-['Inter'] text-[10px] font-bold uppercase text-[#5d5f5b]">
                        风险提示
                      </span>
                      <div className="flex items-center gap-2 text-[#ba1a1a]">
                        <span className="material-symbols-outlined text-lg">warning</span>
                        <span className="font-['JetBrains_Mono'] text-xs font-bold tracking-tighter">
                          BONE METASTASIS: HIGH SKELETAL EVENT RISK
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <footer className="flex items-start justify-between border-t-4 border-[#111111] pt-8">
            <div className="max-w-md">
              <p className="mb-2 font-['Playfair_Display'] text-2xl font-black italic tracking-tighter">
                Verification
              </p>
              <p className="text-xs leading-relaxed text-[#5d5f5b]">
                此报告由一页萤岛临床AI系统根据原始病历扫描件及病理报告自动生成。结构化数据已通过三级审核。所有临床决策须由主治医师最终确认。
              </p>
            </div>
            <div className="text-right">
              <div className="mb-4 flex justify-end gap-4">
                <button className="border-2 border-[#111111] px-4 py-1 font-['Inter'] text-xs font-bold transition-colors hover:bg-[#111111] hover:text-white">
                  导出 PDF
                </button>
                <button className="border-2 border-[#111111] px-4 py-1 font-['Inter'] text-xs font-bold transition-colors hover:bg-[#111111] hover:text-white">
                  修正数据
                </button>
              </div>
              <p className="font-['JetBrains_Mono'] text-[10px] uppercase opacity-50">
                © 2024 CLINICAL INTELLIGENCE ARCHIVE. ALL RIGHTS RESERVED.
              </p>
            </div>
          </footer>
        </main>
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
