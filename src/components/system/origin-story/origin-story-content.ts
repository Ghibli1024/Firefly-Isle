/**
 * [INPUT]: 不依赖运行时模块，只保存创作初衷纸页的公开摘要、来源归属与访问地址。
 * [OUTPUT]: 对外提供标题、副标题、摘要段落、正文拼接、来源标签/URL 与页脚文案。
 * [POS]: components/system/origin-story 的公开内容源，被纸页弹层与 Canvas 纹理层共同消费。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export const originStoryTitle = '为什么做一页萤屿'
export const originStorySubtitle = '内容整理自公开 YouTube 社区帖子'
export const originStorySourceLabel = '原帖：YouTube 社区动态'
export const originStorySourceUrl = 'https://www.youtube.com/post/Ugkx2pyfj6hZm_j7M4tjutIm7D9BFqg-mfyB'

export const storyParagraphs = [
  '诊疗经历常被写在检查单、聊天记录和零散回忆里。时间一久，重要节点会难以回望，也难以在就诊时清楚说明。',
  '一页萤屿希望把可以确认的病程、治疗与检验信息整理成一页可继续补全的时间线，帮助患者和家属看清已经走过的路。',
  '它的角色是整理与沟通的辅助工具：不替代医生诊断，也不替代任何治疗决定。',
  '如果这份起点与你有关，欢迎阅读公开原帖。',
]

export const originStoryText = storyParagraphs.join('\n\n')

export const originStoryFooter = '内容整理自公开来源；医疗决策请与专业医生共同作出。'
