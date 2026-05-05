/**
 * [INPUT]: 无运行时依赖，只描述 record dossier 展示层的数据形状。
 * [OUTPUT]: 对外提供 ExportFormat、Metric、EvidenceCard、TimelineEntry 等病例详情展示类型。
 * [POS]: components/record 的类型边界，被 dossier、文案与派生数据模块共享。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export type ExportFormat = 'pdf' | 'png'

export type Metric = {
  label: string
  value: string
}

export type EvidenceItem = {
  label: string
  value: string
}

export type EvidenceCard = {
  title: string
  items: EvidenceItem[]
}

export type TimelineEntry = {
  badge?: string
  body: string[]
  cards: EvidenceCard[]
  footMetrics?: Metric[]
  highlight?: {
    body: string
    title: string
  }
  index: string
  meta: Metric[]
  subtitle: string
  timeframe: string
  title: string
  treatment: string
}
