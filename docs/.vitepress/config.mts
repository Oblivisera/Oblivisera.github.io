import { defineConfig } from 'vitepress'

export default defineConfig({
  // 用户主页仓库发布在根路径，因此 base 保持 '/'
  // 如果以后改成项目仓库（如 github.com/Oblivisera/blog），需改为 '/blog/'
  base: '/',

  lang: 'zh-CN',
  title: 'Oblivisera',
  description: 'Oblivisera 的个人博客 —— 记录技术、思考与生活',

  // 文章目录里常出现中文和空格，链接检查放宽
  markdown: {
    lineNumbers: true,
    // 代码块配色
    theme: { light: 'github-light', dark: 'github-dark' }
  },

  // 最近更新时间基于 git 提交时间
  lastUpdated: true,

  // 构建时检查站内死链，但放行本地开发地址
  ignoreDeadLinks: [/^https?:\/\/localhost/],

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#3451b2' }],
    ['meta', { name: 'author', content: 'Oblivisera' }]
  ],

  themeConfig: {
    logo: '/logo.svg',

    // 顶部导航
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/', activeMatch: '/posts/' },
      { text: '关于', link: '/about' }
    ],

    // 左侧/右侧目录结构
    sidebar: {
      '/posts/': [
        {
          text: '文章',
          items: [
            { text: '文章归档', link: '/posts/' },
            { text: '你好，世界', link: '/posts/hello-world' },
            { text: '用 VitePress 搭建博客', link: '/posts/build-blog-with-vitepress' },
            { text: 'Markdown 写作速查', link: '/posts/markdown-cheatsheet' }
          ]
        }
      ]
    },

    // 本地全文搜索，无需任何第三方服务
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文章',
            buttonAriaLabel: '搜索文章'
          },
          modal: {
            noResultsText: '没有找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },

    // 暗色模式跟随系统，也可手动切换
    appearance: true,

    // 文章底部的上一页 / 下一页
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    outline: {
      label: '本页目录',
      level: [2, 3]
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: { dateStyle: 'short', timeStyle: 'short' }
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    // 页脚
    footer: {
      message: '基于 VitePress 构建 · 部署于 GitHub Pages',
      copyright: 'Copyright © 2024-present Oblivisera'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Oblivisera' }
    ]
  }
})
