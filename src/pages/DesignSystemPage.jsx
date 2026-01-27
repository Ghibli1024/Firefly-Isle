/**
 * [INPUT]: 依赖 @/components/ui 的 Button/Badge/Card/Separator/Tooltip
 * [OUTPUT]: 对外提供 DesignSystemPage 组件
 * [POS]: pages/ 的设计系统展示页，演示所有可用组件与设计令牌
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
          Firefly Isle 的设计令牌与组件库。一切设计必须来自设计系统的颜色和组件。
        </p>
      </div>

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
          <ColorSwatch name="Popover" className="bg-popover border" textClass="text-popover-foreground" />
        </div>
      </section>

      <Separator className="my-12" />

      {/* ================================================================
         Button 组件
         ================================================================ */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-foreground">Button</h2>

        <div className="space-y-8">
          {/* 变体 */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-foreground">变体</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
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
              <Button size="lg">Large</Button>
              <Button size="icon">🔥</Button>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-12" />

      {/* ================================================================
         Badge 组件
         ================================================================ */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-foreground">Badge</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      <Separator className="my-12" />

      {/* ================================================================
         Card 组件
         ================================================================ */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-foreground">Card</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>卡片标题</CardTitle>
              <CardDescription>卡片描述信息</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">卡片内容区域</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>交互卡片</CardTitle>
              <CardDescription>带有操作按钮</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">卡片可以包含任何组件</p>
              <Button size="sm">操作按钮</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>状态卡片</CardTitle>
              <CardDescription>展示状态标签</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge>进行中</Badge>
                <Badge variant="secondary">已完成</Badge>
              </div>
            </CardContent>
          </Card>
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
    </main>
  )
}

/* ========================================================================
   ColorSwatch - 颜色色板展示
   ======================================================================== */

function ColorSwatch({ name, className, textClass }) {
  return (
    <div className={`rounded-lg p-6 ${className}`}>
      <span className={`font-medium ${textClass}`}>{name}</span>
    </div>
  )
}

export default DesignSystemPage
