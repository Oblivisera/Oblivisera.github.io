import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import MermaidDiagram from './MermaidDiagram.vue'
import PostList from './PostList.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: { app: import('vue').App }) {
    // 全局注册，这样 Markdown 里可以直接写标签：
    //   <MermaidDiagram /> 由 config.mts 从 ```mermaid 代码块生成
    //   <PostList />       归档页 docs/posts/index.md 里使用
    app.component('MermaidDiagram', MermaidDiagram)
    app.component('PostList', PostList)
  }
}
