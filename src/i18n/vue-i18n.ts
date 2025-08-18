import { createI18n } from 'vue-i18n'

// 简化的语言资源，之后可以逐步迁移完整的语言包
const messages = {
  en: {
    title: 'ChartDB Vue Edition',
    editor: 'Chart Editor',
    examples: 'Examples Page',
    templates: 'Templates Page',
    template: 'Template Detail Page',
    clone: 'Clone Template Page',
    notFound: 'Page Not Found',
    backHome: 'Back to Home'
  },
  'zh-CN': {
    title: 'ChartDB Vue版本',
    editor: '图表编辑器',
    examples: '示例页面',
    templates: '模板页面',
    template: '模板详情页面',
    clone: '克隆模板页面',
    notFound: '页面未找到',
    backHome: '返回首页'
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages
})
