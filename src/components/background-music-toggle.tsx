/**
 * [INPUT]: 依赖 @/lib/background-audio 的全局歌单状态，依赖 @/lib/locale 与 @/lib/copy 的双语文案，依赖 @/lib/utils 的类名合并。
 * [OUTPUT]: 对外提供 BackgroundMusicToggle 组件，包含播放开关、当前曲目、上一首、下一首与顶部短侧舱布局。
 * [POS]: components 的共享背景音乐控件，被登录页工具区和 authenticated top bar 复用，不拥有 audio 实例。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useId, useState } from 'react'

import { getCopy, copy } from '@/lib/copy'
import { useBackgroundAudio, type BackgroundAudioStatus } from '@/lib/background-audio'
import { useLocale } from '@/lib/locale'
import { cn } from '@/lib/utils'

type BackgroundMusicToggleProps = {
  className?: string
  iconClassName?: string
  layout?: 'inline' | 'short-dock'
  showLabel?: boolean
}

const iconByStatus: Record<BackgroundAudioStatus, string> = {
  blocked: 'play_circle',
  idle: 'volume_up',
  loading: 'progress_activity',
  paused: 'volume_off',
  playing: 'volume_up',
  unavailable: 'music_off',
}

function isAudioPressed(status: BackgroundAudioStatus) {
  return status === 'idle' || status === 'loading' || status === 'playing'
}

export function BackgroundMusicToggle({
  className,
  iconClassName,
  layout = 'inline',
  showLabel = false,
}: BackgroundMusicToggleProps) {
  const panelId = useId()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const { locale } = useLocale()
  const { currentTrack, nextTrack, previousTrack, status, toggle, tracks } = useBackgroundAudio()
  const ariaLabel = getCopy(copy.backgroundAudio.aria[status], locale)
  const label = getCopy(copy.backgroundAudio.control, locale)
  const nextLabel = getCopy(copy.backgroundAudio.next, locale)
  const openControlsLabel = getCopy(copy.backgroundAudio.openControls, locale)
  const previousLabel = getCopy(copy.backgroundAudio.previous, locale)
  const trackLabel = getCopy(copy.backgroundAudio.track, locale)
  const unavailable = status === 'unavailable'
  const trackControlsDisabled = tracks.length < 2
  const icon = (
    <span className={cn('material-symbols-outlined shrink-0 text-[24px]', iconClassName)}>
      {iconByStatus[status]}
    </span>
  )

  if (layout === 'short-dock') {
    return (
      <div
        className="relative inline-flex shrink-0"
        data-background-music-layout="short-dock"
        data-testid="background-music-control"
      >
        <button
          aria-controls={panelId}
          aria-disabled={unavailable}
          aria-expanded={isPanelOpen}
          aria-haspopup="dialog"
          aria-label={openControlsLabel}
          className={cn(
            'inline-flex shrink-0 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-60',
            className,
          )}
          data-audio-status={status}
          data-testid="background-music-toggle"
          disabled={unavailable}
          onClick={() => setIsPanelOpen((isOpen) => !isOpen)}
          title={openControlsLabel}
          type="button"
        >
          {icon}
          <span className="sr-only">{openControlsLabel}</span>
        </button>
        {isPanelOpen ? (
          <div
            aria-label={openControlsLabel}
            className="fixed right-0 top-[68px] z-50 w-[min(19rem,calc(100vw-1rem))] border-b border-l border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] px-5 pb-5 pt-4 text-[var(--ff-text-primary)] shadow-[0_22px_55px_rgba(0,0,0,0.34)]"
            data-testid="background-music-short-dock"
            id={panelId}
            role="dialog"
          >
            <div className="absolute left-0 top-0 h-16 w-[2px] bg-[var(--ff-accent-primary)]" />
            <div className="font-[var(--ff-font-mono)] text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ff-accent-primary)]">
              Audio
            </div>
            <div
              aria-label={`${trackLabel}: ${currentTrack.title}`}
              className="mt-3 border-y border-[var(--ff-border-default)] py-3 font-[var(--ff-font-display)] text-lg font-black leading-tight"
              data-testid="background-music-current-track"
              title={currentTrack.title}
            >
              {currentTrack.title}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                aria-label={ariaLabel}
                aria-pressed={isAudioPressed(status)}
                className="inline-flex h-12 items-center justify-center border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] text-[var(--ff-text-primary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)]"
                data-audio-status={status}
                onClick={() => void toggle()}
                title={ariaLabel}
                type="button"
              >
                {icon}
              </button>
              <button
                aria-label={previousLabel}
                className="inline-flex h-12 items-center justify-center border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] text-current transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)] disabled:cursor-not-allowed disabled:opacity-35"
                disabled={trackControlsDisabled}
                onClick={() => void previousTrack()}
                title={previousLabel}
                type="button"
              >
                <span className="material-symbols-outlined text-[21px]">skip_previous</span>
              </button>
              <button
                aria-label={nextLabel}
                className="inline-flex h-12 items-center justify-center border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] text-current transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)] disabled:cursor-not-allowed disabled:opacity-35"
                disabled={trackControlsDisabled}
                onClick={() => void nextTrack()}
                title={nextLabel}
                type="button"
              >
                <span className="material-symbols-outlined text-[21px]">skip_next</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="inline-flex min-w-0 shrink-0 items-center gap-1" data-testid="background-music-control">
      <button
        aria-disabled={unavailable}
        aria-label={ariaLabel}
        aria-pressed={isAudioPressed(status)}
        className={cn(
          'inline-flex shrink-0 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        data-audio-status={status}
        data-testid="background-music-toggle"
        disabled={unavailable}
        onClick={() => void toggle()}
        title={ariaLabel}
        type="button"
      >
        {icon}
        {showLabel ? <span className="whitespace-nowrap">{label}</span> : <span className="sr-only">{ariaLabel}</span>}
      </button>
      <span
        aria-label={`${trackLabel}: ${currentTrack.title}`}
        className="max-w-[10rem] truncate whitespace-nowrap px-1 text-xs font-semibold leading-none text-current opacity-80"
        data-testid="background-music-current-track"
        title={currentTrack.title}
      >
        {currentTrack.title}
      </span>
      <button
        aria-label={previousLabel}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--ff-radius-sm)] border border-current text-current opacity-75 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-35"
        disabled={trackControlsDisabled}
        onClick={() => void previousTrack()}
        title={previousLabel}
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">skip_previous</span>
      </button>
      <button
        aria-label={nextLabel}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--ff-radius-sm)] border border-current text-current opacity-75 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-35"
        disabled={trackControlsDisabled}
        onClick={() => void nextTrack()}
        title={nextLabel}
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">skip_next</span>
      </button>
    </div>
  )
}
