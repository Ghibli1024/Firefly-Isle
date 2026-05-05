/**
 * [INPUT]: 依赖 vitest 的 LLM mock，依赖 ./extraction 的 extractPatientRecord。
 * [OUTPUT]: 对外提供结构化提取对 LLM JSON 输出模式、紧凑提示词合同、上游失败降级重试与日期归一化的回归测试。
 * [POS]: src/lib 的提取协议测试，确保病历结构化链路优先要求模型返回 JSON 对象、避免长 TypeScript schema/多消息提示词、接住上游 502 与中文/点号日期。
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

function getUserPrompt(messages: Array<{ role: string; content: string }>) {
  return messages.find((message) => message.role === 'user')?.content ?? ''
}

describe('extractPatientRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    llmMocks.chat.mockResolvedValue('{"treatmentLines":[]}')
  })

  it('requests JSON object output from the LLM adapter', async () => {
    await extractPatientRecord('肺癌 IV 期，使用奥希替尼一线治疗。')

    expect(llmMocks.chat).toHaveBeenCalledWith(expect.any(Array), {
      responseFormat: 'json_object',
    })
  })

  it('retries without JSON mode when the upstream rejects dense histories', async () => {
    llmMocks.chat
      .mockRejectedValueOnce(Object.assign(new Error('deepseek API request failed.'), {
        name: 'LLMUpstreamError',
        status: 502,
      }))
      .mockResolvedValueOnce('{"treatmentLines":[{"lineNumber":1,"regimen":"阿贝西利+氟维司群"}]}')

    await expect(extractPatientRecord('乳腺癌长病史，包含多行治疗表格。')).resolves.toMatchObject({
      treatmentLines: [
        {
          lineNumber: 1,
          regimen: '阿贝西利+氟维司群',
        },
      ],
    })
    expect(llmMocks.chat).toHaveBeenNthCalledWith(1, expect.any(Array), { responseFormat: 'json_object' })
    expect(llmMocks.chat).toHaveBeenNthCalledWith(2, expect.any(Array))
  })

  it('keeps extracted lab readings in labResults instead of treatmentLines', async () => {
    llmMocks.chat.mockResolvedValue(
      JSON.stringify({
        labResults: [
          {
            category: 'tumor-marker',
            itemCode: 'cea',
            itemName: 'CEA',
            referenceHigh: '5',
            source: 'ocr',
            testDate: '2024/02/01',
            unit: 'ng/mL',
            value: '8.2',
          },
        ],
        treatmentLines: [],
      }),
    )

    await expect(extractPatientRecord('CEA 8.2 ng/mL，参考值 <5。')).resolves.toMatchObject({
      labResults: [
        {
          itemCode: 'cea',
          referenceHigh: 5,
          source: 'ocr',
          testDate: '2024-02-01',
          value: 8.2,
        },
      ],
      treatmentLines: [],
    })
  })

  it('uses a compact JSON field contract instead of a long TypeScript schema prompt', async () => {
    await extractPatientRecord('乳腺癌，2021年7月初发，2022年10月骨转。')

    const messages = llmMocks.chat.mock.calls[0][0]
    const userPrompt = getUserPrompt(messages)

    expect(messages).toHaveLength(1)
    expect(userPrompt).toContain('从病史提取 JSON')
    expect(userPrompt).toContain('只允许这些顶层字段')
    expect(userPrompt).toContain('treatmentLines 是数组')
    expect(userPrompt).not.toContain('labResults 是数组')
    expect(userPrompt).not.toContain('省略该字段')
    expect(userPrompt).not.toContain('当前已知记录')
    expect(userPrompt).not.toContain('目标 JSON 字段合同')
    expect(userPrompt).not.toContain('interface PatientRecord')
    expect(userPrompt).not.toContain('目标 TypeScript schema')
  })

  it('keeps the existing record block only for follow-up extraction', async () => {
    await extractPatientRecord('补充：分期 IV。', {
      basicInfo: {
        tumorType: '乳腺癌',
      },
      treatmentLines: [],
    })

    const messages = llmMocks.chat.mock.calls[0][0]
    const userPrompt = getUserPrompt(messages)

    expect(userPrompt).toContain('当前已知记录：')
    expect(userPrompt).toContain('"tumorType":"乳腺癌"')
  })

  it('adds labResults contract only when the input looks like lab data', async () => {
    await extractPatientRecord('CEA 8.2 ng/mL，参考值 <5。')

    const messages = llmMocks.chat.mock.calls[0][0]
    const userPrompt = getUserPrompt(messages)

    expect(userPrompt).toContain('labResults 是数组')
  })

  it('normalizes Chinese and dotted model dates from dense clinical histories', async () => {
    llmMocks.chat.mockResolvedValue(
      JSON.stringify({
        basicInfo: {
          diagnosisDate: '2021年7月',
          stage: 'PT1N0M0',
        },
        treatmentLines: [
          {
            endDate: '2025年9.25',
            lineNumber: 9,
            regimen: '氟唑帕利+哌柏西利+托瑞米芬',
            startDate: '2025.10.1',
          },
        ],
      }),
    )

    await expect(extractPatientRecord('2025.10.1 氟唑帕利+哌柏西利+托瑞米芬')).resolves.toMatchObject({
      basicInfo: {
        diagnosisDate: '2021-07',
      },
      treatmentLines: [
        {
          endDate: '2025-09-25',
          startDate: '2025-10-01',
        },
      ],
    })
  })
})
