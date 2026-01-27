/**
 * [INPUT]: 依赖 react 的核心能力
 * [OUTPUT]: 对外提供 App 根组件
 * [POS]: src/ 的应用根组件，承载全局布局与路由
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">Firefly Isle</h1>
    </div>
  )
}

export default App
