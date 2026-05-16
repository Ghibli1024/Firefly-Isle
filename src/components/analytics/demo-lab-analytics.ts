/**
 * [INPUT]: 依赖 @/components/record/demo-record 的默认病例，依赖 @/lib/clinical-analysis 的结果类型，依赖 @/types/patient 的 LabResult 与 PatientRecord 类型。
 * [OUTPUT]: 对外提供 demoLabResults、demoLabAnalyticsRecord 与 demoClinicalAnalysisResult。
 * [POS]: components/analytics 的全产品 Demo 数据源，把本地三份实验室表格压缩成网页端趋势 fixture，并为公开 Demo 病历/统计/AI 预览提供同一语义患者记录。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { demoPatientRecord } from '@/components/record/demo-record'
import type { ClinicalAnalysisResult } from '@/lib/clinical-analysis'
import type { LabResult, LabResultCategory, PatientRecord } from '@/types/patient'

type DemoLabRow = {
  code: string
  name: string
  unit?: string
  referenceLow?: number
  referenceHigh?: number
  values: Array<number | null>
}

type DemoLabSheet = {
  category: LabResultCategory
  dates: string[]
  rows: DemoLabRow[]
}

const demoLabSheets: DemoLabSheet[] = [
  {
    category: 'blood-routine',
    dates: [
      '2025-09-19', '2025-09-30', '2025-10-16', '2025-10-30', '2025-11-12', '2025-11-27', '2025-12-11', '2026-01-08', '2026-02-05', '2026-03-03', '2026-04-02', '2026-04-30',
    ],
    rows: [
      { code: 'wbc', name: '白细胞', unit: '10^9/L', referenceLow: 3.5, referenceHigh: 9.5, values: [4.7, 2.6, 2.3, 2.2, 2.4, 2.4, 2.6, 2.4, 1.8, 2.1, 2.1, 2] },
      { code: 'neutrophil_percent', name: '中性粒细胞百分比', unit: '%', referenceLow: 40, referenceHigh: 75, values: [69.3, 52.8, 53.4, 59.8, 52.7, 61.4, 52.6, 49.5, 47.6, 51.7, 50.7, 52.6] },
      { code: 'lymphocyte_percent', name: '淋巴细胞百分比', unit: '%', referenceLow: 20, referenceHigh: 50, values: [24.4, 43.2, 38.4, 35.2, 38.7, 31, 33.4, 38.4, 42.3, 40.6, 39.8, 39.7] },
      { code: 'monocyte_percent', name: '单核细胞百分比', unit: '%', referenceLow: 3, referenceHigh: 10, values: [4.1, 2.9, 7.6, 3.8, 7.7, 5.4, 11.3, 10.5, 8.6, 5.9, 8, 6.4] },
      { code: 'eosinophil_percent', name: '嗜酸性粒细胞百分比', unit: '%', referenceLow: 0.4, referenceHigh: 8, values: [1.9, 0.8, 1.2, 0.3, 0.3, 1.2, 2, 1.1, 0.6, 1, 0.7, 0.5] },
      { code: 'basophil_percent', name: '嗜碱性粒细胞百分比', unit: '%', referenceLow: 0, referenceHigh: 1, values: [0.3, 0.3, 0.3, 0.9, 0.6, 1, 0.7, 0.5, 0.9, 0.8, 0.8, 0.8] },
      { code: 'neutrophil_abs', name: '中性粒细胞绝对值', unit: '10^9/L', referenceLow: 1.8, referenceHigh: 6.3, values: [3.3, 1.4, 1.2, 1.3, 1.3, 1.5, 1.4, 1.2, 0.9, 1.1, 1.1, 1.1] },
      { code: 'lymphocyte_abs', name: '淋巴细胞绝对值', unit: '10^9/L', referenceLow: 1.1, referenceHigh: 3.2, values: [1.1, 1.1, 0.9, 0.8, 0.9, 0.7, 0.9, 0.9, 0.8, 0.9, 0.8, 0.8] },
      { code: 'monocyte_abs', name: '单核细胞绝对值', unit: '10^9/L', referenceLow: 0.1, referenceHigh: 0.6, values: [0.2, 0.1, 0.2, 0.1, 0.2, 0.1, 0.3, 0.3, 0.2, 0.1, 0.2, 0.1] },
      { code: 'eosinophil_abs', name: '嗜酸性粒细胞绝对值', unit: '10^9/L', referenceLow: 0.02, referenceHigh: 0.52, values: [0.09, 0.02, 0.01, 0.01, 0.01, 0.03, 0.05, 0.03, 0.01, 0.02, 0.01, 0.01] },
      { code: 'basophil_abs', name: '嗜碱性粒细胞绝对值', unit: '10^9/L', referenceLow: 0, referenceHigh: 0.06, values: [0.01, 0.01, 0.01, 0.02, 0.01, 0.02, 0.02, 0.01, 0.02, 0.02, 0.02, 0.02] },
      { code: 'rbc', name: '红细胞计数', unit: '10^12/L', referenceLow: 3.8, referenceHigh: 5.1, values: [4.54, 4.16, 3.66, 3.66, 3.49, 3.53, 3.41, 3.34, 3.11, 3.52, 3.61, 3.57] },
      { code: 'hemoglobin', name: '血红蛋白', unit: 'g/L', referenceLow: 115, referenceHigh: 150, values: [142, 131, 114, 120, 120, 121, 117, 123, 116, 130, 131, 130] },
      { code: 'hematocrit', name: '红细胞压积', unit: '%', referenceLow: 35, referenceHigh: 45, values: [41.4, 38.3, 33.6, 35, 34.1, 35.6, 35.1, 35.4, 33.1, 37.1, 38.3, 38.2] },
      { code: 'mcv', name: '红细胞平均体积', unit: 'fL', referenceLow: 82, referenceHigh: 100, values: [91.2, 92, 91.9, 95.7, 97.7, 100.8, 102.9, 105.9, 106.5, 105.4, 106.1, 107] },
      { code: 'mch', name: '红细胞平均血红蛋白量', unit: 'pg', referenceLow: 27, referenceHigh: 34, values: [31.3, 31.4, 31.2, 32.9, 34.4, 34.4, 34.2, 36.7, 37.2, 36.9, 36.1, 36.4] },
      { code: 'mchc', name: '红细胞平均血红蛋白浓度', unit: 'g/L', referenceLow: 316, referenceHigh: 354, values: [343, 342, 339, 343, 352, 340, 333, 347, 350, 350, 342, 340] },
      { code: 'rdw_cv', name: '红细胞分布宽度-CV值', unit: '%', referenceLow: 11, referenceHigh: 14.5, values: [12.6, 12.2, 12, 15, 16.3, 16.9, 17, 14.8, 13, 12.7, 13.6, 13.2] },
      { code: 'platelet', name: '血小板', unit: '10^9/L', referenceLow: 125, referenceHigh: 350, values: [232, 197, 177, 311, 160, 315, 160, 171, 143, 145, 170, 169] },
      { code: 'mpv', name: '血小板平均体积', unit: 'fL', referenceLow: 6.5, referenceHigh: 13, values: [10, 9.8, 8.7, 9, 9.2, 9.1, 9.2, 9.2, 9.2, 9.7, 9.4, 9.4] },
      { code: 'pct', name: '血小板压积', unit: '%', referenceLow: 0.11, referenceHigh: 0.28, values: [0.23, 0.19, 0.15, 0.28, 0.15, 0.29, 0.15, 0.16, 0.13, 0.14, 0.16, 0.16] },
      { code: 'pdw', name: '血小板分布宽度', unit: 'fL', referenceLow: 10, referenceHigh: 17, values: [16.3, 16.2, 16.3, 16.1, 16.5, 16.1, 16.2, 16.6, 16.8, 16.5, 16.7, 16.7] },
      { code: 'p_lcr', name: '大血小板比率', unit: '%', referenceLow: 13, referenceHigh: 42, values: [26.6, 24.4, 18.1, 17.6, 20.6, 19, 19.5, 20.1, 20.5, 23, 20.5, 20.7] },
      { code: 'ret_percent', name: '网织红细胞百分率', unit: '%', referenceLow: 0.5, referenceHigh: 1.5, values: [2.2, 0.6, 1.4, 1.1, 1.6, 1.5, 1.5, 2, 1.8, 1, 1.6, 1.3] },
      { code: 'ret_abs', name: '网织红细胞绝对值', unit: '10^12/L', referenceLow: 0.028, referenceHigh: 0.075, values: [0.1, 0.026, 0.051, 0.039, 0.057, 0.054, 0.05, 0.067, 0.057, 0.035, 0.059, 0.048] },
      { code: 'ret_maturity_index', name: '网织红细胞成熟指数', unit: '%', referenceLow: 10.3, referenceHigh: 34, values: [15.1, 9.9, 34.5, 24.4, 34.4, 21.7, 21.9, 34.5, 27.1, 16.9, 30.8, 28] },
      { code: 'lfr', name: '低荧光网织红细胞百分率', unit: '%', referenceLow: 80, referenceHigh: 90, values: [84.9, 90.1, 65.5, 75.6, 65.6, 78.3, 78.1, 65.5, 72.9, 83.1, 69.2, 72] },
      { code: 'mfr', name: '中荧光网织红细胞百分率', unit: '%', referenceLow: 7, referenceHigh: 15, values: [13.7, 9.5, 21.2, 19.9, 21.5, 16.5, 18.2, 20.5, 17.3, 13, 19.2, 18.7] },
      { code: 'hfr', name: '高荧光网织红细胞百分率', unit: '%', referenceLow: 1, referenceHigh: 4.5, values: [1.4, 0.4, 13.3, 4.5, 12.9, 5.2, 3.7, 14, 9.8, 3.9, 11.6, 9.3] },
      { code: 'nlr', name: 'NLR', referenceLow: 1, referenceHigh: 2.9, values: [3, 1.27273, 1.33333, 1.625, 1.444, 2.143, 1.55556, 1.33333, 1.125, 1.22222, 1.375, 1.375] },
      { code: 'plr', name: 'PLR', referenceLow: 100, referenceHigh: 150, values: [210.909, 179.091, 196.667, 388.75, 177.778, 450, 177.778, 190, 178.75, 161.111, 212.5, 211.25] },
      { code: 'mlr', name: 'MLR', referenceLow: 0.1, referenceHigh: 0.3, values: [0.181818, 0.090909, 0.222222, 0.125, 0.222, 0.143, 0.333333, 0.333333, 0.25, 0.111111, 0.25, 0.125] },
    ],
  },
  {
    category: 'blood-biochemistry',
    dates: [
      '2025-09-19', '2025-09-30', '2025-10-16', '2025-10-30', '2025-11-12', '2025-11-27', '2025-12-11', '2026-01-08', '2026-02-05', '2026-03-03', '2026-04-02', '2026-04-30',
    ],
    rows: [
      { code: 'total_protein', name: '总蛋白', unit: 'g/L', referenceLow: 65, referenceHigh: 85, values: [74.1, 73.1, 70, 71.5, 71.4, 72, 71.2, 70.4, 66.3, 74.8, 73.3, 71.8] },
      { code: 'albumin', name: '白蛋白', unit: 'g/L', referenceLow: 40, referenceHigh: 55, values: [46.4, 47.5, 44.7, 47.3, 46.2, 47, 44.4, 45.2, 44.9, 45.9, 47.9, 48.1] },
      { code: 'globulin', name: '球蛋白', unit: 'g/L', referenceLow: 20, referenceHigh: 40, values: [27.7, 25.6, 25.3, 24.2, 25.2, 25, 26.8, 25.2, 21.4, 28.9, 25.4, 23.7] },
      { code: 'ag_ratio', name: '白蛋白/球蛋白', referenceLow: 1.2, referenceHigh: 2.4, values: [1.68, 1.86, 1.77, 1.95, 1.83, 1.88, 1.66, 1.79, 2.1, 1.59, 1.89, 2.03] },
      { code: 'alt', name: '丙氨酸氨基转移酶', unit: 'U/L', referenceLow: 7, referenceHigh: 40, values: [15, 13, 10, 15, 15, 12, 11, 11, 10, 14, 13, 13] },
      { code: 'alp', name: '碱性磷酸酶', unit: 'U/L', referenceLow: 35, referenceHigh: 135, values: [61, 57, 56, 58, 56, 54, 53, 53, 45, 52, 48, 47] },
      { code: 'ast', name: '天门冬氨酸氨基转移酶', unit: 'U/L', referenceLow: 13, referenceHigh: 35, values: [18, 19, 16, 21, 19, 19, 20, 18, 16, 22, 20, 17] },
      { code: 'che', name: '胆碱脂酶', unit: 'U/L', referenceLow: 4500, referenceHigh: 12000, values: [11328, 11164, 10082, 11083, 10832, 10846, 10197, 11027, 10415, 10886, 11296, 11511] },
      { code: 'ggt', name: 'γ-谷氨酰转移酶', unit: 'U/L', referenceLow: 7, referenceHigh: 45, values: [22, 22, 25, 33, 33, 25, 25, 22, 17, 19, 21, 22] },
      { code: 'ldh', name: '乳酸脱氢酶', unit: 'U/L', referenceLow: 0, referenceHigh: 240, values: [193, 187, 190, 228, 192, 203, 195, 218, 216, 246, 236, 217] },
      { code: 'ck', name: '肌酸激酶', unit: 'U/L', referenceLow: 10, referenceHigh: 190, values: [62, 71, 66, 76, 59, 74, 135, 63, 76, 161, 118, 61] },
      { code: 'sod', name: '超氧化物歧化酶', unit: 'U/mL', referenceLow: 110, referenceHigh: 215, values: [147, 148, 150, 159, 158, 155, 150, 149, 148, 166, 201, 189] },
      { code: 'beta_hydroxybutyrate', name: 'β-羟丁酸', unit: 'mmol/L', referenceLow: 0.02, referenceHigh: 0.27, values: [0.19, 0.08, 0.21, 0.08, 0.1, 0.18, 0.14, 0.11, 0.17, 0.06, 0.11, 0.1] },
      { code: 'total_bilirubin', name: '总胆红素', unit: 'μmol/L', referenceLow: 0, referenceHigh: 20, values: [13.8, 17.1, 7.2, 9.9, 6.8, 9.5, 7.3, 9, 10.8, 6.9, 10, 9.9] },
      { code: 'direct_bilirubin', name: '直接胆红素', unit: 'μmol/L', referenceLow: 0, referenceHigh: 7, values: [4.8, 6.4, 2.8, 4.1, 3.2, 4, 3.4, 3.7, 4.6, 2.5, 3.9, 4.1] },
      { code: 'indirect_bilirubin', name: '间接胆红素', unit: 'μmol/L', referenceLow: 0, referenceHigh: 13, values: [9, 10.7, 4.4, 5.8, 3.6, 5.5, 3.9, 5.3, 6.2, 4.4, 6.1, 5.8] },
      { code: 'afu', name: 'α-L-岩藻糖苷酶', unit: 'U/L', referenceLow: 10, referenceHigh: 40, values: [14.9, 14.3, 13.7, 14.1, 16.3, 15.5, 15.1, 15.3, 13.6, 14.1, 16.4, 17.5] },
      { code: 'gpda', name: '甘氨酰脯氨酸二肽氨基肽酶', unit: 'U/L', referenceLow: 44, referenceHigh: 116, values: [126.4, 130.5, 116.7, 123.5, 120.5, 121.9, 115.6, 112.9, 109.9, 116.4, 123.4, 126.8] },
      { code: 'total_bile_acid', name: '总胆汁酸', unit: 'μmol/L', referenceLow: 0, referenceHigh: 10, values: [1.3, 3.2, 3.4, 3.2, 4.3, 2.3, 2.4, 1.3, 1.3, 4.5, 5.9, 6.6] },
      { code: 'crp', name: 'C-反应蛋白', unit: 'mg/L', referenceLow: 0, referenceHigh: 10, values: [0.37, 0.9, 1.72, 1.55, 1.47, 0.8, 2.37, 0.8, 0.27, 1.39, 0.51, 0.52] },
      { code: 'urea', name: '尿素', unit: 'mmol/L', referenceLow: 2.2, referenceHigh: 7.8, values: [4.1, 5.35, 4.76, 5.76, 5.38, 5.78, 4.65, 4.5, 3.67, 5.72, 5.02, 5.25] },
      { code: 'creatinine', name: '肌酐', unit: 'μmol/L', referenceLow: 41, referenceHigh: 81, values: [52.6, 59.1, 47.9, 58.6, 45.4, 55.5, 50.4, 47, 42.8, 55, 47.6, 46.6] },
      { code: 'uric_acid', name: '尿酸', unit: 'μmol/L', referenceLow: 135, referenceHigh: 357, values: [213, 182, 178, 203, 175, 178, 205, 176, 158, 177, 171, 176] },
      { code: 'glucose', name: '葡萄糖', unit: 'mmol/L', referenceLow: 3.9, referenceHigh: 6.1, values: [4.8, 4.81, 4.73, 4.88, 5.32, 4.43, 5.01, 5.12, 4.7, 5.05, 5.12, 5.23] },
      { code: 'triglyceride', name: '甘油三酯', unit: 'mmol/L', referenceLow: 0.6, referenceHigh: 1.6, values: [1.41, 0.97, 0.53, 0.68, 0.59, 0.7, 0.74, 0.79, 0.66, 1.06, 1.23, 0.98] },
      { code: 'beta2_microglobulin', name: 'β2-微球蛋白', unit: 'mg/L', referenceLow: 1000, referenceHigh: 3000, values: [1866, 1528, 1656, 1669, 1586, 1616, 1827, 1719, 1476, 1682, 1598, 1623] },
      { code: 'total_cholesterol', name: '总胆固醇', unit: 'mmol/L', referenceLow: 3.6, referenceHigh: 6.1, values: [3.94, 3.25, 2.99, 3.15, 3.04, 3.17, 3.3, 3.08, 2.89, 3.53, 3.68, 3.38] },
      { code: 'hdl_c', name: '高密度脂蛋白胆固醇', unit: 'mmol/L', referenceLow: 1.16, referenceHigh: 1.55, values: [1.14, 1.26, 1.17, 1.18, 1.28, 1.27, 1.14, 1.32, 1.24, 1.37, 1.49, 1.49] },
      { code: 'ldl_c', name: '低密度脂蛋白胆固醇', unit: 'mmol/L', referenceLow: 2.07, referenceHigh: 3.1, values: [2.3, 1.66, 1.47, 1.53, 1.66, 1.48, 1.57, 1.61, 1.5, 1.89, 1.91, 1.85] },
      { code: 'apo_a1', name: '载脂蛋白A-I', unit: 'g/L', referenceLow: 1, referenceHigh: 1.6, values: [1.2, 1.27, 1.06, 1.18, 1.22, 1.22, 1.12, 1.19, 1.07, 1.26, 1.38, 1.46] },
      { code: 'apo_b', name: '载脂蛋白B', unit: 'g/L', referenceLow: 0.6, referenceHigh: 1.1, values: [0.71, 0.55, 0.46, 0.5, 0.52, 0.47, 0.5, 0.5, 0.45, 0.57, 0.58, 0.58] },
      { code: 'lipoprotein_a', name: '脂蛋白a', unit: 'mg/L', referenceLow: 0, referenceHigh: 300, values: [323, 314, 287, 307, 257, 298, 278, 271, 231, 283, 304, 265] },
      { code: 'sd_ldl', name: '小而密低密度脂蛋白', unit: 'mmol/L', referenceLow: 0.24, referenceHigh: 1.39, values: [0.76, 0.6, 0.44, 0.54, 0.57, 0.5, null, 0.54, 0.46, 0.57, 0.5, 0.4] },
      { code: 'apo_e', name: '载脂蛋白E', unit: 'mg/L', referenceLow: 29, referenceHigh: 53, values: [41.4, 45.4, 39.3, 35.3, 40.9, 33.9, null, 23.5, 24.2, 29.9, 32, 33.6] },
      { code: 'potassium', name: '钾', unit: 'mmol/L', referenceLow: 3.5, referenceHigh: 5.3, values: [4.18, 4.17, 4.36, 4.48, 4.37, 4.54, 4.11, 4.44, 4.1, 4.83, 4.23, 3.91] },
      { code: 'sodium', name: '钠', unit: 'mmol/L', referenceLow: 137, referenceHigh: 147, values: [140, 141, 145, 141, 142, 142, 142, 144, 144, 143, 143, 139] },
      { code: 'chloride', name: '氯', unit: 'mmol/L', referenceLow: 99, referenceHigh: 110, values: [102, 104, 107, 103, 106, 104, 105, 103, 106, 106, 102, 101] },
      { code: 'calcium', name: '钙', unit: 'mmol/L', referenceLow: 2, referenceHigh: 2.6, values: [2.37, 2.15, 2.28, 2.31, 2.31, 2.26, 2.32, 2.3, 2.23, 2.36, 2.39, 2.38] },
      { code: 'phosphorus', name: '磷', unit: 'mmol/L', referenceLow: 0.8, referenceHigh: 1.45, values: [1.18, 0.99, 1.07, 1.26, 1.04, 1.12, 1.09, 0.9, 0.91, 1.17, 1.19, 1.15] },
      { code: 'magnesium', name: '镁', unit: 'mmol/L', referenceLow: 0.7, referenceHigh: 1.1, values: [0.81, 0.8, 0.81, 0.82, 0.78, 0.86, 0.79, 0.8, 0.77, 0.86, 0.85, 0.79] },
      { code: 'ada', name: '腺苷脱氨酶', unit: 'U/L', referenceLow: 0, referenceHigh: 25, values: [4.5, 4.1, 3, 3.5, 4.5, 3.7, 4.5, 5, 3.9, 3.6, 4.5, 4.3] },
      { code: 'cystatin_c', name: '胱抑素C', unit: 'mg/L', referenceLow: 0.59, referenceHigh: 1.16, values: [0.58, 0.48, 0.48, 0.46, 0.47, 0.49, 0.52, 0.52, 0.47, 0.52, 0.74, 0.83] },
      { code: 'prealbumin', name: '前白蛋白', unit: 'mg/L', referenceLow: 170, referenceHigh: 420, values: [386, 400, 319, 372, 373, 345, 311, 342, 304, 375, 299, 310] },
      { code: 'osmolality', name: '渗透压', unit: 'mOsm/kg', referenceLow: 280, referenceHigh: 320, values: [297, 301, 308, 302, 303, 303, 302, 307, 305, 306, 305, 296] },
      { code: 'transferrin', name: '转铁蛋白', unit: 'g/L', referenceLow: 2.02, referenceHigh: 3.46, values: [2.55, 2.45, 2.32, 2.64, 4.2, 5.06, 4.15, 2.4, 2.17, 2.26, 2.38, 2.48] },
      { code: 'zinc', name: '锌', unit: 'μmol/L', referenceLow: 11, referenceHigh: 17.5, values: [12.4, 9.9, 10.8, 10.2, 11.5, 10.1, 8.5, 11.7, 11.6, 7.7, 13, 14.6] },
      { code: 'copper', name: '铜', unit: 'μmol/L', referenceLow: 12.5, referenceHigh: 23.5, values: [16.4, 13.8, 19.2, 18.2, 16.3, 16, 17.3, 14.9, 11.8, 14.1, 16.5, 16.5] },
      { code: 'free_fatty_acid', name: '游离脂肪酸', unit: 'μmol/L', referenceLow: 100, referenceHigh: 900, values: [515, 244, 445, 264, 344, 424, 350, 286, 361, 138, 510, 486] },
      { code: 'sialic_acid', name: '唾液酸', unit: 'mg/L', referenceLow: 45.6, referenceHigh: 75.4, values: [56, 54.9, 64.7, 60, 58.3, 54.3, 55.3, 60.2, 50.2, 52.6, 55.9, 55.1] },
      { code: 'lipase', name: '脂肪酶（LIP）', unit: 'U/L', referenceLow: 13, referenceHigh: 60, values: [37.9, 44.3, 37.8, 39.9, 34.5, 42.4, 34.1, 35.4, 32.2, 39.7, 42.8, 38.5] },
      { code: 'carbon_dioxide', name: '二氧化碳', unit: 'mmol/L', referenceLow: 21, referenceHigh: 29, values: [23.9, 23.9, 24.5, 21.8, 27, 24.5, 24.1, 28, 29, 23.3, 26.5, 26.8] },
      { code: 'homocysteine', name: '同型半胱氨酸', unit: 'μmol/L', referenceLow: 0.8, referenceHigh: 15.9, values: [11.4, 9.8, 11.4, 12.2, 13.3, 10.9, 8.2, 10.6, 10.1, 7.8, 7.5, 6.5] },
      { code: 'saa', name: '血清淀粉样蛋白A', unit: 'mg/L', referenceLow: 0, referenceHigh: 10, values: [5, 8, 10, 9, 16, 7, 14, 9, 3, 8, 6, 5] },
      { code: 'retinol_binding_protein', name: '视黄醇结合蛋白', unit: 'mg/L', referenceLow: 25, referenceHigh: 70, values: [59, 63, 41, 51, 52, 55, 44, 45, 36, 52, 53, 54] },
      { code: 'lap', name: '亮氨酸氨基肽酶', unit: 'U/L', referenceLow: 20, referenceHigh: 60, values: [28.6, 28.8, 27.8, 29.8, 30.7, 28.8, 29.1, 29.3, 27, 29.8, 30.3, 32.4] },
      { code: 'amylase', name: '淀粉酶', unit: 'U/L', referenceLow: 28, referenceHigh: 100, values: [53, 57, 46, 55, 58, 60, 54, 62, 50, 63, 63, 62] },
      { code: 'egfr', name: '肾小球滤过率', unit: 'mL/min/1.73m²', values: [106, 102, 110, 103, 111, 104, 108, 110, 113, 104, 109, 110] },
    ],
  },
  {
    category: 'tumor-marker',
    dates: [
      '2024-07-03', '2025-01-15', '2025-04-16', '2025-07-19', '2025-10-16', '2025-11-12', '2025-11-27', '2025-12-11', '2026-01-08', '2026-02-05', '2026-03-04', '2026-04-02', '2026-04-30',
    ],
    rows: [
      { code: 'cea', name: '癌胚抗原', unit: 'ng/mL', referenceLow: 0, referenceHigh: 5, values: [2.04, 1.53, 1.58, 2.2, 2.01, 1.58, 1.45, 1.68, 1.49, 1.54, 1.84, 1.59, 1.67] },
      { code: 'ca125', name: '糖类抗原125', unit: 'U/mL', referenceLow: 0, referenceHigh: 35, values: [8.78, 10.19, 10.07, 13.75, 6.14, 5.39, null, 5.44, null, 4.48, 5.16, 5.1, 4.33] },
      { code: 'ca15_3', name: '糖类抗原153', unit: 'U/mL', referenceLow: 0, referenceHigh: 34.5, values: [8.2, 8, 7.6, 7.9, 10, 15.3, 16.5, 15.9, 19.3, 15.7, 14.9, 16.7, 18.6] },
      { code: 'ca19_9', name: '糖类抗原199', unit: 'U/mL', referenceLow: 0, referenceHigh: 37, values: [31.41, 75.58, 45.18, null, 9.37, 10, null, 10.3, null, 11.6, null, 11.2, 10.9] },
      { code: 'ca50', name: '糖类抗原50', unit: 'U/mL', referenceLow: 0, referenceHigh: 25, values: [5.23, 10.25, 7.85, 6.19, null, null, null, null, null, null, null, null, null] },
      { code: 'ca72_4', name: '糖类抗原724', unit: 'U/mL', referenceLow: 0, referenceHigh: 6.9, values: [null, null, null, null, null, null, null, null, null, null, 6.27, null, null] },
    ],
  },
]

export const demoLabResults: LabResult[] = demoLabSheets.flatMap((sheet) =>
  sheet.rows.flatMap((row) =>
    row.values.flatMap((value, index): LabResult[] =>
      value === null
        ? []
        : [
            {
              category: sheet.category,
              itemCode: row.code,
              itemName: row.name,
              referenceHigh: row.referenceHigh,
              referenceLow: row.referenceLow,
              source: 'test',
              testDate: sheet.dates[index],
              unit: row.unit,
              value,
            },
          ],
    ),
  ),
)

export const demoLabAnalyticsRecord: PatientRecord = {
  ...demoPatientRecord,
  basicInfo: {
    ...demoPatientRecord.basicInfo,
    name: '张某某',
  },
  id: 'demo',
  labResults: demoLabResults,
}

export const demoClinicalAnalysisResult: ClinicalAnalysisResult = {
  attentionPoints: [
    '当前资料显示治疗线较长，复核时应优先核对每线起止时间、方案组成和停药原因是否完整。',
    '2025 年后白细胞、中性粒细胞绝对值和红细胞相关指标多次低于参考范围，适合在复诊前整理成趋势问题。',
    'CA15-3 在近几次检测中有波动上行信号，但仍需结合影像、症状和医生评估，不能单独判断疾病进展。',
  ],
  disclaimer: 'Demo 示例仅展示病历整理和随访沟通方式，不构成诊断、疾病进展判断、用药建议或治疗指令。',
  followUpQuestions: [
    '最近一次影像复查日期、结果和下一次复查计划是什么？',
    '当前治疗线是否仍在继续，是否有减量、暂停或不良反应处理记录？',
    '白细胞和中性粒细胞偏低时，是否已有医生给出的复查或处理安排？',
  ],
  labTrendSummary: [
    '血常规显示 2025-09 至 2026-04 存在多次白细胞和中性粒细胞偏低记录，适合按时间轴随访复核。',
    '血生化整体较稳定，部分脂蛋白、锌、转铁蛋白等项目有异常或波动，需要结合营养状态和用药背景阅读。',
    '肿瘤标志物中 CA15-3 在 2025-10 之后有多点变化，页面只提示趋势线索，不作进展结论。',
  ],
  treatmentSummary: [
    'Demo 病例从 2021.07 初发治疗开始，2022.10 后进入多线复发/晚期治疗记录。',
    '治疗线覆盖 CDK4/6 抑制剂、化疗、ADC、免疫联合和后续靶向/内分泌组合，适合展示长病程整理能力。',
    '第 9 线为当前线，结局字段仍待补充，Demo 用它展示缺失字段高亮和后续复核入口。',
  ],
}
