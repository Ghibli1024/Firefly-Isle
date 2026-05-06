/**
 * [INPUT]: 依赖 react-dom/server 的静态渲染，依赖 LocaleProvider，依赖 workspace 的 ExtractionComposer 与 ReportPreviewFrame。
 * [OUTPUT]: 对外提供已有病历编辑/新病历提取分流与工作台身高体重 BMI 展示回归测试。
 * [POS]: routes 的工作区局部合同测试，承接 workspace-page.test.tsx 的体格指标和模式分流断言，保持主测试文件不越过 800 行结构门禁。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ExtractionComposer } from '@/components/workspace/extraction-composer'
import { ReportPreviewFrame } from '@/components/workspace/report-preview-frame'
import { LocaleProvider } from '@/lib/locale'
import type { PatientRecord } from '@/types/patient'

describe('WorkspacePage metrics and record mode contracts', () => {
  it('makes existing-record input mode explicit and exposes a separate new-record extraction action', () => {
    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <ExtractionComposer
          composerMode="edit"
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
})
