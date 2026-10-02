import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import MermaidDiagram from './MermaidDiagram.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: { app: import('vue').App }) {
    // 全局注册，这样 Markdown 里可以直接用 <MermaidDiagram />
    // （config.mts 会把 ```mermaid 代码块转换成这个组件）
    app.component('MermaidDiagram', MermaidDiagram)
  }
}
