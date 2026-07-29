/**
 * [INPUT]: 依赖 vitest 与 origin-story-content 的公开内容合同。
 * [OUTPUT]: 对外验证创作初衷只暴露公开摘要和规范化来源地址。
 * [POS]: origin-story 内容源的回归测试，避免再次把非公开材料写入页面数据层。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vitest'

import {
  originStorySourceLabel,
  originStorySourceUrl,
  originStoryText,
  storyParagraphs,
} from './origin-story-content'

describe('origin story public source content', () => {
  it('keeps the rendered text derived from the concise public summary', () => {
    expect(storyParagraphs).toHaveLength(4)
    expect(originStoryText).toBe(storyParagraphs.join('\n\n'))
  })

  it('publishes one canonical source link for every presentation layer', () => {
    expect(originStorySourceLabel).toBe('原帖：YouTube 社区动态')
    expect(originStorySourceUrl).toBe('https://www.youtube.com/post/Ugkx2pyfj6hZm_j7M4tjutIm7D9BFqg-mfyB')
  })
})
