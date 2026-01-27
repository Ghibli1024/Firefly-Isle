/**
 * [INPUT]: 依赖 react, @/lib/utils
 * [OUTPUT]: 对外提供 Card 系列组件 (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction)
 * [POS]: ui/ 的卡片容器组件，微拟物光影质感设计
 * [VARIANTS]: default(凸起), inset(内凹), elevated(高凸起)
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ========================================================================
   卡片样式配置 - 凸起/内凹效果
   ======================================================================== */

const CARD_STYLES = {
  default: {
    background: 'linear-gradient(135deg, var(--card) 0%, color-mix(in srgb, var(--card) 95%, black) 100%)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.05)',
  },
  elevated: {
    background: 'linear-gradient(135deg, var(--card) 0%, color-mix(in srgb, var(--card) 92%, black) 100%)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.08)',
  },
  inset: {
    background: 'linear-gradient(135deg, color-mix(in srgb, var(--card) 95%, black) 0%, var(--card) 100%)',
    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.5)',
  },
}

const cardVariants = cva(
  [
    "text-card-foreground flex flex-col gap-6 py-6",
    "rounded-[20px] border-0",
    "transition-all duration-200",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "",
        elevated: "hover:scale-[1.01]",
        inset: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Card({
  className,
  variant = "default",
  style,
  ...props
}) {
  const styleConfig = CARD_STYLES[variant] || CARD_STYLES.default

  const combinedStyle = {
    background: styleConfig.background,
    boxShadow: styleConfig.boxShadow,
    ...style,
  }

  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(cardVariants({ variant }), className)}
      style={combinedStyle}
      {...props}
    />
  )
}

function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
