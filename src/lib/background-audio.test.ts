/**
 * [INPUT]: 依赖 vitest 的断言与 mock，依赖 background-audio 的控制器、偏好读取、曲目清单与存储 key。
 * [OUTPUT]: 对外提供背景音乐控制器与本地歌单状态机回归测试。
 * [POS]: src/lib 的背景音乐行为合同测试，约束 Nagisa / Merry 双曲歌单默认值、曲目持久化、循环切歌、ended 前进、自动播放拦截与不可用状态。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it, vi } from 'vitest'

import {
  BACKGROUND_AUDIO_SRC,
  BACKGROUND_AUDIO_STORAGE_KEY,
  BACKGROUND_AUDIO_TRACKS,
  BACKGROUND_AUDIO_TRACK_STORAGE_KEY,
  createBackgroundAudioController,
  readBackgroundAudioPreference,
  readBackgroundAudioTrackId,
} from '@/lib/background-audio'

type Listener = () => void

class MemoryStorage {
  private values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

function createAudio(playImpl: () => Promise<void> = () => Promise.resolve()) {
  const listeners = new Map<string, Set<Listener>>()
  const audio = {
    loop: false,
    pause: vi.fn(),
    paused: true,
    play: vi.fn(playImpl),
    preload: '',
    src: '',
    volume: 1,
    addEventListener(event: string, listener: Listener) {
      const eventListeners = listeners.get(event) ?? new Set<Listener>()
      eventListeners.add(listener)
      listeners.set(event, eventListeners)
    },
    dispatch(event: string) {
      for (const listener of listeners.get(event) ?? []) {
        listener()
      }
    },
    removeEventListener(event: string, listener: Listener) {
      listeners.get(event)?.delete(listener)
    },
  }

  return audio
}

describe('background audio controller', () => {
  it('uses a local public asset path and defaults to enabled playback intent', () => {
    const storage = new MemoryStorage()

    expect(BACKGROUND_AUDIO_TRACKS).toHaveLength(2)
    expect(BACKGROUND_AUDIO_TRACKS.map((track) => track.id)).toEqual([
      'nagisa-sakano-shitano-wakare',
      'merry-christmas-mr-lawrence',
    ])
    expect(BACKGROUND_AUDIO_SRC).toBe('/audio/tracks/nagisa-sakano-shitano-wakare.mp3')
    expect(readBackgroundAudioPreference(storage)).toBe('on')
    expect(readBackgroundAudioTrackId(storage)).toBe('nagisa-sakano-shitano-wakare')
  })

  it('records successful playback after the app requests background music', async () => {
    const storage = new MemoryStorage()
    const audio = createAudio()
    const controller = createBackgroundAudioController({ audio, storage })

    await controller.requestPlayback()

    expect(audio.src).toContain('/audio/tracks/nagisa-sakano-shitano-wakare.mp3')
    expect(audio.loop).toBe(false)
    expect(audio.preload).toBe('auto')
    expect(audio.play).toHaveBeenCalledTimes(1)
    expect(controller.getSnapshot().status).toBe('playing')
    expect(controller.getSnapshot().preference).toBe('on')
    expect(controller.getSnapshot().currentTrackId).toBe('nagisa-sakano-shitano-wakare')
  })

  it('persists selected track separately from the on/off preference', async () => {
    const storage = new MemoryStorage()
    const audio = createAudio()
    const controller = createBackgroundAudioController({ audio, storage })

    await controller.selectTrack('merry-christmas-mr-lawrence')

    expect(audio.src).toContain('/audio/tracks/merry-christmas-mr-lawrence.mp3')
    expect(audio.play).toHaveBeenCalledTimes(1)
    expect(storage.getItem(BACKGROUND_AUDIO_TRACK_STORAGE_KEY)).toBe('merry-christmas-mr-lawrence')
    expect(storage.getItem(BACKGROUND_AUDIO_STORAGE_KEY)).toBeNull()
    expect(controller.getSnapshot().currentTrackId).toBe('merry-christmas-mr-lawrence')
  })

  it('falls back to the first track when stored track id is no longer valid', () => {
    const storage = new MemoryStorage()
    storage.setItem(BACKGROUND_AUDIO_TRACK_STORAGE_KEY, 'missing-track')
    const audio = createAudio()
    const controller = createBackgroundAudioController({ audio, storage })

    expect(readBackgroundAudioTrackId(storage)).toBe('nagisa-sakano-shitano-wakare')
    expect(audio.src).toContain('/audio/tracks/nagisa-sakano-shitano-wakare.mp3')
    expect(controller.getSnapshot().currentTrackId).toBe('nagisa-sakano-shitano-wakare')
  })

  it('wraps next and previous track selection through the local playlist', async () => {
    const storage = new MemoryStorage()
    storage.setItem(BACKGROUND_AUDIO_TRACK_STORAGE_KEY, 'merry-christmas-mr-lawrence')
    const audio = createAudio()
    const controller = createBackgroundAudioController({ audio, storage })

    await controller.nextTrack()
    expect(controller.getSnapshot().currentTrackId).toBe('nagisa-sakano-shitano-wakare')
    expect(audio.src).toContain('/audio/tracks/nagisa-sakano-shitano-wakare.mp3')

    await controller.previousTrack()
    expect(controller.getSnapshot().currentTrackId).toBe('merry-christmas-mr-lawrence')
    expect(audio.src).toContain('/audio/tracks/merry-christmas-mr-lawrence.mp3')
  })

  it('advances to the next track when the current song ends', async () => {
    const storage = new MemoryStorage()
    const audio = createAudio()
    const controller = createBackgroundAudioController({ audio, storage })

    audio.dispatch('ended')
    await Promise.resolve()

    expect(controller.getSnapshot().currentTrackId).toBe('merry-christmas-mr-lawrence')
    expect(audio.src).toContain('/audio/tracks/merry-christmas-mr-lawrence.mp3')
    expect(audio.play).toHaveBeenCalledTimes(1)
  })

  it('lets track switching recover from an unavailable current source', async () => {
    const storage = new MemoryStorage()
    const audio = createAudio()
    const controller = createBackgroundAudioController({ audio, storage })

    audio.dispatch('error')
    await controller.nextTrack()

    expect(controller.getSnapshot().currentTrackId).toBe('merry-christmas-mr-lawrence')
    expect(controller.getSnapshot().status).toBe('playing')
    expect(audio.src).toContain('/audio/tracks/merry-christmas-mr-lawrence.mp3')
  })

  it('treats browser autoplay rejection as a recoverable blocked state', async () => {
    const storage = new MemoryStorage()
    const audio = createAudio(() => Promise.reject(new DOMException('gesture required', 'NotAllowedError')))
    const controller = createBackgroundAudioController({ audio, storage })

    await controller.requestPlayback()

    expect(controller.getSnapshot().status).toBe('blocked')
    expect(storage.getItem(BACKGROUND_AUDIO_STORAGE_KEY)).toBeNull()
  })

  it('persists off preference and skips the next automatic playback request', async () => {
    const storage = new MemoryStorage()
    const audio = createAudio()
    const controller = createBackgroundAudioController({ audio, storage })

    controller.turnOff()
    await controller.requestPlayback()

    expect(audio.pause).toHaveBeenCalledTimes(1)
    expect(audio.play).not.toHaveBeenCalled()
    expect(storage.getItem(BACKGROUND_AUDIO_STORAGE_KEY)).toBe('off')
    expect(controller.getSnapshot().status).toBe('paused')
  })

  it('lets a user-triggered toggle restore playback after turning music off', async () => {
    const storage = new MemoryStorage()
    const audio = createAudio()
    const controller = createBackgroundAudioController({ audio, storage })

    controller.turnOff()
    await controller.toggle()

    expect(storage.getItem(BACKGROUND_AUDIO_STORAGE_KEY)).toBe('on')
    expect(audio.play).toHaveBeenCalledTimes(1)
    expect(controller.getSnapshot().status).toBe('playing')
  })

  it('exposes unavailable state when no audio element can be created', async () => {
    const storage = new MemoryStorage()
    const controller = createBackgroundAudioController({ audio: null, storage })

    await controller.requestPlayback()

    expect(controller.getSnapshot().status).toBe('unavailable')
  })
})
