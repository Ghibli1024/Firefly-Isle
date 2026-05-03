/**
 * [INPUT]: 依赖 vitest 的 LLM mock，依赖 ./extraction 的 extractPatientRecord。
 * [OUTPUT]: 对外提供结构化提取对 LLM JSON 输出模式的回归测试。
 * [POS]: src/lib 的提取协议测试，确保病历结构化链路要求模型返回 JSON 对象。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const llmMocks = vi.hoisted(() => ({
  chat: vi.fn(),
}))

vi.mock('@/lib/llm', () => ({
  chat: llmMocks.chat,
}))

import { extractPatientRecord } from './extraction'

describe('extractPatientRecord', () => {
  beforeEach(() => {
    llmMocks.chat.mockResolvedValue('{"treatmentLines":[]}')
  })

  it('requests JSON object output from the LLM adapter', async () => {
    await extractPatientRecord('肺癌 IV 期，使用奥希替尼一线治疗。')

    expect(llmMocks.chat).toHaveBeenCalledWith(expect.any(Array), {
      responseFormat: 'json_object',
    })
  })
})
