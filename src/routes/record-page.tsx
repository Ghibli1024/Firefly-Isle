/**
 * [INPUT]: 依赖 react-router-dom 的 useParams，依赖 AppShell、ShellSectionHeading、ShellKpiCard 与 Button。
 * [OUTPUT]: 对外提供 RecordPage 组件，对应 /record/:id。
 * [POS]: routes 的档案详情骨架，预留患者概览、时间线主表与导出操作位。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Button } from '@/components/ui/button'
import { AppShell, ShellKpiCard, ShellSectionHeading } from '@/components/app-shell'
import { useParams } from 'react-router-dom'

const timelinePreview = [
  { label: 'Basic info', content: '女性 / 61 岁 / 肺腺癌 / IV 期' },
  { label: 'Initial onset', content: '2023-06 · 奥希替尼 · EGFR 19del' },
  { label: 'Line 1', content: '2024-11 ~ 2025-02 · 培美曲塞 + 卡铂' },
]

export function RecordPage() {
  const { id = 'demo' } = useParams()

  return (
    <AppShell
      eyebrow="Record detail / Web"
      title="在一张表里看清治疗演进，再决定哪里需要补充。"
      description="档案详情骨架对应最终时间线页面：左侧仍保留导航，中间聚焦病程表格，右侧预留导出、缺失字段与元信息。"
      aside={
        <div className="space-y-4">
          <ShellKpiCard label="Critical blanks" value="3" hint="后续会高亮 tumorType、stage、regimen 等关键缺失字段。" />
          <ShellKpiCard label="Export targets" value="PDF / PNG" hint="导出入口位于详情页右侧，不散落到局部组件。" />
        </div>
      }
    >
      <section className="space-y-5 border border-border/70 bg-card-strong px-5 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <ShellSectionHeading
            label={`Record ${id}`}
            title="患者治疗时间线"
            description="这一版先落块级结构：基础信息、初发区块、治疗线区块与导出按钮。真实字段渲染与 inline edit 在后续阶段进入。"
          />
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-none px-5 py-5">
              导出 PNG
            </Button>
            <Button className="rounded-none bg-accent px-5 py-5 text-accent-foreground hover:bg-accent/90">
              导出 PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          {timelinePreview.map((row) => (
            <div key={row.label} className="grid gap-2 border-t border-border/70 py-4 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-4">
              <span className="ff-label">{row.label}</span>
              <p className="text-sm leading-7 text-foreground/90">{row.content}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  )
}
