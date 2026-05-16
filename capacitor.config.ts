/**
 * [INPUT]: 依赖 Capacitor 8 的 CapacitorConfig 类型、Vite production build 输出目录 dist。
 * [OUTPUT]: 对外提供 Firefly-Isle iOS/Android 原生壳配置。
 * [POS]: 仓库根级 Capacitor 配置，约束移动壳只包装现有 Web app，不引入第二套路由或本地医疗数据源。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.ghibli1024.fireflyisle',
  appName: '一页萤屿',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
