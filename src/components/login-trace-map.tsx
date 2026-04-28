/**
 * [INPUT]: 依赖 @/lib/theme 的 Theme 类型，依赖 public/login/blue-tears-background-dark.png 与 public/login/wind-field-background-light.png 双主题扁平背景资产。
 * [OUTPUT]: 对外提供 LoginTraceMap 组件，渲染登录页干净的双主题海岸背景层。
 * [POS]: components 的登录页全屏视觉模块，作为 login-page-view 的明暗主题背景，不承载额外节点、tooltip 或业务操作。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { Theme } from '@/lib/theme'

type Locale = 'zh' | 'en'

type TraceMapSkin = {
  atmosphereTone: string
  backgroundTone: string
}

const traceBackgroundByTheme: Record<Theme, string> = {
  dark: '/login/blue-tears-background-dark.png',
  light: '/login/wind-field-background-light.png',
}

const traceMapSkins: Record<Theme, TraceMapSkin> = {
  dark: {
    atmosphereTone: 'bg-[linear-gradient(180deg,rgba(3,9,11,0.06)_0%,rgba(3,9,11,0.12)_58%,rgba(3,9,11,0.72)_100%)]',
    backgroundTone: 'bg-[linear-gradient(90deg,#03090b_0%,rgba(3,9,11,0.88)_25%,rgba(3,9,11,0.48)_53%,rgba(3,9,11,0.1)_78%,rgba(3,9,11,0.3)_100%)]',
  },
  light: {
    atmosphereTone: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.36)_0%,rgba(255,255,255,0.12)_48%,rgba(238,247,248,0.46)_100%)]',
    backgroundTone: 'bg-[linear-gradient(90deg,rgba(248,251,250,0.94)_0%,rgba(248,251,250,0.76)_34%,rgba(248,251,250,0.22)_67%,rgba(248,251,250,0.05)_100%)]',
  },
}

export function LoginTraceMap({ locale, theme }: { locale: Locale; theme: Theme }) {
  const skin = traceMapSkins[theme]

  return (
    <div
      aria-label={locale === 'zh' ? '登录页主题海岸背景' : 'Themed login coast backdrop'}
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
      data-testid="login-trace-map"
    >
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center opacity-100"
        draggable={false}
        src={traceBackgroundByTheme[theme]}
      />
      <div className={`absolute inset-0 ${skin.backgroundTone}`} />
      <div className={`absolute inset-0 ${skin.atmosphereTone}`} />
    </div>
  )
}
