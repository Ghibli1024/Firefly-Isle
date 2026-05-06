/**
 * [INPUT]: 依赖 react-dom/server 的静态渲染，依赖 LocaleProvider，依赖 workspace 的 ExtractionComposer 与 ReportPreviewFrame。
 * [OUTPUT]: 对外提供已有病历编辑/新病历提取分流、工作台身高体重 BMI 展示与预览提示条显隐回归测试。
 * [POS]: routes 的工作区局部合同测试，承接 workspace-page.test.tsx 的体格指标、模式分流和预览提示条断言，保持主测试文件不越过 800 行结构门禁。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ExtractionComposer } from '@/components/workspace/extraction-composer'
import { ReportPreviewFrame } from '@/components/workspace/report-preview-frame'
import { LocaleProvider } from '@/lib/locale'
import type { PatientRecord } from '@/types/patient'

import {
  getConfirmedOcrText,
  getFailedOcrImportPatch,
  getFollowUpPersistenceFailurePatch,
  getWorkspaceComposerMode,
} from './workspace-page'

describe('WorkspacePage metrics and record mode contracts', () => {
  it('makes existing-record input mode explicit and exposes a separate new-record extraction action', () => {
    expect(getWorkspaceComposerMode({ treatmentLines: [] })).toBe('edit')
    expect(getWorkspaceComposerMode(null)).toBe('extract')

    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <ExtractionComposer
          composerMode={getWorkspaceComposerMode({ treatmentLines: [] })}
          error={null}
          extractionInput="把身高改成 168，体重改成 62"
          isExtracting={false}
          isSaving={false}
          onExtract={() => undefined}
          onExtractAsNew={() => undefined}
          onInputChange={() => undefined}
          onRetry={() => undefined}
          remainingMissingCount={0}
          retryMode={null}
          theme="light"
        />
      </LocaleProvider>,
    )

    expect(markup).toContain('应用病历修改')
    expect(markup).toContain('作为新病历提取')
    expect(markup).not.toContain('开始结构化提取')
  })

  it('builds a follow-up persistence failure patch that restores the previous record', () => {
    const previousRecord: PatientRecord = {
      basicInfo: { age: 63 },
      treatmentLines: [{ lineNumber: 1, regimen: '奥希替尼' }],
    }
    const patch = getFollowUpPersistenceFailurePatch(previousRecord, '补充回答', 1, 'zh')

    expect(patch.record).toBe(previousRecord)
    expect(patch.remainingMissing).toEqual(['tumorType', 'stage'])
    expect(patch.retryAnswer).toBe('补充回答')
    expect(patch.retryMode).toBe('follow-up')
  })

  it('builds a failed OCR patch without mutating the current patient record', () => {
    const current = {
      record: { basicInfo: { tumorType: '乳腺癌' }, treatmentLines: [] },
      remainingMissing: ['分期'],
    } satisfies { record: PatientRecord; remainingMissing: string[] }
    const patch = getFailedOcrImportPatch(current, new Error('network'), 'zh')

    expect(patch.record).toBe(current.record)
    expect(patch.remainingMissing).toBe(current.remainingMissing)
    expect(patch.ocr).toMatchObject({ isProcessing: false, text: null })
    expect(patch.ocr.error).toBeTruthy()
  })

  it('normalizes confirmed OCR text before extraction', () => {
    expect(getConfirmedOcrText('  影像报告文本  ')).toBe('影像报告文本')
    expect(getConfirmedOcrText('   ')).toBeNull()
    expect(getConfirmedOcrText(null)).toBeNull()
  })

  it('renders editable height and weight with calculated BMI in the workspace preview', () => {
    const record: PatientRecord = {
      basicInfo: { height: 168, weight: 62 },
      treatmentLines: [],
    }

    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <ReportPreviewFrame
          isExtracting={false}
          isSaving={false}
          onCommitField={() => undefined}
          record={record}
          remainingMissing={[]}
          setReportRef={() => undefined}
          theme="light"
        />
      </LocaleProvider>,
    )

    expect(markup).toContain('身高')
    expect(markup).toContain('168 cm')
    expect(markup).toContain('体重')
    expect(markup).toContain('62 kg')
    expect(markup).toContain('BMI')
    expect(markup).toContain('22.0')
  })

  it('hides completed missing-field and follow-up badges from the preview header', () => {
    const record: PatientRecord = {
      basicInfo: { stage: 'IA期', tumorType: '乳腺癌' },
      treatmentLines: [{ lineNumber: 1, regimen: '阿贝西利+氟维司群' }],
    }

    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <ReportPreviewFrame
          followUpCount={0}
          isExtracting={false}
          isSaving={false}
          onCommitField={() => undefined}
          record={record}
          remainingMissing={[]}
          setReportRef={() => undefined}
          theme="light"
        />
      </LocaleProvider>,
    )

    expect(markup).not.toContain('必填字段 / 缺失字段')
    expect(markup).not.toContain('chat_bubble')
    expect(markup).not.toContain('0 项 · 第')
  })

  it('keeps the follow-up progress badge only while missing fields remain', () => {
    const record: PatientRecord = {
      basicInfo: { tumorType: '乳腺癌' },
      treatmentLines: [],
    }

    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <ReportPreviewFrame
          followUpCount={1}
          isExtracting={false}
          isSaving={false}
          onCommitField={() => undefined}
          record={record}
          remainingMissing={['分期', '治疗方案']}
          setReportRef={() => undefined}
          theme="light"
        />
      </LocaleProvider>,
    )

    expect(markup).not.toContain('必填字段 / 缺失字段')
    expect(markup).toContain('待补充')
    expect(markup).toContain('/3 轮追问')
  })
})
