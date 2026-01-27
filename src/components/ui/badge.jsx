/**
 * [INPUT]: 依赖 react, @radix-ui/react-slot, class-variance-authority, @/lib/utils
 * [OUTPUT]: 对外提供 Badge 组件 + badgeVariants
 * [POS]: ui/ 的徽章标签组件，微拟物光影质感设计
 * [VARIANTS]: default, primary, destructive, accent, secondary, outline
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ========================================================================
   徽章样式配置 - 渐变 + 立体效果
   ======================================================================== */

const BADGE_STYLES = {
  default: {
    background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 100%)',
    boxShadow: '0 2px 6px color-mix(in srgb, var(--primary) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
  },
  primary: {
    background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 100%)',
    boxShadow: '0 2px 6px color-mix(in srgb, var(--primary) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
  },
  destructive: {
    background: 'linear-gradient(135deg, var(--destructive) 0%, color-mix(in srgb, var(--destructive) 85%, black) 100%)',
    boxShadow: '0 2px 6px color-mix(in srgb, var(--destructive) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
  },
  accent: {
    background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 85%, black) 100%)',
    boxShadow: '0 2px 6px color-mix(in srgb, var(--accent) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
  },
  secondary: {
    background: 'linear-gradient(135deg, var(--secondary) 0%, color-mix(in srgb, var(--secondary) 90%, black) 100%)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.05)',
  },
  outline: {
    background: 'transparent',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
}

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center",
    "rounded-[16px] border-0 px-3 py-1",
    "text-xs font-medium",
    "whitespace-nowrap shrink-0",
    "transition-all duration-200",
    "[&>svg]:size-3 gap-1 [&>svg]:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        primary: "text-primary-foreground",
        destructive: "text-destructive-foreground",
        accent: "text-accent-foreground",
        secondary: "text-secondary-foreground",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  style,
  ...props
}) {
  const Comp = asChild ? Slot : "span"
  const styleConfig = BADGE_STYLES[variant] || BADGE_STYLES.default
  const needsCustomStyle = variant !== 'outline'

  const combinedStyle = needsCustomStyle ? {
    background: styleConfig.background,
    boxShadow: styleConfig.boxShadow,
    ...style,
  } : style

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      style={combinedStyle}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
