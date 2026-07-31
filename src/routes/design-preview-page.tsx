/**
 * [INPUT]: 依赖 react 的本地候选/材质/指标状态，依赖 lucide-react 图标与 namespaced design-preview.css；只消费文件内静态虚构病历数据。
 * [OUTPUT]: 对外提供 DesignPreviewPage 路由组件及 DESIGN_PREVIEW_DIRECTIONS 元数据。
 * [POS]: routes 的隔离 V4 设计评估页，对应公开 /design-preview；三套方向共享同一 DOM/数据，不读取远端患者数据、不写全局主题、不进入正式导航。
 * [PROTOCOL]: 变更候选、数据结构、控件或路由边界时更新此头部、routes/CLAUDE.md 与 V4 DESIGN.md
 */
import { useState, type CSSProperties } from 'react'
import {
  Activity,
  ArrowUpRight,
  Bell,
  BookOpenText,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock3,
  Download,
  FileText,
  HeartPulse,
  History,
  LayoutDashboard,
  Moon,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  TestTube2,
  TriangleAlert,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

import '@/styles/design-preview.css'

type DesignDirection = 'calm' | 'glass' | 'archive'
type PreviewMode = 'light' | 'dark'
type MetricId = 'ca153' | 'cea' | 'wbc' | 'alt'
type SemanticTone = 'critical' | 'attention' | 'info' | 'success'

interface DirectionDefinition {
  id: DesignDirection
  code: 'A' | 'B' | 'C'
  name: string
  englishName: string
  thesis: string
  risk: string
  recommended?: boolean
}

interface MetricDefinition {
  id: MetricId
  label: string
  longLabel: string
  unit: string
  current: string
  delta: string
  range: string
  status: string
  tone: SemanticTone
  values: number[]
  dates: string[]
  summary: string
}

interface TimelineItem {
  date: string
  title: string
  detail: string
  status: string
  current?: boolean
}

export const DESIGN_PREVIEW_DIRECTIONS = [
  {
    id: 'calm',
    code: 'A',
    name: '临床静观',
    englishName: 'Clinical Calm',
    thesis: '温暖中性、极少边框，把患者、当前治疗与异常信息放在第一阅读层级。',
    risk: '最稳健，也最需要用品牌细节避免变成通用 SaaS。',
    recommended: true,
  },
  {
    id: 'glass',
    code: 'B',
    name: '萤光舷窗',
    englishName: 'Firefly Glass',
    thesis: '深海材质、受限玻璃与萤火焦点，让品牌感明显强于传统医疗软件。',
    risk: '玻璃和 glow 一旦过量，会牺牲对比度、性能与严肃感。',
  },
  {
    id: 'archive',
    code: 'C',
    name: '活档案',
    englishName: 'Living Archive',
    thesis: '温暖纸张、现代编辑节奏与索引语法，突出病历的时间性和长期保存。',
    risk: '需要严格限制 serif、纹理与规则线，避免退回旧式报刊风。',
  },
] satisfies readonly DirectionDefinition[]

const metrics = {
  ca153: {
    id: 'ca153',
    label: 'CA15-3',
    longLabel: '糖类抗原 15-3',
    unit: 'U/mL',
    current: '46.8',
    delta: '+38%',
    range: '0–31.3',
    status: '连续升高',
    tone: 'critical',
    values: [24.2, 26.1, 28.4, 33.8, 39.6, 46.8],
    dates: ['02/08', '03/05', '04/02', '05/09', '06/18', '07/24'],
    summary: '连续 3 次高于参考上限，建议结合近期影像与症状复核趋势；单项指标不构成诊断。',
  },
  cea: {
    id: 'cea',
    label: 'CEA',
    longLabel: '癌胚抗原',
    unit: 'ng/mL',
    current: '4.1',
    delta: '-4.7%',
    range: '0–5.0',
    status: '范围内',
    tone: 'success',
    values: [4.4, 4.5, 4.2, 4.3, 4.0, 4.1],
    dates: ['02/08', '03/05', '04/02', '05/09', '06/18', '07/24'],
    summary: '最近 6 次结果整体稳定，当前位于参考范围内；继续按既定复查计划观察。',
  },
  wbc: {
    id: 'wbc',
    label: 'WBC',
    longLabel: '白细胞计数',
    unit: '×10⁹/L',
    current: '3.2',
    delta: '-13.5%',
    range: '3.5–9.5',
    status: '轻度偏低',
    tone: 'attention',
    values: [4.6, 4.1, 3.8, 3.9, 3.7, 3.2],
    dates: ['02/08', '03/05', '04/02', '05/09', '06/18', '07/24'],
    summary: '当前轻度低于参考下限，结合中性粒细胞结果和治疗周期复核；如出现发热应及时就医。',
  },
  alt: {
    id: 'alt',
    label: 'ALT',
    longLabel: '丙氨酸氨基转移酶',
    unit: 'U/L',
    current: '28',
    delta: '+3.7%',
    range: '7–40',
    status: '范围内',
    tone: 'info',
    values: [23, 25, 24, 27, 27, 28],
    dates: ['02/08', '03/05', '04/02', '05/09', '06/18', '07/24'],
    summary: '结果位于参考范围内，近期变化幅度小；继续结合其他肝功能指标共同观察。',
  },
} satisfies Record<MetricId, MetricDefinition>

const attentionItems = [
  {
    tone: 'critical',
    Icon: TriangleAlert,
    label: '优先复核',
    title: 'CA15-3 连续 3 次升高',
    detail: '较 4 月结果增加 64%，建议关联近期影像与症状。',
  },
  {
    tone: 'attention',
    Icon: CircleAlert,
    label: '治疗期关注',
    title: '白细胞与中性粒细胞偏低',
    detail: '处于轻度下降区间，下一周期前复查血常规。',
  },
  {
    tone: 'info',
    Icon: CalendarDays,
    label: '计划提醒',
    title: '8 月 12 日复查心脏超声',
    detail: '与第 6 周期评估同步，已加入随访计划。',
  },
] satisfies readonly {
  tone: SemanticTone
  Icon: LucideIcon
  label: string
  title: string
  detail: string
}[]

const timelineItems: readonly TimelineItem[] = [
  {
    date: '2026.03.18',
    title: '启动 T-DXd 治疗',
    detail: '5.4 mg/kg，21 天一周期；基线 LVEF 65%。',
    status: '治疗启动',
  },
  {
    date: '2026.05.09',
    title: '第 3 周期疗效评估',
    detail: '靶病灶较基线缩小 24%，总体耐受可控。',
    status: '部分缓解',
  },
  {
    date: '2026.07.24',
    title: '完成第 5 周期',
    detail: '白细胞轻度下降；肝功能稳定，继续当前方案。',
    status: '当前节点',
    current: true,
  },
]

function FireflyMark() {
  return (
    <span aria-hidden="true" className="ff-v4-mark">
      <span className="ff-v4-mark-core" />
      <span className="ff-v4-mark-wing ff-v4-mark-wing-left" />
      <span className="ff-v4-mark-wing ff-v4-mark-wing-right" />
    </span>
  )
}

function EvaluationBar({
  direction,
  mode,
  onDirectionChange,
  onModeChange,
}: {
  direction: DesignDirection
  mode: PreviewMode
  onDirectionChange: (next: DesignDirection) => void
  onModeChange: (next: PreviewMode) => void
}) {
  return (
    <header className="ff-v4-evaluation-bar">
      <div className="ff-v4-evaluation-intro">
        <div className="ff-v4-evaluation-kicker">
          <Sparkles aria-hidden="true" size={14} />
          V4 DESIGN REVIEW
        </div>
        <div>
          <strong>同一页面 · 三种视觉系统</strong>
          <span>预览使用虚构静态数据，不是正式产品页面</span>
        </div>
      </div>

      <div aria-label="设计方向" className="ff-v4-direction-control" role="group">
        {DESIGN_PREVIEW_DIRECTIONS.map((item) => (
          <button
            aria-pressed={item.id === direction}
            className="ff-v4-direction-button"
            key={item.id}
            onClick={() => onDirectionChange(item.id)}
            type="button"
          >
            <span className="ff-v4-direction-code">{item.code}</span>
            <span>
              <strong>{item.name}</strong>
              <small>{item.englishName}</small>
            </span>
            {item.recommended ? <em>推荐</em> : null}
          </button>
        ))}
      </div>

      <div className="ff-v4-evaluation-actions">
        <div aria-label="预览材质" className="ff-v4-mode-control" role="group">
          <button aria-label="Light 材质" aria-pressed={mode === 'light'} onClick={() => onModeChange('light')} type="button">
            <Sun aria-hidden="true" size={16} />
          </button>
          <button aria-label="Dark 材质" aria-pressed={mode === 'dark'} onClick={() => onModeChange('dark')} type="button">
            <Moon aria-hidden="true" size={16} />
          </button>
        </div>
        <a className="ff-v4-back-link" href="/login">
          返回当前产品
          <ArrowUpRight aria-hidden="true" size={15} />
        </a>
      </div>
    </header>
  )
}

function Sidebar() {
  const navItems = [
    { Icon: LayoutDashboard, label: '总览', active: true },
    { Icon: FileText, label: '病历' },
    { Icon: ChartNoAxesCombined, label: '指标' },
    { Icon: BookOpenText, label: '随访' },
  ]

  return (
    <aside className="ff-v4-sidebar">
      <div className="ff-v4-brand-lockup">
        <FireflyMark />
        <span>
          <strong>一页萤屿</strong>
          <small>Firefly Isle</small>
        </span>
      </div>

      <nav aria-label="预览主导航" className="ff-v4-nav">
        {navItems.map(({ Icon, active, label }) => (
          <div aria-current={active ? 'page' : undefined} className="ff-v4-nav-item" key={label}>
            <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      <div className="ff-v4-sidebar-patient">
        <span className="ff-v4-avatar">林</span>
        <span>
          <strong>林予安</strong>
          <small>当前病历</small>
        </span>
        <ChevronRight aria-hidden="true" size={16} />
      </div>

      <div className="ff-v4-sidebar-foot">
        <ShieldCheck aria-hidden="true" size={16} />
        <span>本地评估数据<br />不连接患者数据库</span>
      </div>
    </aside>
  )
}

function ProductTopbar() {
  return (
    <div className="ff-v4-product-topbar">
      <div>
        <span className="ff-v4-overline">PATIENT OVERVIEW · 2026.07.30</span>
        <strong>治疗与指标总览</strong>
      </div>
      <div className="ff-v4-topbar-actions">
        <button aria-label="搜索" type="button"><Search aria-hidden="true" size={18} /></button>
        <button aria-label="通知，1 条待处理" className="ff-v4-notification-button" type="button">
          <Bell aria-hidden="true" size={18} />
          <span aria-hidden="true" />
        </button>
        <span className="ff-v4-account-chip"><UserRound aria-hidden="true" size={16} />设计评估</span>
      </div>
    </div>
  )
}

function PatientState() {
  const facts = [
    ['年龄', '42 岁'],
    ['分期', 'IIIB'],
    ['HER2', 'IHC 3+'],
    ['ECOG', '1'],
  ]

  return (
    <section aria-labelledby="ff-v4-patient-title" className="ff-v4-patient-state">
      <div className="ff-v4-patient-copy">
        <span className="ff-v4-section-index">01 · PATIENT STATE</span>
        <div className="ff-v4-patient-heading">
          <div>
            <p>当前患者</p>
            <h1 id="ff-v4-patient-title">林予安</h1>
          </div>
          <span className="ff-v4-demo-badge">虚构静态数据</span>
        </div>
        <p className="ff-v4-diagnosis">HER2 阳性乳腺癌 · 右乳浸润性导管癌 · IIIB 期</p>
        <div className="ff-v4-facts">
          {facts.map(([label, value]) => (
            <span key={label}><small>{label}</small><strong>{value}</strong></span>
          ))}
        </div>
      </div>

      <div className="ff-v4-current-treatment">
        <div className="ff-v4-treatment-icon"><Stethoscope aria-hidden="true" size={21} /></div>
        <div>
          <span>当前治疗</span>
          <strong>T-DXd · 第 5 周期</strong>
          <small>5.4 mg/kg · 21 天一周期</small>
        </div>
        <div className="ff-v4-treatment-status"><CircleCheck aria-hidden="true" size={15} />方案进行中</div>
      </div>

      <div className="ff-v4-next-review">
        <CalendarDays aria-hidden="true" size={20} />
        <div>
          <span>下一次综合复查</span>
          <strong>2026 年 8 月 12 日</strong>
          <small>血常规 · 肝肾功能 · 心脏超声</small>
        </div>
      </div>
    </section>
  )
}

function AttentionSummary() {
  return (
    <section aria-labelledby="ff-v4-attention-title" className="ff-v4-section">
      <div className="ff-v4-section-heading">
        <div>
          <span className="ff-v4-section-index">02 · ATTENTION</span>
          <h2 id="ff-v4-attention-title">今天先看这三件事</h2>
        </div>
        <span className="ff-v4-section-note">按临床阅读优先级排序</span>
      </div>
      <div className="ff-v4-attention-grid">
        {attentionItems.map(({ Icon, detail, label, title, tone }) => (
          <article className="ff-v4-attention-card" data-tone={tone} key={title}>
            <div className="ff-v4-attention-icon"><Icon aria-hidden="true" size={19} strokeWidth={1.8} /></div>
            <div>
              <span>{label}</span>
              <h3>{title}</h3>
              <p>{detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function buildChart(values: number[]) {
  const width = 620
  const height = 220
  const xPadding = 26
  const yPadding = 24
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(max - min, 1)
  const points = values.map((value, index) => {
    const x = xPadding + (index / Math.max(values.length - 1, 1)) * (width - xPadding * 2)
    const y = height - yPadding - ((value - min) / span) * (height - yPadding * 2)
    return { x, y, value }
  })

  return {
    points,
    linePath: points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' '),
    areaPath: `${points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')} L ${points[points.length - 1].x.toFixed(1)} ${height - yPadding} L ${points[0].x.toFixed(1)} ${height - yPadding} Z`,
  }
}

function MetricChart({ metric }: { metric: MetricDefinition }) {
  const chart = buildChart(metric.values)

  return (
    <div className="ff-v4-chart-wrap">
      <svg aria-label={`${metric.longLabel} 最近六次趋势`} className="ff-v4-chart" role="img" viewBox="0 0 620 220">
        <defs>
          <linearGradient id={`ff-v4-chart-fill-${metric.id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.24" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[44, 88, 132, 176].map((y) => <line className="ff-v4-chart-grid" key={y} x1="24" x2="596" y1={y} y2={y} />)}
        <path className="ff-v4-chart-area" d={chart.areaPath} fill={`url(#ff-v4-chart-fill-${metric.id})`} />
        <path className="ff-v4-chart-line" d={chart.linePath} />
        {chart.points.map((point, index) => (
          <g key={`${metric.id}-${metric.dates[index]}`}>
            <circle className="ff-v4-chart-point" cx={point.x} cy={point.y} r={index === chart.points.length - 1 ? 5.5 : 3.5} />
            <text className="ff-v4-chart-date" textAnchor="middle" x={point.x} y="214">{metric.dates[index]}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function MetricWorkbench({ selectedMetric, onMetricChange }: { selectedMetric: MetricId; onMetricChange: (metric: MetricId) => void }) {
  const metric = metrics[selectedMetric]

  return (
    <section aria-labelledby="ff-v4-metrics-title" className="ff-v4-section ff-v4-metric-section">
      <div className="ff-v4-section-heading">
        <div>
          <span className="ff-v4-section-index">03 · LAB SIGNALS</span>
          <h2 id="ff-v4-metrics-title">指标浏览与当前趋势</h2>
        </div>
        <span className="ff-v4-section-note"><TestTube2 aria-hidden="true" size={15} /> 最近更新 2026.07.24</span>
      </div>

      <div className="ff-v4-metric-workbench">
        <div aria-label="指标选择" className="ff-v4-metric-list" role="group">
          <div className="ff-v4-metric-list-heading">
            <span>核心指标</span>
            <strong>4 项</strong>
          </div>
          {(Object.values(metrics) as MetricDefinition[]).map((item) => (
            <button
              aria-pressed={item.id === selectedMetric}
              className="ff-v4-metric-row"
              data-tone={item.tone}
              key={item.id}
              onClick={() => onMetricChange(item.id)}
              type="button"
            >
              <span className="ff-v4-metric-status-dot" />
              <span className="ff-v4-metric-label"><strong>{item.label}</strong><small>{item.longLabel}</small></span>
              <span className="ff-v4-metric-reading"><strong>{item.current}</strong><small>{item.unit}</small></span>
              <ChevronRight aria-hidden="true" size={16} />
            </button>
          ))}
          <div className="ff-v4-metric-list-foot"><Activity aria-hidden="true" size={15} /> 所有变化均为辅助提示</div>
        </div>

        <article className="ff-v4-metric-detail" data-tone={metric.tone} key={metric.id}>
          <div className="ff-v4-metric-detail-header">
            <div>
              <span>{metric.longLabel}</span>
              <h3>{metric.label}</h3>
            </div>
            <span className="ff-v4-status-pill"><span />{metric.status}</span>
          </div>

          <div className="ff-v4-reading-summary">
            <div className="ff-v4-current-reading">
              <span>当前结果</span>
              <strong>{metric.current}</strong>
              <small>{metric.unit}</small>
            </div>
            <div><span>较 4 月</span><strong>{metric.delta}</strong></div>
            <div><span>参考范围</span><strong>{metric.range}</strong><small>{metric.unit}</small></div>
          </div>

          <MetricChart metric={metric} />

          <div className="ff-v4-metric-interpretation">
            <HeartPulse aria-hidden="true" size={19} />
            <div><span>趋势说明</span><p>{metric.summary}</p></div>
          </div>
        </article>
      </div>
    </section>
  )
}

function TreatmentTimeline() {
  return (
    <section aria-labelledby="ff-v4-timeline-title" className="ff-v4-section ff-v4-timeline-section">
      <div className="ff-v4-section-heading">
        <div>
          <span className="ff-v4-section-index">04 · TREATMENT TRACE</span>
          <h2 id="ff-v4-timeline-title">最近治疗节点</h2>
        </div>
        <span className="ff-v4-section-note"><Clock3 aria-hidden="true" size={15} /> 仅展示支持当前判断的节点</span>
      </div>

      <div className="ff-v4-timeline">
        {timelineItems.map((item, index) => (
          <article className="ff-v4-timeline-item" data-current={item.current ? 'true' : undefined} key={item.date}>
            <div className="ff-v4-timeline-marker"><span>{String(index + 1).padStart(2, '0')}</span></div>
            <time>{item.date}</time>
            <div>
              <span>{item.status}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function SecondaryActions() {
  const actions = [
    { Icon: Share2, label: '创建只读分享' },
    { Icon: Download, label: '导出 PDF / PNG' },
    { Icon: History, label: '查看审计记录' },
  ]

  return (
    <footer className="ff-v4-secondary-actions">
      <div>
        <ShieldCheck aria-hidden="true" size={18} />
        <span><strong>辅助动作保持次级</strong><small>分享、导出与审计不抢占临床首屏</small></span>
      </div>
      <div>
        {actions.map(({ Icon, label }) => (
          <button disabled key={label} type="button"><Icon aria-hidden="true" size={16} />{label}</button>
        ))}
      </div>
    </footer>
  )
}

export function DesignPreviewPage() {
  const [direction, setDirection] = useState<DesignDirection>('calm')
  const [mode, setMode] = useState<PreviewMode>('light')
  const [selectedMetric, setSelectedMetric] = useState<MetricId>('ca153')
  const activeDirection = DESIGN_PREVIEW_DIRECTIONS.find((item) => item.id === direction) ?? DESIGN_PREVIEW_DIRECTIONS[0]

  return (
    <main className="ff-v4-preview" data-direction={direction} data-mode={mode}>
      <EvaluationBar direction={direction} mode={mode} onDirectionChange={setDirection} onModeChange={setMode} />

      <section aria-live="polite" className="ff-v4-direction-summary">
        <span>{activeDirection.code}</span>
        <div>
          <strong>{activeDirection.englishName} / {activeDirection.name}</strong>
          <p>{activeDirection.thesis}</p>
        </div>
        <small><b>Trade-off</b>{activeDirection.risk}</small>
      </section>

      <div className="ff-v4-product-shell" key={`${direction}-${mode}`}>
        <Sidebar />
        <div className="ff-v4-main-column">
          <ProductTopbar />
          <div className="ff-v4-content">
            <PatientState />
            <AttentionSummary />
            <MetricWorkbench onMetricChange={setSelectedMetric} selectedMetric={selectedMetric} />
            <TreatmentTimeline />
            <SecondaryActions />
          </div>
        </div>
      </div>

      <span aria-hidden="true" className="ff-v4-candidate-watermark" style={{ '--ff-v4-watermark': `'${activeDirection.code}'` } as CSSProperties} />
    </main>
  )
}
