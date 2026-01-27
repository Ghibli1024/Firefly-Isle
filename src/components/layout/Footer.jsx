/**
 * [INPUT]: 依赖 react-router-dom 的 Link，依赖 @/components/ui 的 Separator
 * [OUTPUT]: 对外提供 Footer 组件
 * [POS]: layout/ 的底部信息区，承载版权信息与辅助链接
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'

/* ========================================================================
   Footer - 全局底部信息
   ======================================================================== */

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* ----------------------------------------------------------------
             品牌信息
             ---------------------------------------------------------------- */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-block">
              <span className="text-xl font-bold text-primary">Firefly Isle</span>
            </Link>
            <p className="mt-4 max-w-md text-muted-foreground">
              帮助肿瘤患者及家属构建完整的治疗时间线，
              让每一个治疗决策都有据可依。
            </p>
          </div>

          {/* ----------------------------------------------------------------
             快速链接
             ---------------------------------------------------------------- */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">快速链接</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground transition-colors hover:text-primary">
                  首页
                </Link>
              </li>
              <li>
                <Link to="/design-system" className="text-muted-foreground transition-colors hover:text-primary">
                  设计系统
                </Link>
              </li>
            </ul>
          </div>

          {/* ----------------------------------------------------------------
             支持
             ---------------------------------------------------------------- */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">支持</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-muted-foreground">使用帮助</span>
              </li>
              <li>
                <span className="text-muted-foreground">隐私政策</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* ----------------------------------------------------------------
           版权信息
           ---------------------------------------------------------------- */}
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>&copy; {currentYear} Firefly Isle. All rights reserved.</p>
          <p>Made with care for those who need it most.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
