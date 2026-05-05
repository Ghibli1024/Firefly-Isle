/**
 * [INPUT]: 依赖 @/lib/locale 的 Locale 类型与 components/record/types 的展示类型。
 * [OUTPUT]: 对外提供 record labels、demo summaryMetrics 与 getTimelineEntries 演示时间线文案。
 * [POS]: components/record 的静态文案与 demo 数据模块，被 RecordDossier 和路由错误态复用。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { Locale } from '@/lib/locale'

import type { Metric, TimelineEntry } from './types'

export const labels = {
  en: {
    access: 'Protected medical record / Authorized access only',
    aiStatus: 'AI Verification',
    archiveComplete: 'Archive complete · unchanged',
    back: 'Back to workspace',
    clinicalNotes: 'Clinical Notes',
    completeness: 'Data Completeness',
    dossier: 'CLINICAL HISTORY DOSSIER',
    exportError: 'Export failed. Please try again later.',
    exportPdf: 'Export PDF',
    exportPdfLoading: 'Exporting PDF...',
    exportPng: 'Export PNG',
    exportPngLoading: 'Exporting PNG...',
    footer: 'Firefly Core System V3.1',
    headerSubtitle: 'Zhang San · NSCLC · EGFR L858R',
    loadingRecord: 'Loading medical record...',
    loadRecordError: 'Unable to load this medical record.',
    missingRecord: 'No authorized medical record was found for this ID.',
    pageTitle: 'Clinical History Dossier',
    timeline: 'Treatment Timeline',
    verified: 'AI VERIFIED',
  },
  zh: {
    access: '受控医疗记录 / 仅限授权访问',
    aiStatus: 'AI 验证状态',
    archiveComplete: '档案完整 · 未篡改',
    back: '返回工作台',
    clinicalNotes: '临床备注',
    completeness: '数据完整性',
    dossier: 'CLINICAL HISTORY DOSSIER',
    exportError: '导出失败，请稍后重试。',
    exportPdf: '导出 PDF',
    exportPdfLoading: '导出 PDF 中...',
    exportPng: '导出 PNG',
    exportPngLoading: '导出 PNG 中...',
    footer: '萤岛核心系统 V3.1',
    headerSubtitle: '张三 · NSCLC · EGFR L858R',
    loadingRecord: '正在载入病历...',
    loadRecordError: '无法载入这份病历。',
    missingRecord: '没有找到当前账号可访问的病历。',
    pageTitle: '临床病史档案',
    timeline: '治疗时间线',
    verified: 'AI VERIFIED',
  },
} satisfies Record<Locale, Record<string, string>>

export const summaryMetrics = {
  en: [
    { label: 'Age', value: '56 years' },
    { label: 'Gender', value: 'Female' },
    { label: 'Tumor Stage', value: 'Stage IV' },
    { label: 'Follow-up Status', value: 'Stable follow-up' },
    { label: 'Diagnosis Date', value: '2023.04' },
    { label: 'Genetic Test', value: 'EGFR L858R' },
    { label: 'IHC', value: 'PD-L1 TPS 45%' },
    { label: 'Current Plan', value: 'Second-line therapy' },
  ],
  zh: [
    { label: '年龄', value: '56 岁' },
    { label: '性别', value: '女' },
    { label: '肿瘤分期', value: 'IV 期' },
    { label: '随访状态', value: '稳定随访' },
    { label: '诊断日期', value: '2023.04' },
    { label: '基因检测', value: 'EGFR L858R' },
    { label: '免疫组化', value: 'PD-L1 TPS 45%' },
    { label: '当前方案', value: '二线治疗' },
  ],
} satisfies Record<Locale, Metric[]>

export function getTimelineEntries(locale: Locale): TimelineEntry[] {
  if (locale === 'en') {
    return [
      {
        body: [
          'The patient presented in April 2023 with persistent cough.',
          'CT showed a left upper lung lesion (3.2cm x 2.8cm) with mediastinal lymphadenopathy. Biopsy confirmed lung adenocarcinoma.',
        ],
        cards: [
          {
            items: [
              { label: 'PD-L1', value: 'TPS: 45%' },
              { label: 'TTF-1', value: '(+)' },
              { label: 'Napsin A', value: '(+)' },
            ],
            title: 'Immunohistochemistry',
          },
          {
            items: [
              { label: 'EGFR', value: 'L858R (positive)' },
              { label: 'ALK', value: 'Negative' },
              { label: 'ROS1', value: 'Negative' },
              { label: 'RET', value: 'Negative' },
              { label: 'Test Date', value: '2023.04' },
            ],
            title: 'Genetic Test',
          },
        ],
        index: '01',
        meta: [
          { label: 'Diagnosis Date', value: '2023.04' },
          { label: 'Clinical Stage', value: 'IIIA (T2N2M0)' },
          { label: 'Pathology', value: 'Adenocarcinoma' },
          { label: 'Specimen', value: 'Tested' },
        ],
        subtitle: 'Initial',
        timeframe: '2023.04',
        title: 'Initial Diagnosis',
        treatment: 'Non-small cell lung cancer (NSCLC)',
      },
      {
        badge: 'Phase complete',
        body: [
          'The patient started third-generation EGFR-TKI therapy.',
          'Initial response was good, with tumor volume reduced by about 40%. After 9 months, imaging showed left lung progression and small brain metastases.',
        ],
        cards: [
          {
            items: [
              { label: 'Best Response', value: 'PR partial response' },
              { label: 'Duration', value: '9 months' },
              { label: 'Progression Date', value: '2024.02' },
              { label: 'Overall', value: 'Disease progression (PD)' },
            ],
            title: 'Efficacy Assessment',
          },
        ],
        highlight: {
          body: 'EGFR T790M mutation loss detected with MET amplification (FISH positive).',
          title: 'Resistance Analysis',
        },
        index: '02',
        meta: [],
        subtitle: 'Treatment Line 1',
        timeframe: '2023.05 - 2024.02',
        title: 'First-line Therapy',
        treatment: 'Osimertinib targeted therapy',
      },
      {
        badge: 'In progress',
        body: [
          'For MET amplification, the plan was adjusted to chemotherapy plus MET inhibition.',
          'Four cycles are complete. Dyspnea has improved and brain lesions remain stable.',
        ],
        cards: [
          {
            items: [
              { label: 'Treatment Cycle', value: '4 / 6' },
              { label: 'Imaging', value: 'SD stable' },
              { label: 'Brain Metastasis', value: 'Stable' },
              { label: 'Next Plan', value: 'Continue current plan' },
            ],
            title: 'Efficacy Assessment',
          },
        ],
        footMetrics: [
          { label: 'Regimen Match', value: '94.2%' },
          { label: 'Stability', value: 'Stable expected' },
        ],
        index: '03',
        meta: [],
        subtitle: 'Treatment Line 2',
        timeframe: '2024.03 - Present',
        title: 'Second-line Therapy',
        treatment: 'Pemetrexed + Carboplatin + Savolitinib',
      },
    ]
  }

  return [
    {
      body: [
        '患者于 2023 年 4 月因持续性咳嗽就诊。',
        'CT 检查显示左上肺占位性病变（3.2cm x 2.8cm），伴有纵隔淋巴结肿大。活检病理确认为肺腺癌。',
      ],
      cards: [
        {
          items: [
            { label: 'PD-L1', value: 'TPS: 45%' },
            { label: 'TTF-1', value: '(+)' },
            { label: 'Napsin A', value: '(+)' },
          ],
          title: '免疫组化',
        },
        {
          items: [
            { label: 'EGFR', value: 'L858R（突变阳性）' },
            { label: 'ALK', value: '阴性' },
            { label: 'ROS1', value: '阴性' },
            { label: 'RET', value: '阴性' },
            { label: '检查日期', value: '2023.04' },
          ],
          title: '基因检测',
        },
      ],
      index: '01',
      meta: [
        { label: '诊断日期', value: '2023.04' },
        { label: '临床分期', value: 'IIIA（T2N2M0）' },
        { label: '病理类型', value: '腺癌' },
        { label: '生物标本状态', value: '已检测' },
      ],
      subtitle: '初发',
      timeframe: '2023.04',
      title: '初发诊断',
      treatment: '非小细胞肺癌（NSCLC）',
    },
    {
      badge: '阶段完成',
      body: [
        '患者开始接受第三代 EGFR-TKI 治疗。',
        '初始反应良好，肿瘤体积缩小约 40%。治疗 9 个月后，复查显示左肺病灶增大，并出现微小脑转移灶，判定为疾病进展。',
      ],
      cards: [
        {
          items: [
            { label: '最佳疗效', value: 'PR 部分缓解' },
            { label: '缓解持续时间', value: '9 个月' },
            { label: '疾病进展日期', value: '2024.02' },
            { label: '总体评估', value: '疾病进展 (PD)' },
          ],
          title: '疗效评估',
        },
      ],
      highlight: {
        body: '检测到 EGFR T790M 突变消失，伴随 MET 基因扩增（FISH 阳性）。',
        title: '耐药分析',
      },
      index: '02',
      meta: [],
      subtitle: '治疗线 1',
      timeframe: '2023.05 - 2024.02',
      title: '一线治疗',
      treatment: '奥希替尼靶向治疗 (Osimertinib)',
    },
    {
      badge: '进行中',
      body: [
        '针对 MET 扩增，调整方案为化疗联合 MET 抑制剂治疗。',
        '目前已完成 4 个周期，患者自述呼吸困难症状缓解，脑部病灶稳定。',
      ],
      cards: [
        {
          items: [
            { label: '治疗周期', value: '4 / 6' },
            { label: '影像学评估', value: 'SD 稳定' },
            { label: '脑转移状态', value: '稳定' },
            { label: '下一步计划', value: '继续当前方案' },
          ],
          title: '疗效评估',
        },
      ],
      footMetrics: [
        { label: '方案匹配度', value: '94.2%' },
        { label: '稳定性评估', value: '稳定预期' },
      ],
      index: '03',
      meta: [],
      subtitle: '治疗线 2',
      timeframe: '2024.03 - 至今',
      title: '二线治疗',
      treatment: '培美曲塞 + 卡铂 + 赛沃替尼 (Savolitinib)',
    },
  ]
}
