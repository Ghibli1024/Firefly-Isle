/**
 * [INPUT]: 无运行时框架依赖，只接收 BasicInfo 中的身高 cm 与体重 kg 数值。
 * [OUTPUT]: 对外提供 calculateBmi、formatHeight、formatWeight 与 formatBmi 患者体格指标格式化工具。
 * [POS]: lib 的患者指标纯逻辑，被 workspace 预览与 record dossier 共用，避免 BMI 计算在展示层重复分叉。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
function isPositiveFinite(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function formatMetric(value: number | undefined, unit: string) {
  if (!isPositiveFinite(value)) {
    return '--'
  }

  return `${Number.isInteger(value) ? value : Number(value.toFixed(1))} ${unit}`
}

export function calculateBmi(heightCm: number | undefined, weightKg: number | undefined) {
  if (!isPositiveFinite(heightCm) || !isPositiveFinite(weightKg)) {
    return undefined
  }

  const heightMeters = heightCm / 100
  return weightKg / (heightMeters * heightMeters)
}

export function formatHeight(heightCm: number | undefined) {
  return formatMetric(heightCm, 'cm')
}

export function formatWeight(weightKg: number | undefined) {
  return formatMetric(weightKg, 'kg')
}

export function formatBmi(heightCm: number | undefined, weightKg: number | undefined) {
  const bmi = calculateBmi(heightCm, weightKg)
  return isPositiveFinite(bmi) ? bmi.toFixed(1) : '--'
}
