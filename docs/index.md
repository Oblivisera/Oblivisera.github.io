---
layout: home

hero:
  name: Oblivisera
  text: 记录技术、思考与生活
  tagline: 把零散的知识沉淀成可以回看的东西
  image:
    src: /logo.svg
    alt: Oblivisera
  actions:
    - theme: brand
      text: 开始阅读
      link: /posts/
    - theme: alt
      text: 关于我
      link: /about

features:
  - icon: ✍️
    title: 用 Markdown 写作
    details: 所有文章都是纯 Markdown 文件，直接用任何编辑器书写，无需登录后台，不受平台限制。
  - icon: ⚡
    title: 极快的静态站点
    details: 构建产物是纯静态 HTML，配合 GitHub Pages 的 CDN，全球访问都很快，而且零服务器成本。
  - icon: 🔍
    title: 自带离线搜索
    details: 无需接入任何第三方搜索服务，构建时自动生成索引，支持中文全文检索。
  - icon: 🌗
    title: 自动暗色模式
    details: 跟随系统主题自动切换，也可以手动锁定，代码高亮在两种模式下都经过调校。
---

## 最近在写

- [你好，世界](./posts/hello-world) —— 这个博客的第一篇文章，聊聊为什么还要写博客
- [用 VitePress 搭建博客](./posts/build-blog-with-vitepress) —— 从零到上线 GitHub Pages 的完整流程
- [Markdown 写作速查](./posts/markdown-cheatsheet) —— 写文章时会用到的语法都在这

## 这个博客怎么用

想新增一篇文章，只需要在 `docs/posts/` 下新建一个 `.md` 文件，然后在
`docs/.vitepress/config.mts` 的 `sidebar` 里加一行链接，提交推送即可。
