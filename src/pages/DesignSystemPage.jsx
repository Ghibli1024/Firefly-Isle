/**
 * [INPUT]: 依赖 @/components/ui 的 Button/Badge/Card/Separator/Tooltip/Input
 * [OUTPUT]: 对外提供 DesignSystemPage 组件
 * [POS]: pages/ 的设计系统展示页，演示微拟物光影质感组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/* ========================================================================
   DesignSystemPage - 设计系统展示
   ======================================================================== */

function DesignSystemPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      {/* ----------------------------------------------------------------
         页面标题
         ---------------------------------------------------------------- */}
      <div className="mb-12">
        <Badge variant="outline" className="mb-4">Design System</Badge>
        <h1 className="text-4xl font-bold text-foreground">设计系统</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Firefly Isle 的微拟物光影质感设计系统。一切设计必须来自设计系统的颜色和组件。
        </p>
      </div>

      {/* ================================================================
         设计语言说明
         ================================================================ */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-foreground">设计语言</h2>
        <Card variant="inset">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-semibold text-foreground mb-2">渐变背景</h4>
                <p className="text-sm text-muted-foreground">
                  三段式渐变：亮 → 中 → 暗，使用 color-mix 派生
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">立体阴影</h4>
                <p className="text-sm text-muted-foreground">
                  三层结构：外投影 + 顶部高光 + 底部暗边
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">微交互</h4>
                <p className="text-sm text-muted-foreground">
                  hover: scale(1.02)，active: scale(0.97)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      {/* ================================================================
         颜色令牌
         ================================================================ */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-foreground">颜色令牌</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ColorSwatch name="Primary" className="bg-primary" textClass="text-primary-foreground" />
          <ColorSwatch name="Secondary" className="bg-secondary" textClass="text-secondary-foreground" />
          <ColorSwatch name="Accent" className="bg-accent" textClass="text-accent-foreground" />
          <ColorSwatch name="Muted" className="bg-muted" textClass="text-muted-foreground" />
          <ColorSwatch name="Destructive" className="bg-destructive" textClass="text-destructive-foreground" />
          <ColorSwatch name="Background" className="bg-background border" textClass="text-foreground" />
          <ColorSwatch name="Card" className="bg-card border" textClass="text-card-foreground" />
          <ColorSwatch name="Input" className="bg-input border" textClass="text-foreground" />
        </div>
      </section>

      <Separator className="my-12" />

      {/* ================================================================
         Button 组件 - 微拟物升级
         ================================================================ */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-foreground">Button - 微拟物光影</h2>

        <div className="space-y-8">
          {/* 变体 */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-foreground">变体</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          {/* 尺寸 */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-foreground">尺寸</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>

          {/* 状态 */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-foreground">状态</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-12" />

      {/* ================================================================
         Card 组件 - 微拟物升级
         ================================================================ */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-foreground">Card - 凸起/内凹效果</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default 凸起</CardTitle>
              <CardDescription>标准卡片效果</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">外投影 + 顶部高光营造凸起质感</p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated 高凸起</CardTitle>
              <CardDescription>强调卡片效果</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">更强的阴影层次，hover 微放大</p>
            </CardContent>
          </Card>

          <Card variant="inset">
            <CardHeader>
              <CardTitle>Inset 内凹</CardTitle>
              <CardDescription>嵌入式效果</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">inset 阴影营造凹陷质感</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-12" />

      {/* ================================================================
         Badge 组件 - 微拟物升级
         ================================================================ */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-foreground">Badge - 渐变立体</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      <Separator className="my-12" />

      {/* ================================================================
         Input 组件 - 微拟物升级
         ================================================================ */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-foreground">Input - 内凹效果</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Default 内凹</label>
            <Input placeholder="输入文本..." variant="default" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Elevated 浮起</label>
            <Input placeholder="输入文本..." variant="elevated" />
          </div>
        </div>
      </section>

      <Separator className="my-12" />

      {/* ================================================================
         Tooltip 组件
         ================================================================ */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-foreground">Tooltip</h2>
        <TooltipProvider>
          <div className="flex flex-wrap gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">悬停查看提示</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>这是一个工具提示</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </section>

      <Separator className="my-12" />

      {/* ================================================================
         圆角规范
         ================================================================ */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-foreground">圆角规范</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="p-4 bg-muted rounded-[16px] text-center">
            <span className="text-sm font-medium">sm: 16px</span>
          </div>
          <div className="p-4 bg-muted rounded-[20px] text-center">
            <span className="text-sm font-medium">default: 20px</span>
          </div>
          <div className="p-4 bg-muted rounded-[24px] text-center">
            <span className="text-sm font-medium">lg: 24px</span>
          </div>
          <div className="p-4 bg-muted rounded-[32px] text-center">
            <span className="text-sm font-medium">xl: 32px</span>
          </div>
        </div>
      </section>
    </main>
  )
}

/* ========================================================================
   ColorSwatch - 颜色色板展示
   ======================================================================== */

function ColorSwatch({ name, className, textClass }) {
  return (
    <div className={`rounded-[20px] p-6 ${className}`}>
      <span className={`font-medium ${textClass}`}>{name}</span>
    </div>
  )
}

export default DesignSystemPage
