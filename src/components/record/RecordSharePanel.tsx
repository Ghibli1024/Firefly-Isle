/**
 * [INPUT]: 依赖 @/lib/record-sharing 的 RecordShare 类型与 @/lib/locale 的 Locale。
 * [OUTPUT]: 对外提供 RecordSharePanel 组件和 RecordSharePanelState，渲染创建、复制、查看、撤销、Demo 预览禁用态与过期/撤销状态。
 * [POS]: components/record 的分享管理展示层，由 record-page.tsx 注入真实分享状态或 Demo 预览状态和动作，不直接读取 Supabase。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { Locale } from '@/lib/locale'
import type { RecordShare } from '@/lib/record-sharing'

export type RecordSharePanelState = {
  createdUrl: string | null
  error: string | null
  isCreating: boolean
  isLoading: boolean
  revokingShareId: string | null
  shares: RecordShare[]
}

function getShareStatus(share: RecordShare, now = Date.now()) {
  if (share.revokedAt) {
    return 'revoked'
  }

  if (new Date(share.expiresAt).getTime() <= now) {
    return 'expired'
  }

  return 'active'
}

function formatDate(value: string, locale: Locale) {
  try {
    return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export function RecordSharePanel({
  locale,
  onCopyCreatedUrl,
  onCreateShare,
  onRevokeShare,
  previewNotice,
  state,
}: {
  locale: Locale
  onCopyCreatedUrl: () => void
  onCreateShare: () => void
  onRevokeShare: (shareId: string) => void
  previewNotice?: string
  state: RecordSharePanelState
}) {
  const copy = locale === 'zh'
    ? {
        active: '有效',
        copy: '复制链接',
        create: '创建 7 天只读分享',
        creating: '创建中...',
        empty: '还没有分享。创建后，授权链接只会显示一次；数据库只保存授权码 hash。',
        expired: '已过期',
        expires: '过期时间',
        linkReady: '分享链接已生成',
        loading: '读取分享中...',
        revoke: '撤销',
        revoked: '已撤销',
        title: '授权码分享',
        view: '查看分享',
      }
    : {
        active: 'Active',
        copy: 'Copy link',
        create: 'Create 7-day read-only share',
        creating: 'Creating...',
        empty: 'No shares yet. The authorization link is shown once; only the code hash is stored.',
        expired: 'Expired',
        expires: 'Expires',
        linkReady: 'Share link ready',
        loading: 'Loading shares...',
        revoke: 'Revoke',
        revoked: 'Revoked',
        title: 'Code Share',
        view: 'Open share',
      }

  return (
    <section className="mb-5 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-xl font-bold">{copy.title}</h3>
          <p className="mt-2 text-sm leading-7 text-[var(--ff-text-secondary)]">{copy.empty}</p>
        </div>
        <button
          className="t-control-press inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
          disabled={state.isCreating || Boolean(previewNotice)}
          onClick={onCreateShare}
          type="button"
        >
          <span className="material-symbols-outlined text-lg">ios_share</span>
          {state.isCreating ? copy.creating : copy.create}
        </button>
      </div>

      {previewNotice ? (
        <div className="mt-4 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-muted)] bg-[var(--ff-surface-inset)] px-4 py-3 text-sm font-semibold text-[var(--ff-text-secondary)]">
          {previewNotice}
        </div>
      ) : null}

      {state.error ? (
        <div className="mt-4 rounded-[var(--ff-radius-md)] border border-[var(--ff-accent-primary)] bg-[var(--ff-surface-warning)] px-4 py-3 text-sm font-semibold text-[var(--ff-accent-primary)]" role="alert">
          {state.error}
        </div>
      ) : null}

      {state.createdUrl ? (
        <div className="mt-4 rounded-[var(--ff-radius-md)] border border-[var(--ff-accent-success)] bg-[var(--ff-surface-inset)] p-4">
          <div className="text-sm font-bold text-[var(--ff-accent-success)]">{copy.linkReady}</div>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              className="h-11 min-w-0 flex-1 rounded-[var(--ff-radius-sm)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] px-3 font-[var(--ff-font-mono)] text-xs text-[var(--ff-text-primary)]"
              readOnly
              value={state.createdUrl}
            />
            <div className="flex gap-2">
              <button className="t-control-press h-11 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] px-4 text-sm font-bold" onClick={onCopyCreatedUrl} type="button">
                {copy.copy}
              </button>
              <a className="t-control-press inline-flex h-11 items-center rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] px-4 text-sm font-bold" href={state.createdUrl}>
                {copy.view}
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        {state.isLoading ? <p className="text-sm text-[var(--ff-text-muted)]">{copy.loading}</p> : null}
        {state.shares.map((share) => {
          const status = getShareStatus(share)
          const statusText = status === 'revoked' ? copy.revoked : status === 'expired' ? copy.expired : copy.active

          return (
            <div
              className="flex flex-col gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-muted)] bg-[var(--ff-surface-inset)] p-4 md:flex-row md:items-center md:justify-between"
              key={share.id}
            >
              <div>
                <div className="font-[var(--ff-font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ff-text-muted)]">{statusText}</div>
                <div className="mt-1 text-sm font-semibold text-[var(--ff-text-secondary)]">
                  {copy.expires}: {formatDate(share.expiresAt, locale)}
                </div>
              </div>
              <button
                className="t-control-press h-10 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
                disabled={Boolean(previewNotice) || status !== 'active' || state.revokingShareId === share.id}
                onClick={() => onRevokeShare(share.id)}
                type="button"
              >
                {copy.revoke}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
