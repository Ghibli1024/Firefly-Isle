/**
 * [INPUT]: 无运行时外部依赖，承载 Firefly-Isle 主题 token 真相源。
 * [OUTPUT]: 对外提供 themeNames、ThemeName、themeTokens、壳层几何常量与过渡类常量。
 * [POS]: src/lib/theme 的 token 定义文件，统一 dark/light 的颜色、surface、文字、边框、状态与几何合同。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export const themeNames = ['dark', 'light'] as const

export type ThemeName = (typeof themeNames)[number]

export const sidebarWidthClass = 'w-64'
export const sidebarOffsetClass = 'md:ml-64'
export const shellViewportOffsetClass = 'md:left-64 md:w-[calc(100%-16rem)]'
export const shellContentWidthClass = 'mx-auto w-full max-w-6xl'
export const topBarHeightClass = 'h-16'
export const topBarOffsetClass = 'pt-16'
export const themeTransitionClass = 'transition-[background-color,color,border-color,box-shadow] duration-200 ease-out'

export const themeTokens = {
  dark: {
    accent: {
      primary: '#FF3D00',
      success: '#9CCC65',
      warning: '#FF8A65',
    },
    border: {
      default: '#262626',
      muted: '#353534',
      strong: '#7A1F00',
    },
    surface: {
      accent: '#1A1A1A',
      base: '#0A0A0A',
      inset: '#0F0F0F',
      panel: '#131313',
      paper: '#FFFFFF',
      paperMuted: '#F0F0F0',
      shell: '#0A0A0A',
      sidebar: '#0A0A0A',
      soft: '#1A1A1A',
      warning: '#1A1A1A',
    },
    text: {
      ink: '#0A0A0A',
      muted: '#666666',
      primary: '#FAFAFA',
      secondary: 'rgba(250,250,250,0.7)',
      subtle: 'rgba(250,250,250,0.88)',
    },
  },
  light: {
    accent: {
      primary: '#111111',
      soft: '#eeeeec',
      success: '#205d38',
      warning: '#ba1a1a',
    },
    border: {
      default: '#111111',
      muted: 'rgba(17,17,17,0.1)',
      strong: '#ba1a1a',
    },
    surface: {
      accent: '#F3F0E9',
      base: '#F9F9F7',
      inset: '#F4F4F2',
      panel: '#FFFFFF',
      paper: '#FFFFFF',
      paperMuted: '#EEEEEC',
      shell: '#F9F9F7',
      sidebar: '#F9F9F7',
      soft: '#F3F0E9',
      subtle: '#F4F4F2',
      warning: '#FFF1EC',
    },
    text: {
      ink: '#0A0A0A',
      muted: '#5d5f5b',
      primary: '#111111',
      secondary: 'rgba(17,17,17,0.7)',
      subtle: 'rgba(17,17,17,0.82)',
    },
  },
} as const
