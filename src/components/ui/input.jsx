/**
 * [INPUT]: 依赖 react, @/lib/utils
 * [OUTPUT]: 对外提供 Input 组件
 * [POS]: ui/ 的输入框组件，微拟物内凹效果设计
 * [VARIANTS]: default(内凹), elevated(浮起)
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ========================================================================
   输入框样式配置 - 内凹效果
   ======================================================================== */

const INPUT_STYLES = {
  default: {
    background: 'linear-gradient(180deg, color-mix(in srgb, var(--input) 95%, black) 0%, var(--input) 100%)',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08), inset 0 1px 2px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.5)',
    focusBoxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 0 0 2px color-mix(in srgb, var(--ring) 30%, transparent)',
  },
  elevated: {
    background: 'linear-gradient(180deg, var(--background) 0%, color-mix(in srgb, var(--background) 98%, black) 100%)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.03)',
    focusBoxShadow: '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 2px color-mix(in srgb, var(--ring) 30%, transparent)',
  },
}

const inputVariants = cva(
  [
    "flex h-10 w-full px-4 py-2",
    "rounded-[16px] border-0",
    "text-base text-foreground",
    "placeholder:text-muted-foreground",
    "transition-all duration-200",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "md:text-sm",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "",
        elevated: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Input({
  className,
  type,
  variant = "default",
  style,
  ...props
}) {
  const [isFocused, setIsFocused] = React.useState(false)
  const styleConfig = INPUT_STYLES[variant] || INPUT_STYLES.default

  const combinedStyle = {
    background: styleConfig.background,
    boxShadow: isFocused ? styleConfig.focusBoxShadow : styleConfig.boxShadow,
    outline: 'none',
    ...style,
  }

  return (
    <input
      type={type}
      data-slot="input"
      data-variant={variant}
      className={cn(inputVariants({ variant }), className)}
      style={combinedStyle}
      onFocus={(e) => { setIsFocused(true); props.onFocus?.(e) }}
      onBlur={(e) => { setIsFocused(false); props.onBlur?.(e) }}
      {...props}
    />
  )
}

export { Input, inputVariants }
