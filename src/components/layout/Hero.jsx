/**
 * [INPUT]: 依赖 @/components/ui 的 Button/Badge/Card
 * [OUTPUT]: 对外提供 Hero 组件
 * [POS]: layout/ 的首屏展示区，承载核心价值主张与行动号召
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

/* ========================================================================
   Hero - 首屏展示区
   ======================================================================== */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-32">
      {/* ----------------------------------------------------------------
         背景装饰
         ---------------------------------------------------------------- */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          {/* ----------------------------------------------------------------
             标签
             ---------------------------------------------------------------- */}
          <Badge variant="secondary" className="mb-4">
            肿瘤治疗时间线管理
          </Badge>

          {/* ----------------------------------------------------------------
             主标题
             ---------------------------------------------------------------- */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            记录每一个
            <span className="text-primary">治疗时刻</span>
          </h1>

          {/* ----------------------------------------------------------------
             副标题
             ---------------------------------------------------------------- */}
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Firefly Isle 帮助您构建完整的肿瘤治疗时间线，
            清晰记录每次检查、用药和治疗过程，让医疗决策更有依据。
          </p>

          {/* ----------------------------------------------------------------
             行动按钮
             ---------------------------------------------------------------- */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg">立即开始</Button>
            <Button variant="outline" size="lg">
              了解更多
            </Button>
          </div>
        </div>

        {/* ----------------------------------------------------------------
           特性卡片
           ---------------------------------------------------------------- */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">时间线管理</h3>
              <p className="text-muted-foreground">
                可视化治疗历程，一目了然
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">数据追踪</h3>
              <p className="text-muted-foreground">
                记录检查结果，追踪指标变化
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/50">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">隐私安全</h3>
              <p className="text-muted-foreground">
                本地存储，数据完全由您掌控
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default Hero
