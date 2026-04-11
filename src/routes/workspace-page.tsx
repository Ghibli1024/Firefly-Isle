/**
 * [INPUT]: 依赖 AppShell、ShellSectionHeading、ShellKpiCard 与 Button。
 * [OUTPUT]: 对外提供 WorkspacePage 组件，对应 /app。
 * [POS]: routes 的临床工作区骨架，承载文本输入区、提取状态与患者列表留白。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Button } from '@/components/ui/button'
import { AppShell, ShellKpiCard, ShellSectionHeading } from '@/components/app-shell'

const draftPatients = [
  { name: '王女士 / 肺腺癌', state: '待补充分期', updatedAt: '今日 09:24' },
  { name: '陈先生 / 结直肠癌', state: '准备导出', updatedAt: '昨日 21:10' },
  { name: '匿名患者 / 乳腺癌', state: '追问第 1 轮', updatedAt: '昨日 17:42' },
]

export function WorkspacePage() {
  return (
    <AppShell
      eyebrow="Clinical workspace / Web"
      title="把自然语言输入，压缩成医生能一眼读完的治疗脉络。"
      description="工作区骨架聚焦三件事：输入病情、看到提取状态、进入某个档案详情。等信息提取链路接上后，这里就是主工作台。"
      aside={
        <div className="space-y-4">
          <ShellKpiCard label="Clarification rounds" value="≤ 3" hint="同轮缺失字段合并追问，避免把用户拖入碎片问答。" />
          <ShellKpiCard label="Storage mode" value="Supabase" hint="后续保存 patients 与 treatment_lines，匿名和登录态都复用这条边界。" />
        </div>
      }
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.8fr)]">
        <div className="space-y-5 border border-border/70 bg-card-strong px-5 py-6">
          <ShellSectionHeading
            label="Natural-language intake"
            title="在一块大画布里输入病情原文。"
            description="布局映射自 Stitch 的 Web 工作区：左侧是导航脊柱，中间是主画布，右侧保留系统状态与 AI 置信信息。"
          />
          <textarea
            className="min-h-[18rem] w-full resize-none border border-border/70 bg-background/60 p-4 text-sm leading-7 outline-none transition-colors focus:border-accent"
            placeholder="例如：2023 年 6 月确诊肺腺癌，EGFR 19del，先做奥希替尼，2024 年 11 月进展后改培美曲塞+卡铂……"
          />
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-none bg-accent px-5 py-5 text-accent-foreground hover:bg-accent/90">
              开始提取
            </Button>
            <Button variant="outline" className="rounded-none px-5 py-5">
              载入示例文本
            </Button>
          </div>
        </div>

        <div className="space-y-4 border border-border/70 bg-card-strong px-5 py-6">
          <ShellSectionHeading
            label="Recent records"
            title="最近工作记录"
            description="这里先用静态卡片占位。后续会挂真实患者列表与最近更新时间。"
          />
          <div className="space-y-3">
            {draftPatients.map((patient) => (
              <div key={patient.name} className="border border-border/70 bg-background/40 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{patient.name}</p>
                  <span className="ff-label">{patient.updatedAt}</span>
                </div>
                <p className="mt-3 text-sm text-muted">{patient.state}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  )
}
