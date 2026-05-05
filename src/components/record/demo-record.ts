/**
 * [INPUT]: 依赖 @/types/patient 的 PatientRecord 类型。
 * [OUTPUT]: 对外提供乳腺癌 demoPatientRecord 与 demoTreatmentGanttSupplementNotes。
 * [POS]: components/record 的默认病例 fixture，作为 /record/demo 与 demo-only 甘特补充资料的数据源，不承载展示文案组装。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { PatientRecord } from '@/types/patient'

export const demoPatientRecord: PatientRecord = {
  basicInfo: {
    diagnosisDate: '2021.07',
    gender: '女',
    stage: '复发/晚期',
    tumorType: '乳腺癌',
  },
  initialOnset: {
    immunohistochemistry: 'Luminal B；ER90%+，PR90%+，HER2 0，AR30%，Ki67 60%。',
    triggerDate: '2021.07',
    treatment: 'AC方案4次 / 放疗25+5 / 依西美坦 + 亮丙',
  },
  treatmentLines: [
    {
      biopsy: '2022.10 骨转',
      endDate: '2023.05',
      lineNumber: 1,
      regimen: '阿贝西利 + 氟维司群 + 亮丙瑞林 + 地舒单抗',
      startDate: '2022.10',
    },
    {
      endDate: '2023.10',
      lineNumber: 2,
      regimen: '哌柏西利 + 氟维司群 + 亮丙瑞林 + 地舒单抗',
      startDate: '2023.05',
    },
    {
      biopsy: '2023.10 肝转单发',
      endDate: '2023.11',
      geneticTest: '2023.11 血液 NGS：PTEN 拷贝数缺失，FGFR1 拷贝数扩增，FANCI 胚系突变。',
      lineNumber: 3,
      regimen: '瑞波西利 + 来曲唑片；氟维司群 + 亮丙瑞林 + 地舒单抗',
      startDate: '2023.10',
    },
    {
      biopsy: '2023.12 肝转多发；2 疗后进展。',
      endDate: '2024.02',
      lineNumber: 4,
      regimen: '紫杉醇脂质体 + 卡培他滨',
      startDate: '2023.12',
    },
    {
      biopsy: '2024.02 肝部穿刺',
      endDate: '2024.07',
      immunohistochemistry: '内分泌变三阴：ER-，PR5%+，HER2 0，AR20%，Ki67 80%。',
      lineNumber: 5,
      regimen: '戈沙妥珠单抗',
      startDate: '2024.03',
    },
    {
      biopsy: '2024.08 肝穿',
      endDate: '2024.09',
      geneticTest: 'PTEN缺失，CCND1/FGFR1扩增，FGF19/FGF3/FGF4扩增，FANCI胚系，CPS<1。',
      immunohistochemistry: 'ER-，PR60%，Ki67 80%，HER2 0，AR80%。',
      lineNumber: 6,
      regimen: '吉西他滨 + 卡铂',
      startDate: '2024.08',
    },
    {
      biopsy: '特瑞普利 1 疗后因肌酸激酶高停用；该线共 9 疗。',
      endDate: '2025.03',
      lineNumber: 7,
      regimen: '艾立布林 + 特瑞普利 + 安罗替尼',
      startDate: '2024.10',
    },
    {
      biopsy: '2025.09.11 开始改双周疗。',
      endDate: '2025.09.25',
      lineNumber: 8,
      regimen: '白紫 + 依维莫司 + 托瑞米芬 + 安罗替尼',
      startDate: '2025.04',
    },
    {
      biopsy: '阿帕替尼因考虑穿刺先暂缓服用；当前线，结局待补充。',
      lineNumber: 9,
      regimen: '氟唑帕利 + 哌柏西利 + 托瑞米芬',
      startDate: '2025.10.01 起',
    },
  ],
}

export const demoTreatmentGanttSupplementNotes = {
  initial: '初发 IHC：Luminal B；ER90%+，PR90%+，HER2 0，AR30%，Ki67 60%。',
  'line-1': '2022.10 骨转；进入复发/晚期治疗线，地舒单抗承担骨保护信息。',
  'line-2': '原始图未列额外免疫组化、基因检测或疗效补充。',
  'line-3': '2023.10 肝转单发；2023.11 血液 NGS：PTEN 拷贝数缺失，FGFR1 拷贝数扩增，FANCI 胚系突变。',
  'line-4': '2023.12 肝转多发；2 疗后进展。',
  'line-5': '2024.02 肝部穿刺后 IHC 改变，内分泌变三阴：ER-，PR5%+，HER2 0，AR20%，Ki67 80%。',
  'line-6': '2024.08 肝穿：ER-，PR60%，Ki67 80%，HER2 0，AR80%；NGS：PTEN缺失，CCND1/FGFR1扩增，FGF19/FGF3/FGF4扩增，FANCI胚系，CPS<1。',
  'line-7': '特瑞普利 1 疗后因肌酸激酶高停用；该线共 9 疗。',
  'line-8': '2025.09.11 开始改双周疗。',
  'line-9': '阿帕替尼因考虑穿刺先暂缓服用；当前线，结局待补充。',
} satisfies Record<string, string>
